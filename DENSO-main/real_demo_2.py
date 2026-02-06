import cv2
import numpy as np
import torch
from ultralytics import YOLO
import time
import math

from robot_new_2 import RobotArm

# ===================== CONFIG ========================
CAMERA_ID = 0

DICT_TYPE = cv2.aruco.DICT_4X4_1000
ARUCO_WORLD_CM = {
    0:   (0.0, 0.0),      
    100: (23.0, 0.0),     
    110: (23.0, 17.0),    
    10:  (0, 17.0),     
}

# ----- Robot Parameters -----
BOX_DEPTH         = 6.0
HOVER_HEIGHT      = 12.0       
PRE_GRAB_HEIGHT   = 6.5        
GRAB_HEIGHT       = 1.0        
LIFT_HEIGHT       = 10.0       

# Tọa độ đặt vật sang bên phải (Dựa trên Training Data: X=15, Z=6 -> Base ~41 độ)
PLACE_RIGHT_X     = 25.0
PLACE_RIGHT_Z     = 6.0


# Tọa độ đặt vật to (đỏ) sang bên phải
PLACE_RED_X =  25.0 
PLACE_RED_Z = 6.5
# --- RED placement safety ---
RED_PLACE_HEIGHT = 3.0   # <-- higher than GRAB_HEIGHT to avoid crushing red box



# Vị trí Home (Degrees)
HOME_BASE     = 53    
HOME_SHOULDER = 90    
HOME_ELBOW    = 0     

# Kẹp 
GRIP_OPEN    = 10
GRIP_CLOSE   = 55              
STEPS_SMOOTH = 20              

MODEL_PATH = "aug_3.pt"
CONF_THRES    = 0.40
CONF_TRIGGER  = 0.65
STABLE_FRAMES = 7
DEVICE = "mps" if torch.cuda.is_available() else "cpu"

#Sắp xếp lại thứ tự các aruco 
def sort_rectangle_points(pts):
    pts = np.array(pts)
    s = pts.sum(axis=1)
    diff = np.diff(pts, axis=1)
    tl = pts[np.argmin(s)]
    br = pts[np.argmax(s)]
    tr = pts[np.argmin(diff)]
    bl = pts[np.argmax(diff)]
    return np.array([tl, tr, br, bl], dtype=np.int32)


#Tìm tọa độ của các mã aruco 
def compute_homography(aruco_centers, world_map):
    img_pts, world_pts = [], []
    for mid, (X_cm, Z_cm) in world_map.items():
        if mid not in aruco_centers: return None
        cx, cy = aruco_centers[mid]
        img_pts.append([cx, cy])
        world_pts.append([X_cm, Z_cm])
    return cv2.findHomography(np.array(img_pts), np.array(world_pts))[0]

#Chuyển tọa độ pixel sang vị trí thực tế
def pixel_to_world(H, x_px, y_px):
    pt = np.array([[[x_px, y_px]]], dtype=np.float32)
    out = cv2.perspectiveTransform(pt, H)[0][0]
    return float(out[0]), float(out[1])

# ===================== CONTROL =======================
class PickAndPlaceRobot(RobotArm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.cur_b = HOME_BASE
        self.cur_s = HOME_SHOULDER
        self.cur_e = HOME_ELBOW
        # 1. Vị trí cánh tay ban đầu (mở tay)
        self.home(GRIP_OPEN)

    def home(self, grip):
        print(f"[ROBOT] Về Home (Grip: {grip})")
        # Về Home: Base 53, Shoulder 90 (dựng đứng), Elbow 0
        self.move_to_angles(HOME_BASE, HOME_SHOULDER, HOME_ELBOW, grip, steps=STEPS_SMOOTH)

    def move_to_angles(self, b, s, e, g, steps=STEPS_SMOOTH):
        if steps <= 1:
            self.send_cmd(b, s, e, g)
            self.cur_b, self.cur_s, self.cur_e = b, s, e
            return
        diff_b = (b - self.cur_b) / steps
        diff_s = (s - self.cur_s) / steps
        diff_e = (e - self.cur_e) / steps
        for i in range(1, steps + 1):
            self.send_cmd(self.cur_b + diff_b * i, self.cur_s + diff_s * i, self.cur_e + diff_e * i, g)
            time.sleep(0.02)
        self.cur_b, self.cur_s, self.cur_e = b, s, e

    def approach_and_pick(self, x, y, z_table):
        """Di chuyển đến vật, gắp và nhấc lên cao"""
        print(f"[PICK] Di chuyển đến X={x:.1f} Z={y:.1f}")
        
        # 1. Hover (Tiếp cận trên cao)
        self.move_to(x, y, HOVER_HEIGHT, g=GRIP_OPEN, steps=STEPS_SMOOTH) 
        time.sleep(0.2)
        
        # 2. Hạ xuống vị trí gắp
        self.move_to(x, y, GRAB_HEIGHT, g=GRIP_OPEN, steps=STEPS_SMOOTH)
        time.sleep(0.3)
        
        # 3. Kẹp vật
        print("[PICK] Kẹp vật")
        self.send_cmd(self.cur_b, self.cur_s, self.cur_e, GRIP_CLOSE)
        time.sleep(0.8) # Đợi kẹp chặt
        
        # 4. Nhấc lên (LIFT_HEIGHT) để tránh va chạm khi thu về
        print("[PICK] Nhấc vật lên")
        self.move_to(x, y, LIFT_HEIGHT, g=GRIP_CLOSE, steps=STEPS_SMOOTH)
        time.sleep(0.3)

    def place_sequence_fixed_angle(self):
        """
        Chu trình: Home -> Xoay Base 15 -> Hạ xuống -> Thả -> Về Home
        """
        # --- CẤU HÌNH GÓC THẢ VẬT ---
        TARGET_BASE   = 0  # Góc quay sang phải
        DROP_SHOULDER = 70  # Hạ vai xuống (Góc càng nhỏ càng thấp)
        DROP_ELBOW    = 40  # Duỗi khuỷu ra (Chỉnh số này nếu bị đập bàn hoặc quá cao)
        
        print(f"[PLACE] Bắt đầu chu trình thả tại góc Base={TARGET_BASE}")

        # 1. Thu về Home (Vẫn kẹp chặt vật)
        self.home(GRIP_CLOSE)
        time.sleep(0.5)

        # 2. Xoay Base sang 15 độ (Vai vẫn dựng đứng 90 để an toàn)
        self.move_to_angles(TARGET_BASE, HOME_SHOULDER, HOME_ELBOW, GRIP_CLOSE, steps=STEPS_SMOOTH)
        time.sleep(0.5)

        # 3. Hạ cánh tay xuống vị trí thả
        # B: 15, S: 45, E: 40
        self.move_to_angles(TARGET_BASE, DROP_SHOULDER, DROP_ELBOW, GRIP_CLOSE, steps=STEPS_SMOOTH)
        time.sleep(0.5)
        
        # 4. Mở tay (Thả vật)
        print("[PLACE] Thả vật")
        self.send_cmd(self.cur_b, self.cur_s, self.cur_e, GRIP_OPEN)
        time.sleep(0.5) 
        
        # 5. Nhấc tay lên lại tư thế dựng đứng (để tránh va quẹt khi quay về)
        # B: 15, S: 90, E: 0
        self.move_to_angles(TARGET_BASE, HOME_SHOULDER, HOME_ELBOW, GRIP_OPEN, steps=STEPS_SMOOTH)
        time.sleep(0.3)

        # 6. Quay lại Home Init (Kết thúc chu trình)
        self.home(GRIP_OPEN)
        print("[DONE] Đã về Home")
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.cur_b = HOME_BASE
        self.cur_s = HOME_SHOULDER
        self.cur_e = HOME_ELBOW
        # 1. Vị trí cánh tay ban đầu (mở tay)
        self.home(GRIP_OPEN)

    def home(self, grip):
        print(f"[ROBOT] Về Home (Grip: {grip})")
        self.move_to_angles(HOME_BASE, HOME_SHOULDER, HOME_ELBOW, grip, steps=STEPS_SMOOTH)

    def move_to_angles(self, b, s, e, g, steps=STEPS_SMOOTH):
        if steps <= 1:
            self.send_cmd(b, s, e, g)
            self.cur_b, self.cur_s, self.cur_e = b, s, e
            return
        diff_b = (b - self.cur_b) / steps
        diff_s = (s - self.cur_s) / steps
        diff_e = (e - self.cur_e) / steps
        for i in range(1, steps + 1):
            self.send_cmd(self.cur_b + diff_b * i, self.cur_s + diff_s * i, self.cur_e + diff_e * i, g)
            time.sleep(0.02)
        self.cur_b, self.cur_s, self.cur_e = b, s, e

    def approach_and_pick(self, x, y, z_table):
        # 3. Di chuyển đến vật phẩm (mở tay) - Hover -> Hạ thấp
        print(f"[PICK] Di chuyển đến X={x:.1f} Z={y:.1f}")
        self.move_to(x, y, HOVER_HEIGHT, g=GRIP_OPEN, steps=STEPS_SMOOTH) 
        time.sleep(0.2)
        
        self.move_to(x, y, GRAB_HEIGHT, g=GRIP_OPEN, steps=STEPS_SMOOTH)
        time.sleep(0.3)
        
        # 4. Kẹp tay
        print("[PICK] Kẹp vật")
        self.send_cmd(self.cur_b, self.cur_s, self.cur_e, GRIP_CLOSE)
        time.sleep(0.8)
        
        # Nhấc lên (An toàn)
        self.move_to(x, y, LIFT_HEIGHT, g=GRIP_CLOSE, steps=STEPS_SMOOTH)
        time.sleep(0.3)

    def place_to_right(self):
        # --- CẤU HÌNH GÓC THẢ VẬT ---
        TARGET_BASE = 15    # Góc Base mong muốn
        DROP_SHOULDER = 25  # Góc Vai khi hạ xuống (Bạn có thể chỉnh số này để vươn xa/gần)
        DROP_ELBOW = 50     # Góc Khuỷu khi hạ xuống (Bạn có thể chỉnh số này để cao/thấp)
        
        print(f"[PLACE] Xoay Base về góc {TARGET_BASE} độ")

        # 1. Xoay Base về 15 độ (Giữ Vai và Khuỷu ở vị trí cao an toàn như Home)
        # HOME_SHOULDER=90, HOME_ELBOW=0 là tư thế dựng đứng tay
        self.move_to_angles(TARGET_BASE, HOME_SHOULDER, HOME_ELBOW, GRIP_CLOSE, steps=STEPS_SMOOTH)
        time.sleep(0.3)

        # 2. Hạ tay xuống vị trí thả (Dùng góc cố định vì không dùng tọa độ)
        self.move_to_angles(TARGET_BASE, DROP_SHOULDER, DROP_ELBOW, GRIP_CLOSE, steps=STEPS_SMOOTH)
        time.sleep(0.5)

        # 3. Mở tay (Thả vật)
        print("[PLACE] Thả vật")
        self.send_cmd(TARGET_BASE, DROP_SHOULDER, DROP_ELBOW, GRIP_OPEN)
        time.sleep(0.5)

        # 4. Nhấc tay lên lại (Về tư thế an toàn)
        self.move_to_angles(TARGET_BASE, HOME_SHOULDER, HOME_ELBOW, GRIP_OPEN, steps=STEPS_SMOOTH)
        time.sleep(0.3)
        
        
        
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.cur_b = HOME_BASE
        self.cur_s = HOME_SHOULDER
        self.cur_e = HOME_ELBOW
        # 1. Vị trí cánh tay ban đầu (mở tay)
        self.home(GRIP_OPEN)

    def home(self, grip):
        print(f"[ROBOT] Về Home (Grip: {grip})")
        self.move_to_angles(HOME_BASE, HOME_SHOULDER, HOME_ELBOW, grip, steps=STEPS_SMOOTH)

    def move_to_angles(self, b, s, e, g, steps=STEPS_SMOOTH):
        if steps <= 1:
            self.send_cmd(b, s, e, g)
            self.cur_b, self.cur_s, self.cur_e = b, s, e
            return
        diff_b = (b - self.cur_b) / steps
        diff_s = (s - self.cur_s) / steps
        diff_e = (e - self.cur_e) / steps
        for i in range(1, steps + 1):
            self.send_cmd(self.cur_b + diff_b * i, self.cur_s + diff_s * i, self.cur_e + diff_e * i, g)
            time.sleep(0.02)
        self.cur_b, self.cur_s, self.cur_e = b, s, e

    def approach_and_pick(self, x, y, z_table):
        # 3. Di chuyển đến vật phẩm (mở tay) - Hover -> Hạ thấp
        print(f"[PICK] Di chuyển đến X={x:.1f} Z={y:.1f}")
        self.move_to(x, y, HOVER_HEIGHT, g=GRIP_OPEN, steps=STEPS_SMOOTH) 
        time.sleep(0.2)
        
        self.move_to(x, y, GRAB_HEIGHT, g=GRIP_OPEN, steps=STEPS_SMOOTH)
        time.sleep(0.3)
        
        # 4. Kẹp tay
        print("[PICK] Kẹp vật")
        self.send_cmd(self.cur_b, self.cur_s, self.cur_e, GRIP_CLOSE)
        time.sleep(0.8)
        
        # Nhấc lên (An toàn)
        self.home(GRIP_CLOSE)
        time.sleep(0.3)

    def place_to_right(self):
        # 5. Quay sang bên phải và đặt xuống (kẹp tay)

        print(f"[PLACE] Quay phải đến X={PLACE_RIGHT_X} Z={PLACE_RIGHT_Z}")
        
        # Di chuyển sang phải ở độ cao an toàn (Hover)
        self.move_to(PLACE_RIGHT_X, PLACE_RIGHT_Z, HOVER_HEIGHT, g=GRIP_CLOSE, steps=STEPS_SMOOTH)
        time.sleep(0.2)
        
        # Hạ xuống
        self.move_to(PLACE_RIGHT_X, PLACE_RIGHT_Z, GRAB_HEIGHT, g=GRIP_CLOSE, steps=STEPS_SMOOTH)
        time.sleep(0.5)
        
        # 6. Mở tay
        print("[PLACE] Thả vật")
        self.send_cmd(self.cur_b, self.cur_s, self.cur_e, GRIP_OPEN)
        time.sleep(0.5) 
        
        # Nhấc lên lại để tránh va quẹt
        self.move_to(PLACE_RIGHT_X, PLACE_RIGHT_Z, HOVER_HEIGHT, g=GRIP_OPEN, steps=STEPS_SMOOTH)
       
       
        
    #Vị trí đặt hộp đỏ     
    def place_to_red(self):
        print(f"[PLACE] Quay đến RED X={PLACE_RED_X} Z={PLACE_RED_Z}")

        # Hover
        self.move_to(PLACE_RED_X, PLACE_RED_Z, HOVER_HEIGHT, g=GRIP_CLOSE, steps=STEPS_SMOOTH)
        time.sleep(0.2)

        # Descend (RED uses higher height than normal grab height)
        self.move_to(PLACE_RED_X, PLACE_RED_Z, RED_PLACE_HEIGHT, g=GRIP_CLOSE, steps=STEPS_SMOOTH)
        time.sleep(0.5)

        print("[PLACE] Thả vật (RED)")
        self.send_cmd(self.cur_b, self.cur_s, self.cur_e, GRIP_OPEN)
        time.sleep(0.5)

        # Lift back up
        self.move_to(PLACE_RED_X, PLACE_RED_Z, HOVER_HEIGHT, g=GRIP_OPEN, steps=STEPS_SMOOTH)

    

# ===================== MAIN ==========================
def main():
    cap = cv2.VideoCapture(CAMERA_ID)
    if not cap.isOpened(): raise RuntimeError("❌ Cannot open camera")
    
    aruco_dict = cv2.aruco.getPredefinedDictionary(DICT_TYPE)
    aruco_params = cv2.aruco.DetectorParameters()
    detector = cv2.aruco.ArucoDetector(aruco_dict, aruco_params)

    print("[INFO] Loading YOLO...")
    model = YOLO(MODEL_PATH)
    model.to(DEVICE)
    print("[INFO] Connecting robot...")
    robot = PickAndPlaceRobot()          
    
    H = None
    stable_count = 0
    last_pos = None
    # locked_coords = None 
    locked_target = None  # (Xr, Zr, label)


    print("[INFO] Press 'q' to quit | 'r' to UNLOCK coords")

    while True:
        if locked_target is not None:
            Xr, Zr, lbl = locked_target

            print("\n" + "∞"*30)
            print(f"🚀 THỰC HIỆN CHUỖI: X={Xr:.1f} Z={Zr:.1f} | label={lbl}")
            print("∞"*30)

            robot.approach_and_pick(Xr, Zr, z_table=Zr + BOX_DEPTH/2)

            # Choose drop position based on label
            if lbl == "yellow":
                robot.place_to_right()   # existing position
            elif lbl == "red":
                robot.place_to_red()     # new placeholder position
            else:
                # fallback: treat unknown as yellow (or you can skip)
                robot.place_to_right()

            robot.home(GRIP_OPEN)

            print("✅ Hoàn thành chuỗi. Chờ lệnh reset 'r'...")
            time.sleep(3)

            locked_target = None
            print("[RESET] Sẵn sàng gắp vật mới.")

            # Chờ người dùng bấm r để gắp vật tiếp theo
            # while True:
            #     k = cv2.waitKey(10) & 0xFF
            #     if k == ord('q'): 
            #         cap.release()
            #         cv2.destroyAllWindows()
            #         robot.close()
            #         return
            #     if k == ord('r'): 
            #         locked_coords = None
            #         print("[RESET] Sẵn sàng gắp vật mới.")
            #         break
            # continue 

        ret, frame = cap.read()
        if not ret: break

        overlay = frame.copy()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        corners, ids, _ = detector.detectMarkers(gray)
        aruco_centers = {}
        if ids is not None:
            for i, mid in enumerate(ids.flatten()):
                pts = corners[i][0]
                cx, cy = int(pts[:,0].mean()), int(pts[:,1].mean())
                aruco_centers[mid] = (cx, cy)

        if all(mid in aruco_centers for mid in ARUCO_WORLD_CM):
            rect_pts = sort_rectangle_points([aruco_centers[mid] for mid in ARUCO_WORLD_CM])
            cv2.polylines(frame, [rect_pts], True, (0,200,0), 2)
            H_new = compute_homography(aruco_centers, ARUCO_WORLD_CM)
            if H_new is not None: H = H_new

        if H is not None:
            mask = np.zeros(frame.shape[:2], np.uint8)
            cv2.fillPoly(mask, [rect_pts], 255)
            masked = cv2.bitwise_and(frame, frame, mask=mask)
            results = model(masked, conf=CONF_THRES, device=DEVICE, verbose=False)


            for r in results:
                for box in r.boxes:
                    x1,y1,x2,y2 = map(int, box.xyxy[0])
                    conf = float(box.conf)
                    cls_id = int(box.cls)  # <-- add
                    lbl = model.names.get(cls_id, str(cls_id))  # <-- add (expects "red"/"yellow")

                    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                    Xw, Zw = pixel_to_world(H, cx, cy)
                    Xr = Xw
                    Zr = Zw - BOX_DEPTH / 2 + 1.2

                    cv2.rectangle(frame, (x1,y1), (x2,y2), (0,0,255), 2)
                    cv2.putText(frame, f"{lbl} X={Xr:.1f} Z={Zr:.1f}", (x1, y2+20),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)

                    if conf >= CONF_TRIGGER:
                        if last_pos and abs(Xr - last_pos[0]) < 0.6 and abs(Zr - last_pos[1]) < 0.6:
                            stable_count += 1
                        else:
                            stable_count = 1
                            last_pos = (Xr, Zr)

                        cv2.putText(frame, f"Stable {stable_count}/{STABLE_FRAMES}",
                                    (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,255,255), 2)

                        if stable_count >= STABLE_FRAMES:
                            locked_target = (Xr, Zr, lbl)
                            print(f"\nLOCKED: X={Xr:.1f} Z={Zr:.1f} | label={lbl}")


        cv2.imshow("Vision Pipeline", frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'): break
        if key == ord('r'):
            stable_count = 0
            last_pos = None
            locked_target = None

        

    cap.release()
    cv2.destroyAllWindows()
    robot.close()

if __name__ == "__main__":
    main()
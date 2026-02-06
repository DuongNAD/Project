import cv2
import numpy as np
import torch
from ultralytics import YOLO

# ================= CONFIGURATION =================
CAMERA_ID = 0
MODEL_PATH = "best_1.pt" 
CONF_THRES = 0.50       
BOX_DEPTH  = 6.0        

# Tọa độ thực của 4 mã ArUco (đơn vị: cm)
ARUCO_WORLD_CM = {
    0:   (0.0 , 0.0),      
    100: (23.0, 0.0),     
    110: (23.0, 17.0),    
    10:  (0.0, 17.0),     
}

# ================= HELPER FUNCTIONS =================
def compute_homography(aruco_centers, world_map):
    img_pts = []
    world_pts = []
    for mid, (X_cm, Z_cm) in world_map.items():
        if mid in aruco_centers:
            cx, cy = aruco_centers[mid]
            img_pts.append([cx, cy])
            world_pts.append([X_cm, Z_cm])
    if len(img_pts) < 4:
        return None
    H, _ = cv2.findHomography(np.array(img_pts), np.array(world_pts))
    return H

def pixel_to_world(H, u, v):
    if H is None: return 0, 0
    vec = np.array([u, v, 1]).reshape(3, 1)
    res = np.dot(H, vec)
    if res[2] != 0:
        X_real = res[0] / res[2]
        Z_real = res[1] / res[2]
        return float(X_real), float(Z_real)
    return 0, 0

# ================= MAIN LOOP =================
def main():
    print("⏳ Đang tải model YOLO...")
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    try:
        model = YOLO(MODEL_PATH)
    except Exception as e:
        print(f"❌ Lỗi không tìm thấy file model: {e}")
        return

    print(f"📷 Đang mở camera {CAMERA_ID}...")
    cap = cv2.VideoCapture(CAMERA_ID)
    
    aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_250)
    aruco_params = cv2.aruco.DetectorParameters()
    detector = cv2.aruco.ArucoDetector(aruco_dict, aruco_params)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Không đọc được frame từ camera.")
            break

        corners, ids, rejected = detector.detectMarkers(frame)
        
        aruco_centers = {}
        if ids is not None:
            cv2.aruco.drawDetectedMarkers(frame, corners, ids)
            ids = ids.flatten()
            for i, marker_id in enumerate(ids):
                c = corners[i][0]
                cx = int(np.mean(c[:, 0]))
                cy = int(np.mean(c[:, 1]))
                aruco_centers[marker_id] = (cx, cy)

        H = None
        if all(mid in aruco_centers for mid in ARUCO_WORLD_CM):
            H = compute_homography(aruco_centers, ARUCO_WORLD_CM)
            status_text = "Matrix: OK"
            color_status = (0, 255, 0)
        else:
            status_text = "Matrix: Missing ArUco"
            color_status = (0, 0, 255)

        cv2.putText(frame, status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color_status, 2)

        if H is not None:
            results = model(frame, conf=CONF_THRES, verbose=False, device=device)
            
            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    
                    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                    Xw, Zw = pixel_to_world(H, cx, cy)
                    
                    Xr = round(Xw, 2)
                    Zr = round(Zw - BOX_DEPTH/2 + 1.2, 2) 

                    label = f"X: {Xr} | Z: {Zr}"
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 165, 0), 2)
                    cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
                    cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                    
                    # Chỉ in ra log nhẹ nhàng để theo dõi
                    print(f"🎯 Detected: Class={cls} | Conf={conf:.2f} | Real Pos: ({Xr}, {Zr})")

        cv2.imshow("Vision Only - Coordinate Extractor", frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
import serial
import time
import math

# =============================================================================
# 1. CẤU HÌNH MASTER (ĐỒNG BỘ TUYỆT ĐỐI VỚI ARDUINO & SIMULATOR)
# =============================================================================
L1 = 11.0           # Chiều dài bắp tay (cm)
L2_TOTAL = 17.0     # Chiều dài cẳng tay (cm)
BASE_HEIGHT = 10.0   # Độ cao vai (cm)

# Tọa độ gốc Robot trong không gian ArUco
ROBOT_X = 10.7
ROBOT_Z = 29.3

OFFSET_BASE_ANGLE = 53

# Cấu hình giới hạn góc Base
vec_x_right = 32.9 - ROBOT_X  
vec_z_right = 13.8 - ROBOT_Z  
ANGLE_LIMIT_RIGHT_RAD = math.atan2(vec_x_right, -vec_z_right)
ANGLE_LIMIT_RIGHT_DEG = math.degrees(ANGLE_LIMIT_RIGHT_RAD)

class RobotArm:
    def __init__(self, port="COM9", baudrate=9600):
        self.ser = None
        # Vị trí khởi tạo mặc định
        self.cur_b, self.cur_s, self.cur_e = 53, 90, 0 
        try:
            self.ser = serial.Serial(port, baudrate, timeout=1)
            time.sleep(2) 
            print(f"[ROBOT] ✅ Đã kết nối {port}")
        except Exception:
            print(f"[ROBOT] ⚠️ Chế độ mô phỏng (Không có Serial)")

    def send_cmd(self, b_srv, s_srv, e_srv, g):
        """
        Gửi góc độ vật lý (Degrees). 
        """
        b_cmd = max(0, min(100, int(b_srv)))
        s_cmd = max(0, min(100, int(s_srv)))
        e_cmd = max(0, min(100, int(e_srv)))
        g_cmd = max(0, min(100, int(g)))
        
        cmd = f"B:{b_cmd},S:{s_cmd},E:{e_cmd},G:{g_cmd}\n"
        # print(f"[DEBUG] Góc quay: B:{b_srv:.2f},S:{s_srv:.2f},E:{e_srv:.2f},G:{g}")
        if self.ser:
            self.ser.write(cmd.encode())
            time.sleep(0.02)
        else:
            print(f"[DEBUG CMD] {cmd.strip()}")

    def move_to(self, x_cam, z_cam, y_target, g=10, steps=10):
        res = self.calculate_angles(x_cam, z_cam, y_target)
        if res:
            tgt_b, tgt_s, tgt_e = res
            if steps <= 1:
                self.send_cmd(tgt_b, tgt_s, tgt_e, g)
                self.cur_b, self.cur_s, self.cur_e = tgt_b, tgt_s, tgt_e
            else:
                # Nội suy mượt mà
                diff_b = (tgt_b - self.cur_b) / steps
                diff_s = (tgt_s - self.cur_s) / steps
                diff_e = (tgt_e - self.cur_e) / steps
                for i in range(1, steps + 1):
                    self.send_cmd(self.cur_b + diff_b*i, self.cur_s + diff_s*i, self.cur_e + diff_e*i, g)
                    time.sleep(0.03)
                self.cur_b, self.cur_s, self.cur_e = tgt_b, tgt_s, tgt_e
            return True
        return False

    def calculate_angles(self, x_target, z_target, y_target):
        # --- CẤU HÌNH HỆ SỐ BÙ TRỪ (GIỮ NGUYÊN) ---
        GAIN_BASE_X     = -2.4  
        GAIN_SHOULDER_Z = 6.4   
        GAIN_ELBOW_Z    = -8.6 

        # CẤU TRÚC: ((Cam_X, Cam_Z), (Real_X, Real_Z), (Base, Shoulder, Elbow))
        training_data = [
            ((8, 6), (7.83, 4.01), (57, 5, 72)),
            ((9, 6), (9.03, 3.85), (55, 5, 72)),
            ((10, 6), (10.08, 3.83), (53, 5, 72)),
            ((11, 6), (11.26, 3.77), (51, 5, 72)),
            ((12, 6), (12.16, 3.78), (49, 5, 72)),
            ((13, 6), (13.25, 3.80), (45, 5, 72)),
            ((14, 6), (14.35, 3.79), (43, 5, 72)),
            ((15, 6), (15.29, 3.79), (41, 5, 72)), # X=15 là bên phải (Base 41 < 53)

            ((8, 7), (7.99, 4.92), (58, 15, 53)),
            ((9, 7), (9.04, 4.86), (55, 15, 53)),
            ((10, 7), (10.11, 4.87), (53, 15, 53)),
            ((11, 7), (11.06, 4.92), (51, 15, 53)),
            ((12, 7), (12.32, 4.81), (49, 15, 53)),
            ((13, 7), (13.42, 4.93), (47, 15, 53)),
            ((14, 7), (14.32, 4.93), (44, 15, 53)),
            ((15, 7), (15.36, 4.92), (41, 15, 53)),

            ((8, 8), (7.82, 5.93), (58, 21, 39)),
            ((9, 8), (9.05, 6.01), (55, 21, 39)),
            ((10, 8), (10.09, 5.82), (53, 21, 39)),
            ((11, 8), (11.11, 5.91), (50, 21, 39)),
            ((12, 8), (12.19, 5.76), (49, 21, 39)),
            ((13, 8), (13.21, 5.91), (45, 21, 39)),
            ((14, 8), (14.29, 5.89), (42, 21, 39)),
            ((15, 8), (15.38, 5.79), (40, 21, 39)),

            ((8, 9), (8.13, 7.14), (59, 24, 33)),
            ((9, 9), (9.11, 7.08), (56, 24, 33)),
            ((10, 9), (10.18, 7.15), (54, 24, 33)),
            ((11, 9), (11.16, 7.13), (51, 24, 33)),
            ((12, 9), (12.12, 7.02), (49, 24, 33)),
            ((13, 9), (13.11, 7.08), (45, 24, 33)),
            ((14, 9), (14.39, 7.03), (42, 24, 33)),
            ((15, 9), (15.37, 7.11), (40, 24, 33)),

            ((8, 10), (8.15, 8.04), (59, 29, 23)),
            ((9, 10), (9.03, 8.1), (56, 29, 23)),
            ((10, 10), (10.15, 8.16), (54, 29, 23)),
            ((11, 10), (11.15, 8.16), (51, 29, 23)),
            ((12, 10), (12.22, 8.17), (48, 29, 23)),
            ((13, 10), (13.18, 8.18), (45, 29, 23)),
            ((14, 10), (14.32, 8.18), (42, 29, 23)),
            ((15, 10), (15.22, 8.18), (40, 29, 23)),

            ((8, 11), (8.07, 9.05), (59, 34, 15)),
            ((9, 11), (9.17, 9.06), (56, 34, 15)),
            ((10, 11), (10.13, 9.05), (54, 34, 15)),
            ((11, 11), (11.12, 9.05), (51, 34, 15)),
            ((12, 11), (12.23, 9.06), (49, 34, 15)),
            ((13, 11), (13.25, 9.06), (45, 34, 15)),
            ((14, 11), (14.33, 9.17), (43, 34, 15)),
            ((15, 11), (15.17, 9.25), (40, 34, 15)),

            ((8, 12), (7.89, 10.17), (59, 36, 10)),
            ((9, 12), (9.17, 10.06), (55, 36, 10)),
            ((10, 12), (10.13, 10.21), (53, 36, 10)),
            ((11, 12), (11.09, 10.08), (51, 36, 10)),
            ((12, 12), (12.27, 10.32), (48, 36, 10)),
            ((13, 12), (13.13, 10.25), (44, 36, 10)),
            ((14, 12), (14.32, 10.14), (42, 36, 10)),
            ((15, 12), (15.17, 10.13), (39, 36, 10)),

            ((8, 13), (7.97, 11.27), (60, 37, 5)),
            ((9, 13), (8.97, 11.32), (57, 37, 5)),
            ((10, 13), (9.94, 11.22), (54, 37, 5)),
            ((11, 13), (10.92, 11.19), (51, 37, 5)),
            ((12, 13), (12.04, 11.22), (48, 37, 5)),
            ((13, 13), (13.21, 11.32), (44, 37, 5)),
            ((14, 13), (14.32, 11.23), (41, 37, 5)),
            ((15, 13), (15.28, 11.16), (38, 37, 5))
        ]

        out_of_reach = [(18.36, 3.34), (2.16, 2.6), (4.09, 2.94)]

        for ox, oz in out_of_reach:
            if math.sqrt((x_target - ox)**2 + (z_target - oz)**2) < 1.0:
                print(f"❌ Điểm ({x_target}, {z_target}) nằm trong vùng không với tới!")
                return None

        min_dist = float('inf')
        best_record = None
        
        for record in training_data:
            (cx, cz), _, _ = record
            dist = math.sqrt((x_target - cx)**2 + (z_target - cz)**2)
            if dist < min_dist:
                min_dist = dist
                best_record = record
        
        if best_record is None or min_dist > 10.0: 
            print("⚠️ Mục tiêu quá xa các điểm dữ liệu mẫu!")
            return None

        (ref_x, ref_z), _, (ref_b, ref_s, ref_e) = best_record
        delta_x = x_target - ref_x
        delta_z = z_target - ref_z

        final_b = ref_b + (delta_x * GAIN_BASE_X)
        final_s = ref_s + (delta_z * GAIN_SHOULDER_Z)
        final_e = ref_e + (delta_z * GAIN_ELBOW_Z)

        final_b = max(0, min(100, final_b))
        final_s = max(0, min(100, final_s))
        final_e = max(0, min(100, final_e))

        # print(f"[IK] Cam({x_target:.1f},{z_target:.1f}) -> Gần: ({ref_x},{ref_z}) | Góc: {final_b:.0f},{final_s:.0f},{final_e:.0f}")
        return final_b, final_s, final_e

    def close(self):
        if self.ser: self.ser.close()
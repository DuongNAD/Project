"""
Realtime detection with coordinates (X, Y, Z)
Classes:
  - LABEL   (blue)
  - PACKAGE (green)

Coordinate system:
  - (0, 0)  : center of camera
  - x > 0   : right
  - x < 0   : left
  - y > 0   : above
  - y < 0   : below
Z:
  - estimated from bounding box height
  - smoothed with moving average

Exit: press 'q' or ESC
"""

import cv2
import torch
from ultralytics import YOLO
from collections import deque


MODEL_PATH = "best_1.pt"    
CAMERA_ID = 0
CONF_THRES = 0.25            

# relative unit (e.g. cm*px)
K_Z = 10000.0

# moving average window
Z_SMOOTH_WINDOW = 5          

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

CLASS_NAMES = {
    0: "LABEL",
    1: "PACKAGE"
}

CLASS_COLORS = {
    0: (255, 0, 0), 
    1: (0, 255, 0)   
}

print("Loading YOLO model...")
model = YOLO(MODEL_PATH)
model.to(DEVICE)
print(f"Model running on {DEVICE}")



cap = cv2.VideoCapture(CAMERA_ID, cv2.CAP_DSHOW)
if not cap.isOpened():
    raise RuntimeError("Cannot open webcam")

print("Webcam opened")


z_buffer = deque(maxlen=Z_SMOOTH_WINDOW)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    H, W = frame.shape[:2]
    cx_img = W // 2
    cy_img = H // 2

    results = model(frame, conf=CONF_THRES, device=DEVICE, verbose=False)

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])

            if conf < CONF_THRES:
                continue

            x1, y1, x2, y2 = map(int, box.xyxy[0])

            cx = int((x1 + x2) / 2)
            cy = int((y1 + y2) / 2)

            x_rel = cx - cx_img
            y_rel = cy_img - cy

            box_height = y2 - y1
            if box_height > 0:
                z_raw = K_Z / box_height
                z_buffer.append(z_raw)
                z_est = sum(z_buffer) / len(z_buffer)
            else:
                z_est = 0.0

            color = CLASS_COLORS.get(cls_id, (0, 255, 255))
            name = CLASS_NAMES.get(cls_id, f"class_{cls_id}")

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.circle(frame, (cx, cy), 4, (0, 0, 255), -1)

            label_text = f"{name} X:{x_rel} Y:{y_rel} Z:{z_est:.1f}"
            cv2.putText(
                frame,
                label_text,
                (x1, y1 - 8),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                2
            )

            print({
                "class": name,
                "x_px": x_rel,
                "y_px": y_rel,
                "z_est": round(z_est, 2),
                "confidence": round(conf, 3)
            })

    cv2.circle(frame, (cx_img, cy_img), 5, (0, 0, 255), -1)

    cv2.imshow("YOLO Realtime (LABEL & PACKAGE) - XYZ", frame)

    key = cv2.waitKey(1) & 0xFF
    if key == ord('q') or key == 27:
        print("[INFO] Exit pressed")
        break

cap.release()
cv2.destroyAllWindows()
print("Camera released, program ended")

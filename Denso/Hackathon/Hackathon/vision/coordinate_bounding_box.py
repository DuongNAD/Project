"""
Realtime BOX detection with (X, Y, Z) estimation
Camera: Laptop webcam
Depth: Estimated from bounding box size
"""

import cv2
import torch
from ultralytics import YOLO

MODEL_PATH = r"D:\WORK\Python\Hackathon\models\best.pt"
CAMERA_ID = 0
CONF_THRES = 0.4

# Calibration constant (adjust after testing)
K = 10000.0   

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

model = YOLO(MODEL_PATH)
model.to(DEVICE)

cap = cv2.VideoCapture(CAMERA_ID, cv2.CAP_DSHOW)
if not cap.isOpened():
    raise RuntimeError("Cannot open camera")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame, conf=CONF_THRES, device=DEVICE, verbose=False)

    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])

            cx = int((x1 + x2) / 2)
            cy = int((y1 + y2) / 2)

            box_height = y2 - y1
            if box_height > 0:
                z = K / box_height
            else:
                z = 0

            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.circle(frame, (cx, cy), 4, (0, 0, 255), -1)

            label = f"X:{cx} Y:{cy} Z:{z:.1f}"
            cv2.putText(
                frame,
                label,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 0, 0),
                2
            )

            print({
                "x": cx,
                "y": cy,
                "z": round(z, 2)
            })

    cv2.imshow("YOLO11 BOX XYZ", frame)

    key = cv2.waitKey(1) & 0xFF
    if key == ord('q') or key == 27:
        break

cap.release()
cv2.destroyAllWindows()

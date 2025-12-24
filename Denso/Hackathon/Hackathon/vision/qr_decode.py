import cv2
import numpy as np

# ================= CAMERA SETTINGS =================
CAMERA_ID = 0
FRAME_WIDTH = 1280
FRAME_HEIGHT = 720
# ================================================

cap = cv2.VideoCapture(CAMERA_ID)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)

if not cap.isOpened():
    print("ERROR: Cannot open camera")
    exit()

qr_detector = cv2.QRCodeDetector()

print("Press 'q' to quit")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Detect & decode QR
    data, points, _ = qr_detector.detectAndDecode(frame)

    if points is not None and data != "":
        points = points.astype(int)

        # Draw bounding box
        for i in range(4):
            pt1 = tuple(points[0][i])
            pt2 = tuple(points[0][(i + 1) % 4])
            cv2.line(frame, pt1, pt2, (0, 255, 0), 2)

        # Draw decoded text
        x, y = points[0][0]
        cv2.putText(
            frame,
            f"QR: {data}",
            (x, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2
        )

    cv2.imshow("QR Code Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

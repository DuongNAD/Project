import cv2
from ultralytics import YOLO


MODEL_PATH = r"D:\WORK\Python\Hackathon\models\best.pt"  
model = YOLO(MODEL_PATH)

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise RuntimeError("Could not open webcam")

# -----------------------------
# Real-time inference loop
# -----------------------------
while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Run YOLO inference
    results = model(
        frame,
        conf=0.5,       # confidence threshold
        iou=0.5,
        device=0        # 0 = GPU, "cpu" = CPU
    )

    # Render results on frame
    annotated_frame = results[0].plot()

    # Show frame
    cv2.imshow("YOLO Realtime Detection", annotated_frame)

    # Press 'q' to exit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

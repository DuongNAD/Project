import cv2
import numpy as np

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise RuntimeError("Camera not found")


MIN_AREA = 3000
ASPECT_RATIO_TOL = 0.25   # how square it must be

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Resize for speed
    frame = cv2.resize(frame, (640, 480))

    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    lower_brown = np.array([10, 40, 40])
    upper_brown = np.array([30, 255, 255])

    mask = cv2.inRange(hsv, lower_brown, upper_brown)


    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)


    edges = cv2.Canny(mask, 50, 150)


    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < MIN_AREA:
            continue

        # Approximate polygon
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)

        # Look for rectangles (4 corners)
        if len(approx) == 4:
            x, y, w, h = cv2.boundingRect(approx)
            aspect_ratio = w / float(h)

            # Square-like filter
            if abs(1 - aspect_ratio) < ASPECT_RATIO_TOL:
                # Draw box
                cv2.drawContours(frame, [approx], -1, (0, 255, 0), 2)

                cx = x + w // 2
                cy = y + h // 2

                cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
                cv2.putText(
                    frame,
                    "Wooden Box",
                    (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )

                # Print position (for robot arm usage)
                print(f"Box center: x={cx}, y={cy}")


    cv2.imshow("Wooden Square Box Tracking", frame)
    cv2.imshow("Mask", mask)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

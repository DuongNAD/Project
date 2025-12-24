import cv2
import numpy as np

# ================= CONFIG =================
CAMERA_ID = 0
DICT_TYPE = cv2.aruco.DICT_4X4_1000
ALIGN_TOLERANCE = 15  # pixels (adjust if needed)
# ==========================================

cap = cv2.VideoCapture(CAMERA_ID)

aruco_dict = cv2.aruco.getPredefinedDictionary(DICT_TYPE)
aruco_params = cv2.aruco.DetectorParameters()
detector = cv2.aruco.ArucoDetector(aruco_dict, aruco_params)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    corners, ids, _ = detector.detectMarkers(gray)

    centers = []  # (x, y, id)

    if ids is not None:
        for i, marker_id in enumerate(ids.flatten()):
            pts = corners[i][0]

            # -------- CENTER --------
            cx = int(pts[:, 0].mean())
            cy = int(pts[:, 1].mean())

            centers.append((cx, cy, marker_id))

            # -------- DRAW CENTER POINT --------
            cv2.circle(frame, (cx, cy), 4, (0, 0, 255), -1)

            # -------- DRAW ID ONLY --------
            cv2.putText(
                frame,
                f"ID:{marker_id}",
                (cx + 6, cy - 6),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 0),
                2
            )

        # -------- CONNECT CENTERS (NO DIAGONALS) --------
        for i in range(len(centers)):
            x1, y1, _ = centers[i]
            for j in range(i + 1, len(centers)):
                x2, y2, _ = centers[j]

                # Vertical connection
                if abs(x1 - x2) < ALIGN_TOLERANCE:
                    cv2.line(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

                # Horizontal connection
                elif abs(y1 - y2) < ALIGN_TOLERANCE:
                    cv2.line(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

    cv2.imshow("ArUco Shelf Map (2D)", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

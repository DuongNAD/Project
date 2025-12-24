import cv2
import numpy as np

# ================= CONFIG =================
CAMERA_ID = 0
DICT_TYPE = cv2.aruco.DICT_4X4_1000
FILL_COLOR = (0, 255, 0)     # Green
FILL_ALPHA = 0.35            # Transparency
# ==========================================

cap = cv2.VideoCapture(CAMERA_ID)

aruco_dict = cv2.aruco.getPredefinedDictionary(DICT_TYPE)
aruco_params = cv2.aruco.DetectorParameters()
detector = cv2.aruco.ArucoDetector(aruco_dict, aruco_params)

def sort_rectangle_points(pts):
    """
    Sort 4 points as: TL, TR, BR, BL
    """
    pts = np.array(pts)
    s = pts.sum(axis=1)
    diff = np.diff(pts, axis=1)

    tl = pts[np.argmin(s)]
    br = pts[np.argmax(s)]
    tr = pts[np.argmin(diff)]
    bl = pts[np.argmax(diff)]

    return np.array([tl, tr, br, bl], dtype=np.int32)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    overlay = frame.copy()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    corners, ids, _ = detector.detectMarkers(gray)

    centers = []

    if ids is not None and len(ids) >= 4:
        for i, marker_id in enumerate(ids.flatten()):
            pts = corners[i][0]

            # -------- CENTER --------
            cx = int(pts[:, 0].mean())
            cy = int(pts[:, 1].mean())
            centers.append((cx, cy))

            # -------- DRAW CENTER (OPTIONAL) --------
            cv2.circle(frame, (cx, cy), 4, (0, 0, 255), -1)
            cv2.putText(
                frame,
                f"ID:{marker_id}",
                (cx + 6, cy - 6),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 0),
                2
            )

        # -------- DRAW FILLED RECTANGLE --------
        if len(centers) == 4:
            rect_pts = sort_rectangle_points(centers)

            cv2.fillPoly(
                overlay,
                [rect_pts],
                FILL_COLOR
            )

            # Blend overlay with original frame
            cv2.addWeighted(
                overlay,
                FILL_ALPHA,
                frame,
                1 - FILL_ALPHA,
                0,
                frame
            )

            # Optional outline
            cv2.polylines(frame, [rect_pts], True, (0, 200, 0), 2)

    cv2.imshow("ArUco Shelf Cell (Filled)", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

import cv2
import numpy as np

# ================= CONFIG =================
CAMERA_ID = 0
DICT_TYPE = cv2.aruco.DICT_4X4_1000
MARKER_SIZE = 0.05  # meters (5 cm)
# ==========================================

# -------- Camera calibration (REPLACE with real data) --------
camera_matrix = np.array([
    [800, 0, 320],
    [0, 800, 240],
    [0, 0, 1]
], dtype=np.float32)

dist_coeffs = np.zeros((5, 1))
# ------------------------------------------------------------

def draw_axis_at_corner(frame, rvec, tvec, camera_matrix, dist_coeffs, marker_size):
    """
    Draw 3D pose axes at the TOP-LEFT corner of the ArUco marker.
    """

    # Ensure correct shape (3,1)
    rvec = rvec.reshape(3, 1)
    tvec = tvec.reshape(3, 1)

    # Offset for TOP-LEFT corner in marker coordinate frame
    corner_offset = np.array([
        [-marker_size / 2],
        [-marker_size / 2],
        [0]
    ], dtype=np.float32)

    # Convert rvec to rotation matrix
    R, _ = cv2.Rodrigues(rvec)

    # Apply rotation and translation
    corner_tvec = tvec + R @ corner_offset

    # Ensure correct shape again
    corner_tvec = corner_tvec.reshape(3, 1)

    # Draw axis
    cv2.drawFrameAxes(
        frame,
        camera_matrix,
        dist_coeffs,
        rvec,
        corner_tvec,
        marker_size * 0.5
    )


# ================= MAIN =================
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

    if ids is not None:

        # ---------- POSE ESTIMATION ----------
        rvecs, tvecs, _ = cv2.aruco.estimatePoseSingleMarkers(
            corners,
            MARKER_SIZE,
            camera_matrix,
            dist_coeffs
        )

        for i, marker_id in enumerate(ids.flatten()):
            pts = corners[i][0].astype(int)

            # ---------- DRAW BOUNDING BOX ----------
            cv2.polylines(
                frame,
                [pts],
                isClosed=True,
                color=(0, 255, 0),
                thickness=2
            )

            # ---------- CENTER ----------
            cx = int(pts[:, 0].mean())
            cy = int(pts[:, 1].mean())
            cv2.circle(frame, (cx, cy), 4, (0, 0, 255), -1)

            # ---------- DECODE XYZ ----------
            x = marker_id // 100
            y = (marker_id // 10) % 10
            z = marker_id % 10

            # ---------- DRAW TEXT ----------
            cv2.putText(
                frame,
                f"ID:{marker_id} ({x},{y},{z})",
                (cx - 40, cy - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 0, 0),
                2
            )

            # ---------- DRAW AXIS AT CORNER ----------
            draw_axis_at_corner(
                frame,
                rvecs[i],
                tvecs[i],
                camera_matrix,
                dist_coeffs,
                MARKER_SIZE
            )

    cv2.imshow("ArUco Detection (Axis at Corner)", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

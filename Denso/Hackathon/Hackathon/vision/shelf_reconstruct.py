import cv2
import numpy as np

# =====================================================
# SHELF CONFIGURATION (mm)
# =====================================================
W1 = 600
W2 = 400
H  = 400
SHELF_WIDTH = W1 + W2

CELL_W = 100
CELL_H = 100

# =====================================================
# ROBOT CONFIGURATION
# =====================================================
ROBOT_OFFSET = np.array([300, 200, 0])
Z_SHELF = 150
SAFE_Z = 80

# =====================================================
# RED DOT DETECTION
# =====================================================
def detect_red_dots(image):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    lower1 = np.array([0, 120, 80])
    upper1 = np.array([10, 255, 255])
    lower2 = np.array([160, 120, 80])
    upper2 = np.array([179, 255, 255])

    mask = cv2.inRange(hsv, lower1, upper1) | cv2.inRange(hsv, lower2, upper2)

    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL,
                                   cv2.CHAIN_APPROX_SIMPLE)

    centers = []
    for c in contours:
        if cv2.contourArea(c) < 150:
            continue
        M = cv2.moments(c)
        if M["m00"] == 0:
            continue
        cx = int(M["m10"] / M["m00"])
        cy = int(M["m01"] / M["m00"])
        centers.append([cx, cy])

    return np.array(centers, dtype=np.float32)

# =====================================================
# SORT CORNERS
# =====================================================
def sort_corners(pts):
    s = pts.sum(axis=1)
    diff = np.diff(pts, axis=1)

    tl = pts[np.argmin(s)]
    br = pts[np.argmax(s)]
    tr = pts[np.argmin(diff)]
    bl = pts[np.argmax(diff)]

    return np.array([tl, tr, br, bl], dtype=np.float32)

# =====================================================
# CALIBRATION
# =====================================================
def calibrate_shelf(frame):
    dots = detect_red_dots(frame)
    if len(dots) != 4:
        return None, None

    img_pts = sort_corners(dots)

    shelf_pts = np.array([
        [0, 0],
        [SHELF_WIDTH, 0],
        [SHELF_WIDTH, H],
        [0, H]
    ], dtype=np.float32)

    H_mat, _ = cv2.findHomography(img_pts, shelf_pts)
    return H_mat, img_pts

# =====================================================
# IMAGE → SHELF
# =====================================================
def image_to_shelf(u, v, H_mat):
    pt = np.array([u, v, 1.0])
    out = H_mat @ pt
    out /= out[2]
    return out[0], out[1]

# =====================================================
# SHELF → GRID
# =====================================================
def shelf_to_grid(Xs, Ys):
    row = int(Ys // CELL_H)
    col = int(Xs // CELL_W)
    region = "A" if Xs < W1 else "B"
    return row, col, region

# =====================================================
# SHELF → ROBOT
# =====================================================
def shelf_to_robot(Xs, Ys):
    return np.array([Xs, Ys, Z_SHELF]) + ROBOT_OFFSET

# =====================================================
# CLICK TO SELECT TARGET
# =====================================================
target_pixel = None

def mouse_cb(event, x, y, flags, param):
    global target_pixel
    if event == cv2.EVENT_LBUTTONDOWN:
        target_pixel = (x, y)

# =====================================================
# MAIN
# =====================================================
def main():
    global target_pixel

    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    print("Waiting for 4 red dots (shelf corners)...")

    H_mat = None

    while H_mat is None:
        ret, frame = cap.read()
        if not ret:
            return

        H_mat, corners = calibrate_shelf(frame)

        vis = frame.copy()
        if corners is not None:
            for i, (x, y) in enumerate(corners):
                cv2.circle(vis, (int(x), int(y)), 8, (0,255,0), -1)
                cv2.putText(vis, str(i), (int(x)+5, int(y)-5),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)

        cv2.putText(vis,
                    "Show 4 red dots to calibrate",
                    (30, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)

        cv2.imshow("Calibration", vis)
        if cv2.waitKey(1) == 27:
            return

    print("Calibration done.")
    cv2.destroyWindow("Calibration")

    cv2.namedWindow("Live")
    cv2.setMouseCallback("Live", mouse_cb)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if target_pixel is not None:
            u, v = target_pixel
            Xs, Ys = image_to_shelf(u, v, H_mat)
            row, col, region = shelf_to_grid(Xs, Ys)
            robot = shelf_to_robot(Xs, Ys)
            approach = robot + np.array([0, 0, SAFE_Z])

            cv2.circle(frame, (u, v), 6, (255, 0, 0), -1)
            cv2.putText(frame,
                        f"Shelf({Xs:.1f},{Ys:.1f}) R{row}C{col}",
                        (u+10, v),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.7, (255,0,0), 2)

            print(f"[TARGET] Shelf=({Xs:.1f},{Ys:.1f}) "
                  f"Robot={robot} "
                  f"Approach={approach}")

        cv2.imshow("Live", frame)
        if cv2.waitKey(1) == 27:
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()

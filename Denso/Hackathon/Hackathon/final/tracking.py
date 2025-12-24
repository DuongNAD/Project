import cv2
import numpy as np
import math

# -----------------------------
# Robot arm dimensions (cm)
# -----------------------------
L1 = 10.0  # shoulder link
L2 = 10.0  # elbow link

# -----------------------------
# Camera calibration
# -----------------------------
PIXEL_TO_CM = 0.05

# -----------------------------
# 4-DOF Inverse Kinematics
# -----------------------------
def inverse_kinematics_4dof(x, y, z):
    # Base rotation
    theta0 = math.atan2(x, z)

    # Planar distance
    r = math.sqrt(x**2 + z**2)

    d = r**2 + y**2
    cos_theta2 = (d - L1**2 - L2**2) / (2 * L1 * L2)

    if abs(cos_theta2) > 1:
        return None

    theta2 = math.acos(cos_theta2)

    k1 = L1 + L2 * math.cos(theta2)
    k2 = L2 * math.sin(theta2)

    theta1 = math.atan2(y, r) - math.atan2(k2, k1)

    # Convert to degrees
    return (
        math.degrees(theta0),
        math.degrees(theta1),
        math.degrees(theta2)
    )

# -----------------------------
# Camera
# -----------------------------
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise RuntimeError("Camera not found")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.resize(frame, (640, 480))
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (9, 9), 2)

    # -----------------------------
    # Detect circle
    # -----------------------------
    circles = cv2.HoughCircles(
        gray,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=50,
        param1=100,
        param2=30,
        minRadius=10,
        maxRadius=80
    )

    if circles is not None:
        circles = np.round(circles[0]).astype(int)
        x_px, y_px, r_px = circles[0]

        cv2.circle(frame, (x_px, y_px), r_px, (0, 255, 0), 2)
        cv2.circle(frame, (x_px, y_px), 5, (0, 0, 255), -1)

        # -----------------------------
        # Image → world coordinates
        # -----------------------------
        X = (x_px - 320) * PIXEL_TO_CM
        Y = (480 - y_px) * PIXEL_TO_CM
        Z = 20.0  # fixed depth (table distance)

        ik = inverse_kinematics_4dof(X, Y, Z)

        if ik:
            base, shoulder, elbow = ik
            gripper = 30 if r_px > 30 else 10  # example logic

            text = f"B:{base:.1f} S:{shoulder:.1f} E:{elbow:.1f} G:{gripper}"
            cv2.putText(frame, text, (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            print(f"{base:.2f},{shoulder:.2f},{elbow:.2f},{gripper}")

        else:
            cv2.putText(frame, "Unreachable", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

    cv2.imshow("4DOF Circle Tracking + IK", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

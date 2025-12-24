import cv2
import numpy as np

def preprocess_gray(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Normalize lighting (important for wood)
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )
    gray = clahe.apply(gray)

    # Remove grain noise
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    return gray

def main():
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = preprocess_gray(frame)

        # Edge detection on GRAYSCALE ONLY
        edges = cv2.Canny(
            gray,
            threshold1=50,
            threshold2=150,
            apertureSize=3
        )

        # Visualization
        cv2.imshow("Grayscale", gray)
        cv2.imshow("Edges (Grayscale)", edges)

        if cv2.waitKey(1) == 27:
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()


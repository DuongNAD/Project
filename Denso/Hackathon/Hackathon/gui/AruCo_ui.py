import cv2
import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk

# -------- CONFIG --------
DICT_TYPE = cv2.aruco.DICT_4X4_1000
MARKER_SIZE = 300
# ------------------------

aruco_dict = cv2.aruco.getPredefinedDictionary(DICT_TYPE)

def generate_marker():
    try:
        x = int(entry_x.get())
        y = int(entry_y.get())
        z = int(entry_z.get())

        if not (0 <= x <= 9 and 0 <= y <= 9 and 0 <= z <= 9):
            raise ValueError

        marker_id = x * 100 + y * 10 + z

        marker_img = cv2.aruco.generateImageMarker(
            aruco_dict,
            marker_id,
            MARKER_SIZE
        )

        cv2.imwrite(f"aruco_x{x}_y{y}_z{z}.png", marker_img)

        img = Image.fromarray(marker_img)
        img_tk = ImageTk.PhotoImage(img)
        panel.config(image=img_tk)
        panel.image = img_tk

        label_id.config(text=f"Generated ArUco ID: {marker_id}")

    except ValueError:
        messagebox.showerror(
            "Invalid Input",
            "X, Y, Z must be integers between 0 and 9"
        )

# -------- GUI --------
root = tk.Tk()
root.title("ArUco Shelf Marker Generator")

tk.Label(root, text="X").grid(row=0, column=0)
tk.Label(root, text="Y").grid(row=1, column=0)
tk.Label(root, text="Z").grid(row=2, column=0)

entry_x = tk.Entry(root)
entry_y = tk.Entry(root)
entry_z = tk.Entry(root)

entry_x.grid(row=0, column=1)
entry_y.grid(row=1, column=1)
entry_z.grid(row=2, column=1)

tk.Button(
    root,
    text="Generate ArUco",
    command=generate_marker
).grid(row=3, column=0, columnspan=2, pady=10)

label_id = tk.Label(root, text="Generated ArUco ID: -")
label_id.grid(row=4, column=0, columnspan=2)

panel = tk.Label(root)
panel.grid(row=5, column=0, columnspan=2)

root.mainloop()

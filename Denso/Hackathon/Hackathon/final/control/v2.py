import math
import time
import tkinter as tk
from tkinter import messagebox
import serial

# ================= ARM GEOMETRY =================
L1 = 2.5
L2 = 10.8
L3 = 10.0

# ================= SERVO REFERENCE =================
BASE_ZERO = 90
SHOULDER_ZERO = 90
ELBOW_ZERO = 90

# Gripper presets
GRIP_OPEN = 10
GRIP_CLOSE = 32
RESET_GRIP = 32

SERVO_MIN = 0
SERVO_MAX = 180

# ================= SERIAL CONFIG =================
SERIAL_PORT = "COM5"
BAUDRATE = 115200


# ---------------- IK ----------------
def inverse_kinematics(x, y, z):
    base = math.degrees(math.atan2(z, x))
    r = math.sqrt(x*x + z*z)
    y_eff = y - L1

    D = (r*r + y_eff*y_eff - L2*L2 - L3*L3) / (2 * L2 * L3)
    D = max(-1, min(1, D))
    elbow = math.degrees(math.acos(D))

    shoulder = math.degrees(
        math.atan2(y_eff, r) -
        math.atan2(
            L3 * math.sin(math.radians(elbow)),
            L2 + L3 * math.cos(math.radians(elbow))
        )
    )

    return base, shoulder, elbow


def reachable(x, y, z):
    r = math.sqrt(x*x + z*z)
    y_eff = y - L1
    return math.sqrt(r*r + y_eff*y_eff) <= (L2 + L3)


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


# ---------------- FK ----------------
def forward_kinematics(base, shoulder, elbow):
    b = math.radians(base - BASE_ZERO)
    s = math.radians(SHOULDER_ZERO - shoulder)
    e = math.radians(elbow - ELBOW_ZERO)

    r = L2 * math.cos(s) + L3 * math.cos(s + e)
    y = L1 + L2 * math.sin(s) + L3 * math.sin(s + e)
    x = r * math.cos(b)
    z = r * math.sin(b)
    return x, y, z


# ---------------- GUI ----------------
class RobotGUI:
    def __init__(self, root):
        self.root = root
        root.title("Pick & Place + Manual Control")

        self.ser = None
        self.build_ui()
        self.connect_serial()

    def build_ui(self):
        row = 0
        # -------- PICK --------
        tk.Label(self.root, text="PICK POSITION", font=("Arial", 10, "bold")).grid(row=row, column=0, columnspan=2)
        row += 1
        self.pick_x = self.make_entry("X", row); row += 1
        self.pick_y = self.make_entry("Y", row); row += 1
        self.pick_z = self.make_entry("Z", row); row += 1
        tk.Button(self.root, text="MOVE TO PICK", command=self.move_pick)\
            .grid(row=row, column=0, columnspan=2, pady=4)
        row += 1

        # -------- PLACE --------
        tk.Label(self.root, text="PLACE POSITION", font=("Arial", 10, "bold")).grid(row=row, column=0, columnspan=2)
        row += 1
        self.place_x = self.make_entry("X", row); row += 1
        self.place_y = self.make_entry("Y", row); row += 1
        self.place_z = self.make_entry("Z", row); row += 1
        tk.Button(self.root, text="MOVE TO PLACE", command=self.move_place)\
            .grid(row=row, column=0, columnspan=2, pady=4)
        row += 1

        # -------- RESET BUTTON --------
        tk.Button(self.root, text="RESET (90,90,90,32)", command=self.reset_arm)\
            .grid(row=row, column=0, columnspan=2, pady=4)
        row += 1

        # -------- GRIPPER BUTTONS --------
        tk.Label(self.root, text="Gripper Control", font=("Arial", 10, "bold")).grid(row=row, column=0, columnspan=2)
        row += 1
        tk.Button(self.root, text="OPEN", command=self.gripper_open).grid(row=row, column=0, pady=4)
        tk.Button(self.root, text="CLOSE", command=self.gripper_close).grid(row=row, column=1, pady=4)
        row += 1

        # -------- SLIDERS --------
        tk.Label(self.root, text="Manual Servo Control", font=("Arial", 10, "bold")).grid(row=row, column=0, columnspan=2)
        row += 1
        self.base_slider = self.make_slider("Base", 90, row); row += 1
        self.shoulder_slider = self.make_slider("Shoulder", 90, row); row += 1
        self.elbow_slider = self.make_slider("Elbow", 90, row); row += 1
        self.gripper_slider = self.make_slider("Gripper", 32, row); row += 1

        # -------- FK OUTPUT --------
        self.xyz_label = tk.Label(self.root, text="FK XYZ: --")
        self.xyz_label.grid(row=row, column=0, columnspan=2)
        row += 1

        # -------- STATUS --------
        self.status = tk.Label(self.root, text="Status: Ready")
        self.status.grid(row=row, column=0, columnspan=2)

    def make_entry(self, label, row):
        tk.Label(self.root, text=label).grid(row=row, column=0)
        e = tk.Entry(self.root)
        e.grid(row=row, column=1)
        return e

    def make_slider(self, name, init, row):
        tk.Label(self.root, text=name).grid(row=row, column=0)
        s = tk.Scale(self.root, from_=SERVO_MIN, to=SERVO_MAX, orient=tk.HORIZONTAL,
                     length=400, resolution=1, command=self.slider_changed)
        s.set(init)
        s.grid(row=row, column=1)
        return s

    def connect_serial(self):
        try:
            self.ser = serial.Serial(SERIAL_PORT, BAUDRATE, timeout=1)
            time.sleep(2)
            self.status.config(text="Connected to Arduino")
        except Exception as e:
            messagebox.showerror("Serial Error", str(e))
            self.root.destroy()

    # -------- RESET ARM --------
    def reset_arm(self):
        self.send_servo_cmd(90, 90, 90, RESET_GRIP)
        self.base_slider.set(90)
        self.shoulder_slider.set(90)
        self.elbow_slider.set(90)
        self.gripper_slider.set(RESET_GRIP)
        self.status.config(text="Arm reset to home (90,90,90,32)")
        self.root.update()
        time.sleep(0.3)

    # -------- GRIPPER BUTTONS --------
    def gripper_open(self):
        self.gripper_slider.set(GRIP_OPEN)
        self.send_servo_cmd(self.base_slider.get(),
                            self.shoulder_slider.get(),
                            self.elbow_slider.get(),
                            GRIP_OPEN)
        self.status.config(text="Gripper Opened")

    def gripper_close(self):
        self.gripper_slider.set(GRIP_CLOSE)
        self.send_servo_cmd(self.base_slider.get(),
                            self.shoulder_slider.get(),
                            self.elbow_slider.get(),
                            GRIP_CLOSE)
        self.status.config(text="Gripper Closed")

    # -------- PICK / PLACE --------
    def move_pick(self):
        self.move_xyz_via_reset(self.pick_x, self.pick_y, self.pick_z, "Moved to PICK position")

    def move_place(self):
        self.move_xyz_via_reset(self.place_x, self.place_y, self.place_z, "Moved to PLACE position")

    def move_xyz_via_reset(self, x_entry, y_entry, z_entry, msg):
        self.reset_arm()
        self.root.update()
        time.sleep(0.3)
        self.move_xyz(x_entry, y_entry, z_entry, msg)

    def move_xyz(self, x_entry, y_entry, z_entry, msg):
        try:
            x = float(x_entry.get())
            y = float(y_entry.get())
            z = float(z_entry.get())

            if not reachable(x, y, z):
                messagebox.showwarning("IK Error", "Target out of reach")
                return

            b, s, e = inverse_kinematics(x, y, z)
            base = clamp(BASE_ZERO + b, SERVO_MIN, SERVO_MAX)
            shoulder = clamp(SHOULDER_ZERO - s, SERVO_MIN, SERVO_MAX)
            elbow = clamp(ELBOW_ZERO + e, SERVO_MIN, SERVO_MAX)

            # Move elbow and shoulder first
            self.send_servo_cmd(base, shoulder, elbow, self.gripper_slider.get(), move_order="shoulder_elbow_first")

            # Update sliders
            self.base_slider.set(base)
            self.shoulder_slider.set(shoulder)
            self.elbow_slider.set(elbow)

            self.status.config(text=msg)

        except ValueError:
            messagebox.showerror("Input Error", "Invalid XYZ values")

    # -------- SLIDER → FK + SERIAL --------
    def slider_changed(self, _):
        base = self.base_slider.get()
        shoulder = self.shoulder_slider.get()
        elbow = self.elbow_slider.get()
        grip = self.gripper_slider.get()

        x, y, z = forward_kinematics(base, shoulder, elbow)
        self.xyz_label.config(text=f"FK XYZ: X={x:.2f}, Y={y:.2f}, Z={z:.2f}")

        self.send_servo_cmd(base, shoulder, elbow, grip)

    # -------- SERIAL COMMAND --------
    def send_servo_cmd(self, base, shoulder, elbow, grip, move_order=None):
        if not self.ser:
            return

        if move_order == "shoulder_elbow_first":
            # Move shoulder and elbow first
            cmd1 = f"B:{base},S:{shoulder},E:{elbow},G:{grip}\n"
            # Optional: you could implement separate sends for elbow+shoulder first, then base
            self.ser.write(cmd1.encode())
            time.sleep(0.1)
        else:
            cmd = f"B:{base},S:{shoulder},E:{elbow},G:{grip}\n"
            self.ser.write(cmd.encode())


# ---------------- MAIN ----------------
if __name__ == "__main__":
    root = tk.Tk()
    RobotGUI(root)
    root.mainloop()

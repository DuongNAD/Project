import math
import time
import tkinter as tk
from tkinter import messagebox
import serial   # MUST be pyserial

L1 = 2.5
L2 = 10.8
L3 = 10.0

# ================= SERVO REFERENCE =====================
BASE_ZERO = 90
SHOULDER_ZERO = 90
ELBOW_ZERO = 90

# Initial pose
INIT_BASE = 90
INIT_SHOULDER = 90
INIT_ELBOW = 90
INIT_GRIPPER = 57

SERVO_MIN = 0
SERVO_MAX = 180

# ================= SERIAL CONFIG =======================
SERIAL_PORT = "COM5"     # CHANGE IF NEEDED
BAUDRATE = 115200
# ======================================================


# ---------------- IK ----------------
def inverse_kinematics(x, y, z):
    base_ik = math.degrees(math.atan2(z, x))

    # ---------- PLANAR DISTANCE ----------
    r = math.sqrt(x*x + z*z)
    y_eff = y - L1

    # ---------- ELBOW ----------
    D = (r*r + y_eff*y_eff - L2*L2 - L3*L3) / (2 * L2 * L3)
    D = max(-1.0, min(1.0, D))   # numeric safety
    elbow_ik = math.degrees(math.acos(D))

    # ---------- SHOULDER ----------
    shoulder_ik = math.degrees(
        math.atan2(y_eff, r) -
        math.atan2(
            L3 * math.sin(math.radians(elbow_ik)),
            L2 + L3 * math.cos(math.radians(elbow_ik))
        )
    )

    return base_ik, shoulder_ik, elbow_ik


def reachable(x, y, z):
    r = math.sqrt(x*x + z*z)
    y_eff = y - L1
    return math.sqrt(r*r + y_eff*y_eff) <= (L2 + L3)


def clamp(val, lo, hi):
    return max(lo, min(hi, val))


# ---------------- GUI ----------------
class IKGui:
    def __init__(self, root):
        self.root = root
        root.title("3-DOF Robot Arm IK Controller")

        self.ser = None
        self.build_ui()
        self.connect_serial()

    def build_ui(self):
        tk.Label(self.root, text="X (cm)").grid(row=0, column=0)
        tk.Label(self.root, text="Y (cm)").grid(row=1, column=0)
        tk.Label(self.root, text="Z (cm)").grid(row=2, column=0)

        self.x_entry = tk.Entry(self.root)
        self.y_entry = tk.Entry(self.root)
        self.z_entry = tk.Entry(self.root)

        self.x_entry.grid(row=0, column=1)
        self.y_entry.grid(row=1, column=1)
        self.z_entry.grid(row=2, column=1)

        self.move_btn = tk.Button(self.root, text="MOVE ARM", command=self.move_arm)
        self.move_btn.grid(row=3, column=0, columnspan=2, pady=5)

        self.reset_btn = tk.Button(self.root, text="RESET (90,90,90,57)", command=self.reset_arm)
        self.reset_btn.grid(row=4, column=0, columnspan=2, pady=5)

        self.status = tk.Label(self.root, text="Status: Ready")
        self.status.grid(row=5, column=0, columnspan=2)

    def connect_serial(self):
        try:
            self.ser = serial.Serial(SERIAL_PORT, BAUDRATE, timeout=1)
            time.sleep(2)
            self.status.config(text=f"Connected to {SERIAL_PORT}")
        except Exception as e:
            messagebox.showerror("Serial Error", str(e))
            self.root.destroy()

    def move_arm(self):
        try:
            x = float(self.x_entry.get())
            y = float(self.y_entry.get())
            z = float(self.z_entry.get())

            if not reachable(x, y, z):
                messagebox.showwarning("IK Error", "Target is out of reach")
                return

            base_ik, shoulder_ik, elbow_ik = inverse_kinematics(x, y, z)

            base_servo = clamp(BASE_ZERO + base_ik, SERVO_MIN, SERVO_MAX)
            shoulder_servo = clamp(SHOULDER_ZERO - shoulder_ik, SERVO_MIN, SERVO_MAX)
            elbow_servo = clamp(ELBOW_ZERO + elbow_ik, SERVO_MIN, SERVO_MAX)

            cmd = f"B:{base_servo:.1f},S:{shoulder_servo:.1f},E:{elbow_servo:.1f}\n"
            self.ser.write(cmd.encode())

            self.status.config(
                text=f"Sent → B:{base_servo:.1f}  S:{shoulder_servo:.1f}  E:{elbow_servo:.1f}"
            )

        except ValueError:
            messagebox.showerror("Input Error", "Enter valid numeric values")

    def reset_arm(self):
        # Slow reset (V = velocity / speed)
        cmd = f"B:{INIT_BASE},S:{INIT_SHOULDER},E:{INIT_ELBOW},G:{INIT_GRIPPER},V:20\n"
        self.ser.write(cmd.encode())
        self.status.config(text="Arm reset slowly to home position")



# ---------------- MAIN ----------------
if __name__ == "__main__":
    root = tk.Tk()
    app = IKGui(root)
    root.mainloop()

import os
import json
import datetime
import tkinter as tk
from tkinter import ttk, messagebox

try:
    import qrcode
    from PIL import Image, ImageTk
except Exception:
    qrcode = None
    Image = None
    ImageTk = None


def create_qr_image(data, size=400):
    if qrcode is None:
        raise RuntimeError('Missing qrcode or pillow packages')

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4
    )
    qr.add_data(json.dumps(data, ensure_ascii=False))
    qr.make(fit=True)

    img = qr.make_image(fill_color='black', back_color='white').convert('RGB')
    img = img.resize((size, size))
    return img


class QRGui(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title('QR Generator')
        self.geometry('720x560')
        self.current_img = None
        self.current_payload = None
        self._build()

    def _build(self):
        frm = ttk.Frame(self)
        frm.pack(fill='both', expand=True, padx=12, pady=12)

        # ================= LEFT: INPUTS =================
        left = ttk.Frame(frm)
        left.pack(side='left', fill='y', padx=(0, 12))

        ttk.Label(left, text='Box ID').pack(anchor='w')
        self.box_id_var = tk.StringVar()
        ttk.Entry(left, textvariable=self.box_id_var, width=30).pack(fill='x')

        ttk.Label(left, text='Part contained').pack(anchor='w', pady=(8, 0))
        self.part_var = tk.StringVar()
        ttk.Entry(left, textvariable=self.part_var, width=30).pack(fill='x')

        ttk.Label(left, text='Box type').pack(anchor='w', pady=(8, 0))
        self.box_var = tk.StringVar()
        ttk.Combobox(
            left,
            textvariable=self.box_var,
            values=['plastic', 'cardboard', 'metal', 'wooden'],
            state='readonly'
        ).pack(fill='x')

        ttk.Label(left, text='Number of parts').pack(anchor='w', pady=(8, 0))
        self.num_var = tk.StringVar()
        ttk.Entry(left, textvariable=self.num_var, width=10).pack(fill='x')

        btn_frame = ttk.Frame(left)
        btn_frame.pack(fill='x', pady=12)
        ttk.Button(btn_frame, text='Generate QR', command=self.on_generate).pack(side='left')
        ttk.Button(btn_frame, text='Save QR & JSON', command=self.on_save).pack(side='left', padx=6)

        # ================= RIGHT: PREVIEW =================
        right = ttk.Frame(frm)
        right.pack(side='left', fill='both', expand=True)

        ttk.Label(right, text='Preview').pack(anchor='w')
        self.box_id_label = ttk.Label(right, text='Box ID: —')
        self.box_id_label.pack(anchor='w', pady=(2, 6))

        self.canvas = tk.Label(right, relief='sunken', width=400, height=400)
        self.canvas.pack(fill='both', expand=True)

    def on_generate(self):
        if qrcode is None or Image is None:
            messagebox.showerror(
                'Missing libraries',
                'Install dependencies:\n\npip install qrcode pillow'
            )
            return

        box_id = self.box_id_var.get().strip()
        part = self.part_var.get().strip()
        box_type = self.box_var.get().strip()
        num = self.num_var.get().strip()

        if not box_id or not part or not box_type or not num:
            messagebox.showwarning(
                'Missing fields',
                'All fields are required.'
            )
            return

        try:
            num_i = int(num)
            if num_i < 0:
                raise ValueError
        except Exception:
            messagebox.showerror(
                'Invalid number',
                'Number of parts must be a non-negative integer.'
            )
            return

        payload = {
            'box_id': box_id,
            'part_contained': part,
            'box_type': box_type,
            'number_of_parts': num_i
        }

        try:
            img = create_qr_image(payload, size=400)
        except Exception as e:
            messagebox.showerror('QR generation failed', str(e))
            return

        self.current_img = img
        self.current_payload = payload

        tk_img = ImageTk.PhotoImage(img)
        self.canvas.image = tk_img
        self.canvas.config(image=tk_img)

        self.box_id_label.config(text=f'Box ID: {box_id}')
        messagebox.showinfo('Generated', 'QR code generated successfully.')

    def on_save(self):
        if self.current_img is None or self.current_payload is None:
            messagebox.showwarning(
                'Nothing to save',
                'Generate a QR code before saving.'
            )
            return

        base_dir = os.path.dirname(os.path.abspath(__file__))
        images_dir = os.path.join(base_dir, 'qr_images')
        os.makedirs(images_dir, exist_ok=True)

        ts = datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
        img_filename = f'qr_{self.current_payload["box_id"]}_{ts}.png'
        img_path = os.path.join(images_dir, img_filename)

        try:
            self.current_img.save(img_path)
        except Exception as e:
            messagebox.showerror('Image save failed', str(e))
            return

        box_data_path = os.path.join(base_dir, 'box_data.json')

        entry = {
            **self.current_payload,
            'created_utc': ts,
            'qr_image': img_filename
        }

        try:
            if os.path.exists(box_data_path):
                with open(box_data_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            else:
                data = []
        except Exception:
            data = []

        data.append(entry)

        try:
            with open(box_data_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            messagebox.showerror('JSON save failed', str(e))
            return

        messagebox.showinfo(
            'Saved',
            f'QR image saved to:\n{img_path}\n\n'
            f'Data appended to:\n{box_data_path}'
        )


if __name__ == '__main__':
    app = QRGui()
    app.mainloop()

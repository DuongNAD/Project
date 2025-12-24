import json
import os
import datetime
import tkinter as tk
from tkinter import ttk, messagebox


def load_inventory():
    """Load inventory from vision/box_data.json and aggregate by part name."""
    path = os.path.join(os.path.dirname(__file__), '..', 'vision', 'box_data.json')
    path = os.path.normpath(path)
    inventory = {}
    try:
        with open(path, 'r', encoding='utf-8') as f:
            raw = f.read()
            # file may contain fenced code blocks, try to extract json part
            if raw.strip().startswith('```'):
                raw = '\n'.join(raw.splitlines()[1:-1])
            data = json.loads(raw)
        for box in data:
            name = box.get('part_contained') or box.get('part') or 'unknown'
            qty = int(box.get('number_of_parts', 0))
            inventory[name] = inventory.get(name, 0) + qty
    except Exception:
        # fallback example inventory
        inventory = {
            'bolt': 500,
            'bufi': 120,
            'car_part': 45,
            'screwdriver': 30,
            'nut': 400,
        }
    return inventory


class OrderApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title('Storage Order UI')
        self.geometry('820x520')
        self.inventory = load_inventory()
        self.cart = {}  # part -> qty
        self.create_widgets()

    def create_widgets(self):
        frm_left = ttk.Frame(self)
        frm_left.pack(side='left', fill='both', expand=False, padx=10, pady=10)

        ttk.Label(frm_left, text='Search parts:').pack(anchor='w')
        self.search_var = tk.StringVar()
        ent_search = ttk.Entry(frm_left, textvariable=self.search_var)
        ent_search.pack(fill='x')
        ent_search.bind('<KeyRelease>', lambda e: self.refresh_parts())

        self.parts_list = tk.Listbox(frm_left, height=20)
        self.parts_list.pack(fill='both', expand=True, pady=6)
        self.parts_list.bind('<<ListboxSelect>>', self.on_part_select)

        frm_add = ttk.Frame(frm_left)
        frm_add.pack(fill='x')
        ttk.Label(frm_add, text='Quantity:').pack(side='left')
        self.qty_var = tk.StringVar(value='1')
        self.ent_qty = ttk.Entry(frm_add, width=6, textvariable=self.qty_var)
        self.ent_qty.pack(side='left', padx=6)
        btn_add = ttk.Button(frm_add, text='Add to cart', command=self.add_to_cart)
        btn_add.pack(side='left')

        # right pane: cart and actions
        frm_right = ttk.Frame(self)
        frm_right.pack(side='left', fill='both', expand=True, padx=10, pady=10)

        ttk.Label(frm_right, text='Cart').pack(anchor='w')
        cols = ('part', 'qty')
        self.tree = ttk.Treeview(frm_right, columns=cols, show='headings', height=15)
        self.tree.heading('part', text='Part')
        self.tree.heading('qty', text='Quantity')
        self.tree.column('part', width=300)
        self.tree.column('qty', width=80, anchor='center')
        self.tree.pack(fill='both', expand=True)

        frm_cart_actions = ttk.Frame(frm_right)
        frm_cart_actions.pack(fill='x', pady=6)
        ttk.Button(frm_cart_actions, text='Remove selected', command=self.remove_selected).pack(side='left')
        ttk.Button(frm_cart_actions, text='Clear cart', command=self.clear_cart).pack(side='left', padx=6)
        ttk.Button(frm_cart_actions, text='Submit order', command=self.submit_order).pack(side='right')

        self.status_var = tk.StringVar(value='Ready')
        ttk.Label(self, textvariable=self.status_var).pack(side='bottom', fill='x')

        self.refresh_parts()

    def refresh_parts(self):
        q = self.search_var.get().strip().lower()
        self.parts_list.delete(0, 'end')
        for part, qty in sorted(self.inventory.items()):
            if not q or q in part.lower():
                self.parts_list.insert('end', f"{part} — {qty}")

    def on_part_select(self, event=None):
        sel = self.parts_list.curselection()
        if not sel:
            return
        text = self.parts_list.get(sel[0])
        part = text.split(' — ')[0]
        self.selected_part = part

    def add_to_cart(self):
        try:
            qty = int(self.qty_var.get())
            if qty <= 0:
                raise ValueError
        except Exception:
            messagebox.showerror('Invalid quantity', 'Please enter a positive integer quantity.')
            return
        sel = self.parts_list.curselection()
        if not sel:
            messagebox.showwarning('No selection', 'Please select a part from the list.')
            return
        text = self.parts_list.get(sel[0])
        part = text.split(' — ')[0]
        avail = self.inventory.get(part, 0)
        if qty > avail:
            if not messagebox.askyesno('Over-request', f'Requesting {qty} but only {avail} available. Add anyway?'):
                return
        self.cart[part] = self.cart.get(part, 0) + qty
        self.status_var.set(f'Added {qty} x {part} to cart')
        self.refresh_cart_view()

    def refresh_cart_view(self):
        for i in self.tree.get_children():
            self.tree.delete(i)
        for part, qty in self.cart.items():
            self.tree.insert('', 'end', values=(part, qty))

    def remove_selected(self):
        sel = self.tree.selection()
        if not sel:
            return
        for it in sel:
            part = self.tree.item(it, 'values')[0]
            if part in self.cart:
                del self.cart[part]
        self.refresh_cart_view()

    def clear_cart(self):
        if messagebox.askyesno('Clear cart', 'Remove all items from the cart?'):
            self.cart.clear()
            self.refresh_cart_view()

    def submit_order(self):
        if not self.cart:
            messagebox.showwarning('Empty cart', 'Cart is empty — add items before submitting.')
            return
        order = {
            'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
            'items': [{'part': p, 'qty': q} for p, q in self.cart.items()]
        }
        out_path = os.path.join(os.path.dirname(__file__), '..', 'orders.json')
        out_path = os.path.normpath(out_path)
        try:
            if os.path.exists(out_path):
                with open(out_path, 'r', encoding='utf-8') as f:
                    existing = json.load(f)
            else:
                existing = []
        except Exception:
            existing = []
        existing.append(order)
        try:
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(existing, f, indent=2)
            messagebox.showinfo('Order submitted', f'Order saved to {out_path}')
            self.status_var.set('Order submitted')
            self.cart.clear()
            self.refresh_cart_view()
        except Exception as e:
            messagebox.showerror('Save error', f'Could not save order: {e}')


if __name__ == '__main__':
    app = OrderApp()
    app.mainloop()

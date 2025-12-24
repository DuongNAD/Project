## 4. Xử lý Lỗi tương thích (Compatibility Issues)
⚠️ **Lưu ý quan trọng:**
Dự án này được export từ môi trường **Host/Server**, nên khi import vào **Local**, một số node có thể hiển thị icon dấu hỏi chấm **(?)**.

* **Nguyên nhân:** Đây thường là các **Community Nodes** (node cài thêm) hoặc Custom Nodes chỉ có trên Host cũ.
* **Ví dụ điển hình:** Node `Update row in sheet1` có thể bị lỗi hiển thị `Unknown Node`.
* **Giải pháp (Fix):**
    1.  Kiểm tra tên node bị lỗi, vào menu **Settings** > **Community Nodes** trên n8n local để tìm và cài đặt lại.
    2.  Hoặc thay thế node `?` đó bằng các node chuẩn (Core Nodes) tương đương của n8n (ví dụ: dùng node *Google Sheets* chuẩn để thay thế).

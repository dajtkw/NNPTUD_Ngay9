Chào bạn, dựa trên yêu cầu của bạn và mã nguồn hiện tại của dự án (Node.js, Express, MongoDB, ExcelJS, Nodemailer), tôi sẽ tư vấn cho bạn **luồng thiết kế logic (System Design & Workflow)** chi tiết để thực hiện tính năng Import User từ file Excel. 

Như bạn yêu cầu, tôi sẽ **không viết code chi tiết**, mà chỉ định hướng cách làm, luồng dữ liệu, quy trình Git và hình dung kết quả trên Mailtrap.

---

### 1. Luồng thiết kế xử lý (Logical Workflow)

Vì bạn đang dùng cấu trúc có sẵn trong `routes/upload.js` (đã làm import Product), tính năng import User sẽ có luồng đi tương tự nhưng cần chú ý các ràng buộc đặc biệt của User.

**Bước 1: Nhận và đọc file**
*   Tạo một endpoint mới (VD: `POST /api/v1/upload/users-excel`).
*   Sử dụng middleware `uploadExcel.single('file')` đã có trong `utils/uploadHandler.js` để lưu file tạm.
*   Dùng thư viện `exceljs` đọc file, duyệt vòng lặp từ hàng số 2 (bỏ qua header `username`, `email`).

**Bước 2: Xử lý dữ liệu từng dòng (Row Processing)**
*   **Trích xuất:** Lấy `username` (cột 1) và `email` (cột 2).
*   **Validate (Rất quan trọng):** Kiểm tra xem username/email đã tồn tại trong DB chưa. Nếu có, đẩy thông báo lỗi vào mảng kết quả của dòng đó và `continue`.
*   **Tạo Password ngẫu nhiên (16 kí tự):** 
    *   *Lưu ý từ mã nguồn của bạn:* Trong `utils/validator.js`, dự án đang bắt buộc password phải có: Ít nhất 8 kí tự, 1 hoa, 1 thường, 1 số, 1 kí tự đặc biệt.
    *   Thiết kế một hàm Random sinh ra chuỗi 16 kí tự đảm bảo thoả mãn 4 điều kiện trên (VD: `User01@` + 8 chuỗi random).
*   **Tìm Role mặc định:** Truy vấn DB collection `roles` để lấy ra ObjectId của role "USER".

**Bước 3: Ghi vào Database (Dùng Transaction)**
Giống như lúc tạo tài khoản (trong `routes/auth.js`), khi tạo User phải tạo luôn Cart. Do đó phải dùng MongoDB Session Transaction:
*   Bắt đầu Transaction.
*   Tạo mới `User` với username, email, mật khẩu (Mongoose pre-save hook của bạn sẽ tự động băm bcrypt mật khẩu này) và status mặc định.
*   Tạo mới `Cart` và liên kết với ObjectId của User vừa tạo.
*   Commit Transaction.

**Bước 4: Gửi Email qua Mailtrap**
*   Nếu ghi DB thành công, gọi hàm gửi mail.
*   Bổ sung thêm một hàm mới trong `utils/mailHandler.js` (VD: `sendWelcomeMail(email, username, randomPassword)`).
*   Đẩy kết quả "Thành công" vào mảng response.

---

### 2. Định hướng chia cấu trúc file cần sửa

Để code gọn gàng, bạn nên chỉnh sửa các file sau trong dự án hiện tại:

1.  **`utils/passwordHandler.js` (Tạo mới):** Chứa logic sinh chuỗi ngẫu nhiên 16 kí tự thoả mãn regex (Hoa, thường, số, kí tự đặc biệt).
2.  **`utils/mailHandler.js`:** Bổ sung hàm `sendUserCredentials(to, username, password)`. Cấu hình Mailtrap SMTP giữ nguyên.
3.  **`routes/upload.js`:** Thêm endpoint `/users-excel`, copy logic tương tự như `/excel` của products nhưng áp dụng luồng (User + Cart) ở trên.

---

### 3. Quy trình Git (Git Workflow)

Để đảm bảo source code an toàn và dễ review, bạn nên thực hiện theo quy trình sau:

*   **Tạo nhánh mới:** `git checkout -b feature/import-users-excel`
*   **Commit 1 (Cấu trúc & Generator):** Thêm hàm sinh mật khẩu ngẫu nhiên và chuẩn bị hàm gửi email trong `utils`. 
    *   *Message:* `feat(utils): add random password generator and welcome email template`
*   **Commit 2 (API Endpoint):** Xây dựng route mới để parse file Excel và validate dữ liệu từng dòng.
    *   *Message:* `feat(api): add route for parsing user excel file with exceljs`
*   **Commit 3 (Database Logic):** Tích hợp MongoDB Transaction (lưu User + Cart) vào trong vòng lặp Excel.
    *   *Message:* `feat(db): implement bulk user and cart creation via transactions`
*   **Commit 4 (Integration):** Nối hàm gửi mail vào sau khi Transaction thành công và format lại Response trả về cho Client.
    *   *Message:* `feat(integration): trigger mailtrap sending on successful user import`
*   **Merge code:** Đẩy nhánh lên Github/Gitlab, tạo Pull Request để merge vào nhánh `main` (hoặc `develop`).

---

### 4. Kết quả hiển thị trên Mailtrap (Mô phỏng)

Vì tôi là AI không thể chụp màn hình thực tế, đây là **giao diện và nội dung chính xác** mà bạn sẽ thấy khi mở Inboxes của hệ thống **Mailtrap.io** sau khi chạy xong API:

**Bên cột trái (Danh sách Inboxes của Mailtrap):**
Bạn sẽ thấy hàng loạt email bay vào tương ứng với số dòng Excel thành công (VD: 90 email).
*   `user01@haha.com` - Tiền tố: *Account Created - Welcome to NNPTUD-C5*
*   `user02@haha.com` - Tiền tố: *Account Created - Welcome to NNPTUD-C5*
*   ...

**Bên cột phải (Chi tiết Email / Tab HTML View):**
```text
Subject: Account Created - Welcome to NNPTUD-C5
From:    hehehe@gmail.com (Theo cấu hình hệ thống của bạn)
To:      user01@haha.com
---------------------------------------------------------

Kính chào user01,

Tài khoản của bạn trên hệ thống NNPTUD-C5 đã được tạo thành công bởi Quản trị viên.
Dưới đây là thông tin đăng nhập của bạn:

- Username: user01
- Email:    user01@haha.com
- Password: Xy7$pL9@kM2#vN4q  <-- (Đây là chuỗi 16 kí tự random tự động tạo)

Vui lòng đăng nhập vào hệ thống tại http://localhost:3000/api/v1/auth/login 
và THAY ĐỔI MẬT KHẨU ngay lần đăng nhập đầu tiên để đảm bảo bảo mật.

Trân trọng,
NNPTUD-C5 Admin Team
```

*Bạn có thể xây dựng template này bằng chuỗi Template String (`` ` ``) hoặc HTML cơ bản trong tham số `html:` của `nodemailer`.*
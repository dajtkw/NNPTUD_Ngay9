const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 25,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "",
        pass: "",
    },
});
module.exports = {
    sendMail: async function (to,url) {
        const info = await transporter.sendMail({
            from: 'hehehe@gmail.com',
            to: to,
            subject: "reset password URL",
            text: "click vao day de doi pass", // Plain-text version of the message
            html: "click vao <a href="+url+">day</a> de doi pass", // HTML version of the message
        });

        console.log("Message sent:", info.messageId);
    },
    
    sendUserCredentials: async function (to, username, password) {
        const subject = "Account Created - Welcome to NNPTUD-C5";
        const text = `Kính chào ${username},

Tài khoản của bạn trên hệ thống NNPTUD-C5 đã được tạo thành công bởi Quản trị viên.
Dưới đây là thông tin đăng nhập của bạn:

- Username: ${username}
- Email:    ${to}
- Password: ${password}

Vui lòng đăng nhập vào hệ thống tại http://localhost:3000/api/v1/auth/login
và THAY ĐỔI MẬT KHẨU ngay lần đăng nhập đầu tiên để đảm bảo bảo mật.

Trân trọng,
NNPTUD-C5 Admin Team`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Account Created - Welcome to NNPTUD-C5</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .credentials { background-color: #fff; border: 1px solid #ddd; padding: 15px; margin: 15px 0; }
        .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Account Created - Welcome to NNPTUD-C5</h1>
        </div>
        <div class="content">
            <p>Kính chào <strong>${username}</strong>,</p>
            <p>Tài khoản của bạn trên hệ thống NNPTUD-C5 đã được tạo thành công bởi Quản trị viên.</p>
            <p>Dưới đây là thông tin đăng nhập của bạn:</p>
            
            <div class="credentials">
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Email:</strong> ${to}</p>
                <p><strong>Password:</strong> ${password}</p>
            </div>
            
            <p>Vui lòng đăng nhập vào hệ thống tại <a href="http://localhost:3000/api/v1/auth/login">http://localhost:3000/api/v1/auth/login</a></p>
            <p><strong>THAY ĐỔI MẬT KHẨU</strong> ngay lần đăng nhập đầu tiên để đảm bảo bảo mật.</p>
        </div>
        <div class="footer">
            <p>Trân trọng,<br>NNPTUD-C5 Admin Team</p>
        </div>
    </div>
</body>
</html>`;

        const info = await transporter.sendMail({
            from: 'hehehe@gmail.com',
            to: to,
            subject: subject,
            text: text,
            html: html,
        });

        console.log("Welcome email sent to:", to, "Message ID:", info.messageId);
        return info;
    }
}

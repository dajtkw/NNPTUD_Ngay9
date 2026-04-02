const mongoose = require('mongoose');
const excelJs = require('exceljs');
const path = require('path');
const { generateRandomPassword } = require('./utils/passwordHandler');
const { sendUserCredentials } = require('./utils/mailHandler');
const usersModel = require('./schemas/users');
const rolesModel = require('./schemas/roles');
const cartsModel = require('./schemas/carts');

// Kết nối MongoDB - sử dụng hostname 'mongodb' trong Docker network
mongoose.connect('mongodb://admin:password123@mongodb:27017/NNPTUD-C5?authSource=admin');

async function importAllUsersFromExcel() {
    let session;
    try {
        console.log('=== Bắt đầu import user từ file Excel ===\n');
        
        // Kiểm tra kết nối MongoDB
        await mongoose.connection.once('open', () => {
            console.log('✅ Đã kết nối đến MongoDB');
        });
        
        // Tìm role USER
        let userRole = await rolesModel.findOne({ name: 'USER' });
        if (!userRole) {
            console.log('⚠️  Không tìm thấy role USER, đang tạo mới...');
            userRole = new rolesModel({
                name: 'USER',
                description: 'Người dùng thông thường'
            });
            await userRole.save();
            console.log('✅ Đã tạo role USER');
        }
        
        // Đọc file Excel
        const excelFilePath = path.join(__dirname, 'user.xlsx');
        console.log(`📂 Đang đọc file: ${excelFilePath}`);
        
        const workbook = new excelJs.Workbook();
        await workbook.xlsx.readFile(excelFilePath);
        const worksheet = workbook.worksheets[0];
        
        console.log(`📊 File có ${worksheet.rowCount - 1} dòng dữ liệu (trừ header)`);
        
        // Lấy danh sách user hiện có để kiểm tra trùng lặp
        const existingUsers = await usersModel.find({});
        const existingUsernames = existingUsers.map(u => u.username);
        const existingEmails = existingUsers.map(u => u.email);
        
        const results = [];
        const successfulUsers = [];
        const failedUsers = [];
        
        // Xử lý từng dòng bắt đầu từ dòng 2 (bỏ qua header)
        for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex++) {
            const row = worksheet.getRow(rowIndex);
            const usernameCell = row.getCell(1);
            const emailCell = row.getCell(2);
            
            // Lấy giá trị text từ cell
            const username = usernameCell.text || usernameCell.value || '';
            const email = emailCell.text || emailCell.value || '';
            
            // Chuyển đổi sang string nếu là object
            const usernameStr = typeof username === 'object' ? JSON.stringify(username) : String(username);
            const emailStr = typeof email === 'object' ? JSON.stringify(email) : String(email);
            
            console.log(`\n--- Xử lý dòng ${rowIndex} ---`);
            console.log(`   Username: ${usernameStr}`);
            console.log(`   Email: ${emailStr}`);
            
            // Kiểm tra dữ liệu
            if (!usernameStr || usernameStr.trim() === '' || !emailStr || emailStr.trim() === '') {
                const error = 'Username hoặc email bị thiếu';
                console.log(`   ❌ ${error}`);
                failedUsers.push({ row: rowIndex, username: usernameStr, email: emailStr, error });
                results.push({ success: false, row: rowIndex, username: usernameStr, email: emailStr, error });
                continue;
            }
            
            // Kiểm tra định dạng email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailStr)) {
                const error = 'Email không đúng định dạng';
                console.log(`   ❌ ${error}`);
                failedUsers.push({ row: rowIndex, username: usernameStr, email: emailStr, error });
                results.push({ success: false, row: rowIndex, username: usernameStr, email: emailStr, error });
                continue;
            }
            
            // Kiểm tra trùng lặp
            if (existingUsernames.includes(usernameStr)) {
                const error = 'Username đã tồn tại';
                console.log(`   ❌ ${error}`);
                failedUsers.push({ row: rowIndex, username: usernameStr, email: emailStr, error });
                results.push({ success: false, row: rowIndex, username: usernameStr, email: emailStr, error });
                continue;
            }
            
            if (existingEmails.includes(emailStr)) {
                const error = 'Email đã tồn tại';
                console.log(`   ❌ ${error}`);
                failedUsers.push({ row: rowIndex, username: usernameStr, email: emailStr, error });
                results.push({ success: false, row: rowIndex, username: usernameStr, email: emailStr, error });
                continue;
            }
            
            // Tạo password ngẫu nhiên
            const randomPassword = generateRandomPassword();
            console.log(`   ✅ Password được tạo: ${randomPassword} (${randomPassword.length} ký tự)`);
            
            try {
                // Tạo user mới (không dùng transaction)
                const newUser = new usersModel({
                    username: usernameStr,
                    email: emailStr,
                    password: randomPassword,
                    role: userRole._id,
                    status: false,
                    fullName: '',
                    avatarUrl: 'https://i.sstatic.net/l60Hf.png',
                    loginCount: 0
                });
                
                await newUser.save();
                
                // Tạo cart cho user
                const newCart = new cartsModel({
                    user: newUser._id,
                    products: []
                });
                
                await newCart.save();
                
                console.log(`   ✅ Đã tạo user và cart thành công`);
                
                // Gửi email
                console.log(`   📧 Đang gửi email đến ${emailStr}...`);
                try {
                    await sendUserCredentials(emailStr, usernameStr, randomPassword);
                    console.log(`   ✅ Email đã gửi thành công`);
                    
                    // Thêm vào danh sách thành công
                    successfulUsers.push({ username: usernameStr, email: emailStr, password: randomPassword });
                    results.push({
                        success: true,
                        row: rowIndex,
                        username: usernameStr,
                        email: emailStr,
                        password: randomPassword,
                        message: 'User created and email sent successfully'
                    });
                    
                    // Cập nhật danh sách hiện có để tránh trùng lặp trong cùng batch
                    existingUsernames.push(usernameStr);
                    existingEmails.push(emailStr);
                    
                } catch (mailError) {
                    console.log(`   ⚠️  User đã tạo nhưng gửi email thất bại: ${mailError.message}`);
                    successfulUsers.push({ username: usernameStr, email: emailStr, password: randomPassword });
                    results.push({
                        success: true,
                        row: rowIndex,
                        username: usernameStr,
                        email: emailStr,
                        password: randomPassword,
                        warning: 'User created but email failed to send'
                    });
                }
                
            } catch (error) {
                console.log(`   ❌ Lỗi khi tạo user: ${error.message}`);
                failedUsers.push({ row: rowIndex, username: usernameStr, email: emailStr, error: error.message });
                results.push({ success: false, row: rowIndex, username: usernameStr, email: emailStr, error: error.message });
            }
        }
        
        // Tổng kết
        console.log('\n=== TỔNG KẾT ===');
        console.log(`✅ Thành công: ${successfulUsers.length} user`);
        console.log(`❌ Thất bại: ${failedUsers.length} user`);
        
        if (successfulUsers.length > 0) {
            console.log('\n📋 Danh sách user đã tạo thành công:');
            successfulUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.username} (${user.email}) - Password: ${user.password}`);
            });
        }
        
        if (failedUsers.length > 0) {
            console.log('\n⚠️  Danh sách user thất bại:');
            failedUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. Dòng ${user.row}: ${user.username} (${user.email}) - Lỗi: ${user.error}`);
            });
        }
        
        console.log('\n📧 Hướng dẫn kiểm tra Mailtrap:');
        console.log('1. Truy cập https://mailtrap.io');
        console.log('2. Đăng nhập với tài khoản của bạn');
        console.log('3. Vào mục "Inboxes"');
        console.log('4. Chọn inbox mặc định');
        console.log(`5. Bạn sẽ thấy ${successfulUsers.length} email với tiêu đề "Account Created - Welcome to NNPTUD-C5"`);
        console.log('6. Click vào email để xem nội dung chi tiết');
        console.log('7. Mỗi email chứa username, email và password riêng');
        
        // Lưu kết quả ra file
        const fs = require('fs');
        const resultFile = 'import_results.json';
        fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
        console.log(`\n💾 Kết quả đã được lưu vào file: ${resultFile}`);
        
    } catch (error) {
        console.error('❌ Lỗi tổng quát:', error.message);
    } finally {
        // Đóng kết nối sau 3 giây
        setTimeout(() => {
            mongoose.connection.close();
            console.log('\n🔌 Đã đóng kết nối MongoDB');
            console.log('✨ Script hoàn thành!');
        }, 3000);
    }
}

// Chạy script
importAllUsersFromExcel();
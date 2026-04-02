const mongoose = require('mongoose');
const { generateRandomPassword } = require('./utils/passwordHandler');
const { sendUserCredentials } = require('./utils/mailHandler');
const usersModel = require('./schemas/users');
const rolesModel = require('./schemas/roles');
const cartsModel = require('./schemas/carts');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/NNPTUD-C5');

async function createUserAndSendEmail() {
    try {
        console.log('=== Bắt đầu tạo user và gửi email ===\n');
        
        // Kiểm tra kết nối MongoDB
        await mongoose.connection.once('open', () => {
            console.log('✅ Đã kết nối đến MongoDB');
        });
        
        // Tìm role USER
        const userRole = await rolesModel.findOne({ name: 'USER' });
        if (!userRole) {
            console.error('❌ Không tìm thấy role USER trong database');
            console.log('Tạo role USER mới...');
            // Tạo role USER nếu chưa có
            const newRole = new rolesModel({
                name: 'USER',
                description: 'Người dùng thông thường'
            });
            await newRole.save();
            console.log('✅ Đã tạo role USER');
        }
        
        // Thông tin user mẫu
        const username = 'testuser_' + Date.now().toString().slice(-6);
        const email = `testuser_${Date.now().toString().slice(-6)}@example.com`;
        const randomPassword = generateRandomPassword();
        
        console.log('📝 Thông tin user sẽ được tạo:');
        console.log(`   Username: ${username}`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${randomPassword}`);
        console.log(`   Password length: ${randomPassword.length} ký tự`);
        
        // Kiểm tra xem username/email đã tồn tại chưa
        const existingUser = await usersModel.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            console.log('⚠️  Username hoặc email đã tồn tại, đang tạo thông tin mới...');
            // Tạo thông tin mới nếu đã tồn tại
            return await createUserAndSendEmail();
        }
        
        // Bắt đầu transaction
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // Tạo user mới
            const newUser = new usersModel({
                username: username,
                email: email,
                password: randomPassword, // Sẽ được hash tự động bởi pre-save hook
                role: userRole ? userRole._id : (await rolesModel.findOne({ name: 'USER' }))._id,
                status: false,
                fullName: 'Test User',
                avatarUrl: 'https://i.sstatic.net/l60Hf.png',
                loginCount: 0
            });
            
            await newUser.save({ session });
            console.log('✅ Đã tạo user trong database');
            
            // Tạo cart cho user
            const newCart = new cartsModel({
                user: newUser._id,
                products: []
            });
            
            await newCart.save({ session });
            console.log('✅ Đã tạo cart cho user');
            
            // Commit transaction
            await session.commitTransaction();
            await session.endSession();
            
            console.log('✅ Transaction đã được commit thành công');
            
            // Gửi email
            console.log('\n📧 Đang gửi email đến', email, '...');
            try {
                const mailInfo = await sendUserCredentials(email, username, randomPassword);
                console.log('✅ Email đã được gửi thành công!');
                console.log(`   Message ID: ${mailInfo.messageId}`);
                console.log(`   Preview URL: https://mailtrap.io/inboxes`);
            } catch (mailError) {
                console.error('❌ Lỗi khi gửi email:', mailError.message);
                console.log('⚠️  User đã được tạo nhưng email không gửi được');
            }
            
            console.log('\n=== Kết quả ===');
            console.log('✅ User đã được tạo thành công:');
            console.log(`   Username: ${username}`);
            console.log(`   Email: ${email}`);
            console.log(`   Password: ${randomPassword}`);
            console.log(`   User ID: ${newUser._id}`);
            
            console.log('\n📋 Hướng dẫn kiểm tra Mailtrap:');
            console.log('1. Truy cập https://mailtrap.io');
            console.log('2. Đăng nhập với tài khoản của bạn');
            console.log('3. Vào mục "Inboxes"');
            console.log('4. Chọn inbox mặc định');
            console.log('5. Bạn sẽ thấy email với tiêu đề "Account Created - Welcome to NNPTUD-C5"');
            console.log('6. Click vào email để xem nội dung chi tiết');
            
        } catch (error) {
            await session.abortTransaction();
            await session.endSession();
            console.error('❌ Lỗi trong transaction:', error.message);
            throw error;
        }
        
    } catch (error) {
        console.error('❌ Lỗi tổng quát:', error.message);
    } finally {
        // Đóng kết nối sau 5 giây
        setTimeout(() => {
            mongoose.connection.close();
            console.log('\n🔌 Đã đóng kết nối MongoDB');
            console.log('✨ Script hoàn thành!');
        }, 5000);
    }
}

// Chạy script
createUserAndSendEmail();
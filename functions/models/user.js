const mongoose = require('mongoose');

// Định nghĩa schema cho người dùng
const userSchema = new mongoose.Schema({
  // Tên người dùng (username)
  username: {
    type: String, // Kiểu dữ liệu là chuỗi
    required: true, // Trường bắt buộc phải có
    unique: true // Đảm bảo tên người dùng là duy nhất
  },
  // Mật khẩu người dùng (password)
  password: {
    type: String, // Kiểu dữ liệu là chuỗia
    required: true // Trường bắt buộc phải có
  },
  // Vai trò của người dùng (role)
  role: {
    type: String, // Kiểu dữ liệu là chuỗi
    enum: ['admin', 'user'], // Chỉ cho phép hai giá trị: 'admin' hoặc 'user'
    default: 'user' // Giá trị mặc định là 'user'
  },
  // Thời gian tạo người dùng (createdAt)
  createdAt: {
    type: Date, // Kiểu dữ liệu là ngày
    default: Date.now // Giá trị mặc định là thời gian hiện tại
  }
});

// Tạo model User từ schema và đặt tên collection là "usersCollection"
const User = mongoose.model('User', userSchema, 'usersCollection');

module.exports = User;

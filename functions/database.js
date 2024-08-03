const mongoose = require('mongoose');

// URI kết nối tới MongoDB Atlas
const uri = "mongodb+srv://baobaote00:M1kHL93T70udniIl@tu-vung.jeysuu1.mongodb.net?retryWrites=true&w=majority&appName=tu-vung";

/**
 * Kết nối tới cơ sở dữ liệu MongoDB bằng Mongoose
 * Sử dụng URI kết nối đã định nghĩa và cấu hình Mongoose
 * @async
 * @function connectDB
 */
const connectDB = async () => {
  try {
    // Kết nối tới MongoDB với các tùy chọn cấu hình
    await mongoose.connect(uri, {
      useNewUrlParser: true, // Sử dụng trình phân tích URL mới
      useUnifiedTopology: true, // Sử dụng trình điều khiển kết nối mới
      dbName: "tu-vung" // Tên cơ sở dữ liệu
    });
    console.log("Connected to MongoDB with Mongoose");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

/**
 * Đóng kết nối tới cơ sở dữ liệu MongoDB
 * @async
 * @function closeConnection
 */
const closeConnection = async () => {
  try {
    // Đóng kết nối hiện tại tới MongoDB
    await mongoose.connection.close();
    console.log("Connection to MongoDB closed");
  } catch (error) {
    console.error("Error closing connection to MongoDB:", error);
  }
};

// Xuất các hàm connectDB và closeConnection để sử dụng ở các module khác
module.exports = { connectDB, closeConnection };

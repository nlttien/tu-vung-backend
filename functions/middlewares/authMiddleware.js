// authMiddleware.js
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your_secret_key'; // Khóa bí mật dùng để xác minh token

/**
 * Middleware xác thực JWT
 * Kiểm tra và xác minh token từ yêu cầu HTTP
 * @param {Object} req - Đối tượng yêu cầu HTTP
 * @param {Object} res - Đối tượng phản hồi HTTP
 * @param {Function} next - Hàm tiếp theo trong chuỗi middleware
 */
const authMiddleware = (req, res, next) => {
  // Lấy token từ cookie hoặc header 'Authorization'
  const token = req.cookies.accessToken || req.headers['authorization'];

  // Nếu không có token, trả về lỗi 401 (Unauthorized)
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Xác minh token với SECRET_KEY
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        // Nếu token hết hạn, trả về lỗi 401 và thông báo
        return res.status(401).json({ message: 'Token has expired. Please log in again.' });
      }
      // Nếu token không hợp lệ, trả về lỗi 403 (Forbidden)
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Nếu token hợp lệ, lưu thông tin giải mã vào req.user và tiếp tục với middleware tiếp theo
    req.user = decoded;
    
    next();
  });
};

module.exports = authMiddleware;

const express = require('express');
const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu
const jwt = require('jsonwebtoken'); // Thư viện tạo và xác thực token
const User = require('../models/user'); // Mô hình người dùng
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware xác thực người dùng
const { SECRET_KEY, REFRESH_SECRET_KEY } = require('../config/config'); // Các khóa bí mật cho JWT

const router = express.Router();

/**
 * Endpoint đăng ký người dùng
 * @route POST /register
 * @param {string} username - Tên người dùng
 * @param {string} password - Mật khẩu của người dùng
 * @param {string} role - Vai trò của người dùng
 * @returns {Object} - Trả về thông tin người dùng đã đăng ký
 */
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.send(user); // Trả về thông tin người dùng đã được lưu
  } catch (error) {
    res.status(500).send({ message: 'Error registering user', error }); // Xử lý lỗi nếu có
  }
});

/**
 * Endpoint đăng nhập người dùng
 * @route POST /login
 * @param {string} username - Tên người dùng
 * @param {string} password - Mật khẩu của người dùng
 * @returns {Object} - Trả về thông điệp đăng nhập thành công và vai trò người dùng
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send({ message: 'Invalid credentials' });

    // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong cơ sở dữ liệu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).send({ message: 'Invalid credentials' });

    // Tạo access token và refresh token
    const accessToken = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '2d' });
    const refreshToken = jwt.sign({ username: user.username, role: user.role }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

    // Lưu token vào cookie để gửi cho client
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true, // Chỉ gửi cookie qua HTTPS
      sameSite: 'None', // SameSite=None
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // Chỉ gửi cookie qua HTTPS
      sameSite: 'None', // SameSite=None
    });

    res.json({ message: 'Logged in successfully', role: user.role }); // Trả về thông điệp và vai trò người dùng
  } catch (error) {
    res.status(500).send({ message: 'Error logging in', error }); // Xử lý lỗi nếu có
  }
});

/**
 * Endpoint làm mới token
 * @route POST /refresh-token
 * @returns {Object} - Trả về thông điệp xác nhận token đã được làm mới
 */
router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401); // Kiểm tra xem token có tồn tại không

  jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Xử lý lỗi nếu token không hợp lệ

    // Tạo mới access token
    const accessToken = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '2d' });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true, // Chỉ gửi cookie qua HTTPS
      sameSite: 'None', // SameSite=None
    });
    res.json({ message: 'Token refreshed' }); // Trả về thông điệp xác nhận token đã được làm mới
  });
});

/**
 * Endpoint đăng xuất người dùng
 * @route POST /logout
 * @returns {Object} - Trả về thông điệp đăng xuất thành công
 */
router.post('/logout', async (req, res) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000'); // Cho phép truy cập từ domain cụ thể
  res.set('Access-Control-Allow-Credentials', 'true'); // Cho phép gửi cookie qua CORS
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401); // Kiểm tra xem token có tồn tại không

  try {
    // Xóa cookie chứa token
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' }); // Trả về thông điệp đăng xuất thành công
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error }); // Xử lý lỗi nếu có
  }
});

/**
 * Endpoint xác thực token
 * @route GET /verify-token
 * @access Private - Cần xác thực token
 * @returns {Object} - Trả về thông điệp xác thực token và vai trò người dùng
 */
router.get('/verify-token', authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Token has expired or is invalid' }); // Xử lý lỗi nếu token không hợp lệ
  }

  const { role } = req.user;
  res.json({ message: 'Token is valid', role }); // Trả về thông điệp xác thực token và vai trò người dùng
});

module.exports = router; // Xuất module router để sử dụng trong ứng dụng

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { SECRET_KEY, REFRESH_SECRET_KEY } = require('../config/config');

const router = express.Router();

// Middleware to set cookie options for production
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
};

/**
 * Endpoint đăng ký người dùng
 * @route POST /register
 * @param {string} username - Tên người dùng
 * @param {string} password - Mật khẩu của người dùng
 * @param {string} role - Vai trò của người dùng
 * @returns {Object} - Trả về thông tin người dùng đã đăng ký
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: 'Error registering user', error });
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
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send({ message: 'Invalid credentials' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).send({ message: 'Invalid credentials' });

    const accessToken = jwt.sign({ id: user._id.toString(), username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '2d' });
    const refreshToken = jwt.sign({ id: user._id.toString(), username: user.username, role: user.role }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

    // Set cookies using the predefined options
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.json({ message: 'Logged in successfully', role: user.role, id: user.id });
  } catch (error) {
    res.status(500).send({ message: 'Error logging in', error });
  }
});

/**
 * Endpoint làm mới token
 * @route POST /refresh-token
 * @returns {Object} - Trả về thông điệp xác nhận token đã được làm mới
 */
router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '2d' });
    res.cookie('accessToken', accessToken, cookieOptions);
    res.json({ message: 'Token refreshed' });
  });
});

/**
 * Endpoint đăng xuất người dùng
 * @route POST /logout
 * @returns {Object} - Trả về thông điệp đăng xuất thành công
 */
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error });
  }
});

/**
 * Endpoint xác thực token
 * @route GET /verify-token
 * @access Private - Cần xác thực token
 * @returns {Object} - Trả về thông điệp xác thực token và vai trò người dùng
 */
router.get('/verify-token', require('../middlewares/authMiddleware'), (req, res) => { // Require authMiddleware inline
  if (!req.user) {
    return res.status(401).json({ message: 'Token has expired or is invalid' });
  }

  const { role, id } = req.user;
  res.json({ message: 'Token is valid', role, id });
});

module.exports = router;

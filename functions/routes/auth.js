const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const { SECRET_KEY, REFRESH_SECRET_KEY } = require('../config/config');

const router = express.Router();

/**
 * Endpoint đăng ký người dùng
 */
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, role });
  try {
    await user.save();
    res.send({ message: 'User registered' });
  } catch (error) {
    res.status(500).send({ message: 'Error registering user', error });
  }
});

/**
 * Endpoint đăng nhập
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send({ message: 'Invalid credentials' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).send({ message: 'Invalid credentials' });

    // Tạo access token và refresh token
    const accessToken = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '2d' });
    const refreshToken = jwt.sign({ username: user.username, role: user.role }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    res.json({ message: 'Logged in successfully', role: user.role });
  } catch (error) {
    res.status(500).send({ message: 'Error logging in', error });
  }
});

/**
 * Endpoint làm mới token
 */
router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '2d' });
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    res.json({ message: 'Token refreshed' });
  });
});

/**
 * Endpoint đăng xuất người dùng
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

router.get('/verify-token', authMiddleware, (req, res) => {
  const { role } = req.user;

  res.json({ message: 'Token is valid', role });
});

module.exports = router;

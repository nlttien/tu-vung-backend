const express = require('express');
const User = require('../models/user');
const router = express.Router();

/**
 * Lấy danh sách người dùng từ cơ sở dữ liệu.
 * @async
 * @route GET /
 * @returns {Array} - Danh sách người dùng dưới dạng JSON.
 * @throws {Error} - Nếu có lỗi xảy ra trong quá trình truy xuất dữ liệu.
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Lấy thông tin một người dùng theo ID.
 * @async
 * @route GET /:id
 * @param {string} id - ID của người dùng cần lấy thông tin.
 * @returns {Object} - Thông tin người dùng dưới dạng JSON.
 * @throws {Error} - Nếu có lỗi xảy ra hoặc người dùng không được tìm thấy.
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Tạo một người dùng mới.
 * @async
 * @route POST /
 * @param {Object} req.body - Dữ liệu người dùng được gửi từ client.
 * @returns {Object} - Người dùng mới được tạo dưới dạng JSON.
 * @throws {Error} - Nếu có lỗi xảy ra trong quá trình lưu dữ liệu.
 */
router.post('/', async (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    role: req.body.role,
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * Cập nhật thông tin người dùng theo ID.
 * @async
 * @route PUT /:id
 * @param {string} id - ID của người dùng cần cập nhật.
 * @param {Object} req.body - Dữ liệu cập nhật từ client.
 * @returns {Object} - Thông tin người dùng đã được cập nhật dưới dạng JSON.
 * @throws {Error} - Nếu có lỗi xảy ra hoặc người dùng không được tìm thấy.
 */
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.username = req.body.username || user.username;
      user.password = req.body.password || user.password;
      user.role = req.body.role || user.role;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * Xóa người dùng theo ID.
 * @async
 * @route DELETE /:id
 * @param {string} id - ID của người dùng cần xóa.
 * @returns {Object} - Thông báo xóa thành công hoặc lỗi nếu người dùng không được tìm thấy.
 * @throws {Error} - Nếu có lỗi xảy ra trong quá trình xóa người dùng.
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

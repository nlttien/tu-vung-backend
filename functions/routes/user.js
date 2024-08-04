const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorize'); // Xử lý phân quyền nếu cần

const router = express.Router();

/**
 * Endpoint bảo vệ chỉ admin có thể truy cập
 */
router.get('/admin', authMiddleware, authorize('admin'), (req, res) => {
  res.send({ message: 'This is admin data' });
});

/**
 * Endpoint bảo vệ chỉ user có thể truy cập
 */
router.get('/user', authMiddleware, authorize('user'), (req, res) => {
  res.send({ message: 'This is user data' });
});

module.exports = router;

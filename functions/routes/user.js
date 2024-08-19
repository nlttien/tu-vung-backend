const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware xác thực người dùng
const { authorize } = require('../middlewares/authorize'); // Middleware phân quyền người dùng

const router = express.Router(); // Tạo một instance của Router để định nghĩa các endpoint

/**
 * Endpoint bảo vệ chỉ admin có thể truy cập
 * @route GET /admin
 * @access Private - Chỉ admin được phép truy cập
 * @middleware authMiddleware - Xác thực người dùng trước khi truy cập
 * @middleware authorize('admin') - Phân quyền chỉ cho phép admin truy cập
 * @returns {Object} - Thông điệp xác nhận quyền truy cập của admin
 */
router.get('/admin', authMiddleware, authorize('admin'), (req, res) => {
  res.send({ message: 'This is admin data' }); // Trả về thông điệp nếu người dùng có quyền admin
});

/**
 * Endpoint bảo vệ chỉ user có thể truy cập
 * @route GET /user
 * @access Private - Chỉ user được phép truy cập
 * @middleware authMiddleware - Xác thực người dùng trước khi truy cập
 * @middleware authorize('user') - Phân quyền chỉ cho phép user truy cập
 * @returns {Object} - Thông điệp xác nhận quyền truy cập của user
 */
router.get('/user', authMiddleware, authorize('user'), (req, res) => {
  res.send({ message: 'This is user data' }); // Trả về thông điệp nếu người dùng có quyền user
});

module.exports = router; // Xuất module router để sử dụng trong ứng dụng

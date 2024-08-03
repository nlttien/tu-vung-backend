/**
 * Import các thư viện cần thiết và các module phụ:
 * - express: Khung ứng dụng web
 * - bcryptjs: Mã hóa mật khẩu
 * - jsonwebtoken: Tạo và xác minh JSON Web Tokens (JWT)
 * - body-parser: Phân tích dữ liệu yêu cầu HTTP
 * - connectDB, closeConnection: Kết nối và đóng kết nối cơ sở dữ liệu
 * - User: Mô hình người dùng
 * - authMiddleware: Middleware xác thực
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { connectDB, closeConnection } = require('./database');
const User = require('./models/User');
const authMiddleware = require('./authMiddleware');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const SECRET_KEY = 'your_secret_key';
const REFRESH_SECRET_KEY = 'your_refresh_secret_key';
app.use(cors({
  origin: 'http://localhost:3000', // Thay đổi URL này nếu ứng dụng frontend của bạn đang chạy ở địa chỉ khác
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức HTTP được phép
  allowedHeaders: ['Content-Type', 'Authorization'], // Các header được phép
  credentials: true, // Allow cookies to be sent and received
}));
/**
 * Khởi tạo máy chủ và các endpoint
 */
const startServer = async () => {
  // Kết nối đến cơ sở dữ liệu
  await connectDB();

  /**
   * Endpoint đăng ký người dùng
   * @route POST /register
   * @param {string} username - Tên người dùng
   * @param {string} password - Mật khẩu người dùng
   * @param {string} role - Vai trò của người dùng (admin/user)
   * @returns {object} - Thông báo đăng ký thành công hoặc lỗi
   */
  app.post('/register', async (req, res) => {
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
   * @route POST /login
   * @param {string} username - Tên người dùng
   * @param {string} password - Mật khẩu người dùng
   * @returns {object} - Thông báo đăng nhập thành công hoặc lỗi
   */
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(401).send({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).send({ message: 'Invalid credentials' });
      }

      // Tạo access token và refresh token
      const accessToken = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '2d' });
      const refreshToken = jwt.sign({ email: user.email }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

      // Gửi token về phía client qua cookie
      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

      res.json({ message: 'Logged in successfully' });
    } catch (error) {
      res.status(500).send({ message: 'Error logging in', error });
    }
  });

  /**
   * Endpoint làm mới token
   * @route POST /refresh-token
   * @description Xử lý yêu cầu làm mới access token bằng refresh token. 
   *                Nếu refresh token hợp lệ, một access token mới sẽ được tạo và trả về.
   *                Nếu refresh token không hợp lệ hoặc không có, trả về lỗi tương ứng.
   * @returns {object} - Thông báo làm mới token thành công hoặc lỗi
   * @returns {string} [message] - Thông báo thành công hoặc lỗi
   * @returns {number} [status] - Mã trạng thái HTTP (200 cho thành công, 401 cho không hợp lệ, 403 cho lỗi xác minh token)
   */
  app.post('/refresh-token', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.sendStatus(401);

    jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, user) => {
      if (err) return res.sendStatus(403);

      // Tạo một access token mới
      const accessToken = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '2d' });
      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
      res.json({ message: 'Token refreshed' });
    });
  });

  /**
   * Endpoint đăng xuất người dùng
   * @route POST /logout
   * @description Xử lý yêu cầu đăng xuất bằng cách xóa refresh token khỏi cơ sở dữ liệu và xóa cookies chứa access token và refresh token.
   *              Nếu không có refresh token, trả về lỗi 401. Sau khi xóa token, xóa cookies và trả về thông báo thành công.
   * @returns {object} - Thông báo về kết quả của yêu cầu đăng xuất
   * @returns {string} [message] - Thông báo thành công khi đăng xuất
   * @returns {number} [status] - Mã trạng thái HTTP (200 cho thành công, 401 cho không có refresh token)
   */
  app.post('/logout', async (req, res) => {
    // Lấy refresh token từ cookie
    const refreshToken = req.cookies.refreshToken;

    // Nếu không có refresh token, trả về lỗi 401 (Unauthorized)
    if (!refreshToken) return res.sendStatus(401);

    try {
      // Xóa cookie chứa access token
      res.clearCookie('accessToken');
      // Xóa cookie chứa refresh token
      res.clearCookie('refreshToken');

      // Trả về phản hồi thành công với thông báo đăng xuất thành công
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      // Xử lý lỗi nếu có sự cố khi xóa token
      res.status(500).json({ message: 'Error logging out', error });
    }
  });

  app.get('/verify-token', authMiddleware, (req, res) => {
    res.json({ message: 'Token is valid' });
  });

  /**
   * Middleware phân quyền dựa trên vai trò người dùng
   * @param {string} role - Vai trò yêu cầu (admin/user)
   * @returns {function} - Middleware phân quyền
   */
  const authorize = (role) => {
    return (req, res, next) => {
      if (req.user.role !== role) {
        return res.status(403).send({ message: 'Forbidden' });
      }
      next();
    };
  };

  /**
   * Endpoint bảo vệ chỉ admin có thể truy cập
   * @route GET /admin
   * @returns {object} - Dữ liệu dành cho admin
   */
  app.get('/admin', authMiddleware, authorize('admin'), (req, res) => {
    res.send({ message: 'This is admin data' });
  });

  /**
   * Endpoint bảo vệ chỉ user có thể truy cập
   * @route GET /user
   * @returns {object} - Dữ liệu dành cho user
   */
  app.get('/user', authMiddleware, authorize('user'), (req, res) => {
    res.send({ message: 'This is user data' });
  });

  // Bắt đầu lắng nghe kết nối trên cổng 3001
  app.listen(3001, () => {
    console.log('Server is running on port 3001');
  });
};

// Khởi chạy máy chủ
startServer();

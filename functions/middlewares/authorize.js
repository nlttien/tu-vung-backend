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

module.exports = { authorize };

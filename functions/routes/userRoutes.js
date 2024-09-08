const express = require('express');
const User = require('../models/user');
const router = express.Router();

// Helper function to handle errors for async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Get all users.
 * @route GET /
 */
router.get('/', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));

/**
 * Get a user by ID.
 * @route GET /:id
 * @param {string} id - User ID.
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
}));

/**
 * Create a new user.
 * @route POST /
 * @param {Object} req.body - User data.
 */
router.post('/', asyncHandler(async (req, res) => {
  const user = new User(req.body);
  const newUser = await user.save();
  res.status(201).json(newUser);
}));

/**
 * Update a user by ID.
 * @route PUT /:id
 * @param {string} id - User ID.
 * @param {Object} req.body - Updated user data.
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
}));

/**
 * Delete a user by ID.
 * @route DELETE /:id
 * @param {string} id - User ID.
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ message: 'User deleted successfully' });
}));

module.exports = router;

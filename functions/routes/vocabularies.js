const express = require('express');
const router = express.Router();
const Vocabulary = require('../models/vocabulary'); // Import the Vocabulary model to interact with the database

/**
 * Create - Thêm mới từ vựng
 * @async
 * @route POST /
 * @param {Object} req.body - Dữ liệu từ vựng được gửi từ client.
 * @returns {Object} - Từ vựng mới được tạo dưới dạng JSON.
 * @throws {Error} - Nếu có lỗi xảy ra trong quá trình lưu dữ liệu.
 */
router.post('/', async (req, res) => {
  try {
    const vocabulary = req.body; // Lấy dữ liệu từ vựng từ body của request

    const activity = "active"; // Đặt trạng thái hoạt động mặc định cho từ vựng

    // Tạo một đối tượng từ vựng mới từ dữ liệu yêu cầu và trạng thái hoạt động
    const newVocabulary = new Vocabulary({ ...vocabulary, activity });

    // Lưu từ vựng mới vào cơ sở dữ liệu và trả về kết quả dưới dạng JSON
    const savedVocabulary = await newVocabulary.save();
    res.status(201).json(savedVocabulary);
  } catch (error) {
    res.status(400).json({ message: error.message }); // Trả về lỗi 400 nếu có lỗi xảy ra
  }
});

/**
 * Read - Lấy tất cả từ vựng
 * @async
 * @route GET /
 * @returns {Array} - Danh sách tất cả từ vựng dưới dạng JSON.
 * @throws {Error} - Nếu có lỗi xảy ra trong quá trình truy xuất dữ liệu.
 */
router.get('/', async (req, res) => {
  try {
    const vocabularies = await Vocabulary.find(); // Lấy tất cả từ vựng từ cơ sở dữ liệu
    res.json(vocabularies); // Trả về danh sách từ vựng dưới dạng JSON
  } catch (error) {
    res.status(500).json({ message: error.message }); // Trả về lỗi 500 nếu có lỗi xảy ra
  }
});

/**
 * Read - Lấy từ vựng theo ID
 * @async
 * @route GET /:id
 * @param {string} id - ID của từ vựng cần lấy thông tin.
 * @returns {Object} - Thông tin từ vựng dưới dạng JSON.
 * @throws {Error} - Nếu có lỗi xảy ra hoặc từ vựng không được tìm thấy.
 */
router.get('/:id', async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id); // Lấy từ vựng từ cơ sở dữ liệu theo ID
    if (!vocabulary) {
      return res.status(404).json({ message: 'Vocabulary not found' }); // Trả về lỗi 404 nếu không tìm thấy từ vựng
    }
    res.json(vocabulary); // Trả về thông tin từ vựng dưới dạng JSON
  } catch (error) {
    res.status(500).json({ message: error.message }); // Trả về lỗi 500 nếu có lỗi xảy ra
  }
});

/**
 * Update - Cập nhật từ vựng theo ID
 * @async
 * @route PUT /:id
 * @param {string} id - ID của từ vựng cần cập nhật.
 * @param {Object} req.body - Dữ liệu cập nhật từ client.
 * @returns {Object} - Thông tin từ vựng đã được cập nhật dưới dạng JSON.
 * @throws {Error} - Nếu có lỗi xảy ra hoặc từ vựng không được tìm thấy.
 */
router.put('/:id', async (req, res) => {
  try {
    // Tìm và cập nhật từ vựng theo ID, trả về kết quả cập nhật
    const updatedVocabulary = await Vocabulary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedVocabulary) {
      return res.status(404).json({ message: 'Vocabulary not found' }); // Trả về lỗi 404 nếu không tìm thấy từ vựng
    }
    res.json(updatedVocabulary); // Trả về thông tin từ vựng đã được cập nhật dưới dạng JSON
  } catch (error) {
    res.status(400).json({ message: error.message }); // Trả về lỗi 400 nếu có lỗi xảy ra
  }
});

/**
 * Delete - Xóa từ vựng theo ID
 * @async
 * @route DELETE /:id
 * @param {string} id - ID của từ vựng cần xóa.
 * @returns {Object} - Thông báo xóa thành công hoặc lỗi nếu từ vựng không được tìm thấy.
 * @throws {Error} - Nếu có lỗi xảy ra trong quá trình xóa từ vựng.
 */
router.delete('/:id', async (req, res) => {
  try {
    // Tìm và xóa từ vựng theo ID
    const deletedVocabulary = await Vocabulary.findByIdAndDelete(req.params.id);
    if (!deletedVocabulary) {
      return res.status(404).json({ message: 'Vocabulary not found' }); // Trả về lỗi 404 nếu không tìm thấy từ vựng
    }
    res.json({ message: 'Vocabulary deleted successfully' }); // Trả về thông báo thành công
  } catch (error) {
    res.status(500).json({ message: error.message }); // Trả về lỗi 500 nếu có lỗi xảy ra
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { classifyVocabularyByField } = require('../src/genkit'); // Import hàm phân loại từ vựng theo lĩnh vực
const { generateVocabularyForms } = require('../src/genkit'); // Import hàm tạo các dạng thức từ vựng
const axios = require('axios'); // Import thư viện axios để gửi yêu cầu HTTP

/**
 * POST /search
 * Tìm kiếm từ vựng theo chủ đề, phân loại từ vựng, tạo các dạng thức từ vựng và chuyển đổi cách đọc của từ
 * 
 * @route POST /search
 * @param {string} subject - Chủ đề hoặc từ vựng cần tìm kiếm
 * @returns {Object} - Trả về thông tin từ vựng bao gồm: từ tiếng Nhật, phân loại từ vựng, các dạng thức từ vựng, và cách đọc của từ
 */
router.post('/search', async (req, res) => {
  const { subject } = req.body; // Lấy giá trị 'subject' từ yêu cầu
  try {
    // Phân loại từ vựng theo lĩnh vực
    const classify = await classifyVocabularyByField(subject);
    
    // Tạo các dạng thức từ vựng
    const vocabularyForms = await generateVocabularyForms(subject);
    
    // Gửi yêu cầu HTTP đến một dịch vụ bên ngoài để chuyển đổi cách đọc của từ vựng
    const yomikata = await axios.post("https://convert-tu-vung-a4dyqf7unq-uc.a.run.app", { query: subject });
    
    // Trả về kết quả tìm kiếm, bao gồm từ vựng tiếng Nhật, phân loại từ, các dạng thức từ vựng, và cách đọc của từ
    res.json({ japaneseWord: subject, ...classify, vocabularyForms, ...yomikata.data });
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; // Xuất module router để sử dụng trong ứng dụng

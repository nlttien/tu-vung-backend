const express = require('express');
const router = express.Router();
const { getVocabularyDetails, generateVocabularyForms, generateOrigin } = require('../src/genkit.v1');
const axios = require('axios');

const yomikataUrl = "https://convert-tu-vung-a4dyqf7unq-uc.a.run.app";
const yomikataMultiUrl = "https://convert-multi-tu-vung-a4dyqf7unq-uc.a.run.app";

/**
 * POST /search
 * Tìm kiếm từ vựng theo chủ đề, phân loại từ vựng, tạo các dạng thức từ vựng và chuyển đổi cách đọc của từ
 * 
 * @route POST /search
 * @param {string} subject - Chủ đề hoặc từ vựng cần tìm kiếm
 * @returns {Object} - Trả về thông tin từ vựng bao gồm: từ tiếng Nhật, phân loại từ vựng, các dạng thức từ vựng, và cách đọc của từ
 */
router.post('/search', async (req, res) => {
  const { subject } = req.body;
  try {
    // Sử dụng Promise.all để thực hiện các yêu cầu đồng thời
    const [generated, vocabularyForms, origin, yomikata] = await Promise.all([
      getVocabularyDetails(subject),
      generateVocabularyForms(subject),
      generateOrigin(subject),
      axios.post(yomikataUrl, { query: subject }),
    ]);

    // Lấy Yomikata cho related_words và antonyms
    const [yomikataRelatedWords, yomikataAntonyms] = await Promise.all([
      axios.post(yomikataMultiUrl, { query: generated.related_words || [] }),
      axios.post(yomikataMultiUrl, { query: generated.antonyms || [] })
    ]);

    // Gán kết quả Yomikata vào object generated
    generated.related_words = yomikataRelatedWords.data;
    generated.antonyms = yomikataAntonyms.data;

    // Trả về kết quả
    res.json({ japaneseWord: subject, ...generated, vocabularyForms, ...yomikata.data, origin });
  } catch (error) {
    console.error("Error processing request:", error); // Log error for debugging
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

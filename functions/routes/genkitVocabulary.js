const express = require('express');
const router = express.Router();
const { giaiThichNguPhap, getVocabularyDetails, generateOrigin } = require('../src/genkit.v5');
const axios = require('axios');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorize');

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
router.post('/search', authMiddleware, authorize('user'), async (req, res) => {
  const { subject } = req.body;
  const userData = req.user;

  try {
    // Sử dụng Promise.all để thực hiện các yêu cầu đồng thời
    const [generated,origin,yomikata] = await Promise.all([
      getVocabularyDetails(subject,userData.id),
      generateOrigin(subject, userData.id),
      axios.post(yomikataUrl, { query: subject }),
    ]);

    // Lấy Yomikata cho related_words và antonyms
    const [yomikataRelatedWords, yomikataAntonyms] = await Promise.all([
      axios.post(yomikataMultiUrl, { query: generated.related_words.map(item => item.japaneseWord) || [] }),
      axios.post(yomikataMultiUrl, { query: generated.antonyms.map(item => item.japaneseWord) || [] })
    ]);

    // Gán kết quả Yomikata vào object generated
    generated.related_words = generated.related_words.map((word, index) => ({
      ...word,
      ...yomikataRelatedWords.data[index]
    }));

    generated.antonyms = generated.antonyms.map((word, index) => ({
      ...word,
      ...yomikataAntonyms.data[index]
    }));

    res.json({ ...generated, ...yomikata.data, origin });
    // res.json({ origin });
  } catch (error) {
    console.error("Error processing request:", error); // Log error for debugging
    res.status(500).json({ error: error.message });
  }
});

router.post('/search/ngu-phap', async (req, res) => {
  const { subject } = req.body;
  try {
    // Sử dụng Promise.all để thực hiện các yêu cầu đồng thời
    const [nguPhap] = await Promise.all([
      giaiThichNguPhap(subject),
    ]);

    // Trả về kết quả
    res.json({ subject, ...nguPhap });
  } catch (error) {
    console.error("Error processing request:", error); // Log error for debugging
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

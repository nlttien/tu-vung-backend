const express = require('express');
const router = express.Router();
const { classifyVocabularyByField, generateOrigin } = require('../src/genkit.v1'); // Import hàm phân loại từ vựng theo lĩnh vực
const { generateVocabularyForms } = require('../src/genkit.v1'); // Import hàm tạo các dạng thức từ vựng
const axios = require('axios'); // Import thư viện axios để gửi yêu cầu HTTP
// const { generateText } = require('../src/genkit.v2');
// const { generateVocabularyForms } = require('../src/genkit.v2');
// const { generateOrigin } = require('../src/genkit.v2');

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
    const [generated, vocabularyForms, origin, yomikata] = await Promise.all([
      classifyVocabularyByField(subject),
      generateVocabularyForms(subject),
      generateOrigin(subject),
      axios.post("https://convert-tu-vung-a4dyqf7unq-uc.a.run.app", { query: subject }),
    ]);

    const [yomikataRelatedWords, yomikataAntonyms] = await Promise.all([
      axios.post("https://convert-multi-tu-vung-a4dyqf7unq-uc.a.run.app", { query: generated.related_words || [] }),
      axios.post("https://convert-multi-tu-vung-a4dyqf7unq-uc.a.run.app", { query: generated.antonyms || [] })
    ]);

    generated.related_words = yomikataRelatedWords.data
    generated.antonyms = yomikataAntonyms.data

    // Trả về kết quả tìm kiếm, bao gồm từ vựng tiếng Nhật, phân loại từ, các dạng thức từ vựng, và cách đọc của từ
    res.json({ japaneseWord: subject, ...generated, vocabularyForms, ...yomikata.data, origin });
    // res.json(generated);
    // const [generated, vocabularyForms,origin] = await Promise.all([
    //   generateText(subject),
    //   generateVocabularyForms(subject),
    //   generateOrigin(subject),
    // ]);
    // console.log(subject);
    // const generatedClean = JSON.parse(generated)


    // res.json({ ...generatedClean, vocabularyForms: JSON.parse(vocabularyForms),origin })
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; // Xuất module router để sử dụng trong ứng dụng

const mongoose = require('mongoose');

// Định nghĩa schema cho mô hình từ vựng
const vocabularySchema = new mongoose.Schema({
  category: {
    type: String, // Loại từ (ví dụ: danh từ, động từ, tính từ)
    required: true
  },
  japaneseWord: {
    type: String, // Từ tiếng Nhật
    required: true
  },
  vietnameseMeaning: {
    type: String, // Nghĩa tiếng Việt của từ
    required: true
  },
  joined_hira: {
    type: String, // Phiên âm Hiragana của từ
    required: true
  },
  color: {
    type: String, // Mã màu liên quan đến phân loại từ
    required: true
  },
  popularity: {
    type: Number, // Độ thông dụng của từ (dưới dạng phần trăm)
    required: true
  },
  related_words: {
    type: [String], // Mảng các từ liên quan đến từ hiện tại
    required: false
  },
  antonyms: {
    type: [String], // Mảng các từ trái nghĩa với từ hiện tại
    required: false
  },
  vocabularyForms: {
    dictionary: { type: String, required: true }, // Dạng từ điển của từ
    past: { type: String, required: true }, // Dạng quá khứ của từ
    negative: { type: String, required: true }, // Dạng phủ định của từ
    polite: { type: String, required: true }, // Dạng lịch sự của từ
    te: { type: String, required: true }, // Dạng -te của từ
    potential: { type: String, required: true }, // Dạng khả năng của từ
    passive: { type: String, required: true }, // Dạng bị động của từ
    causative: { type: String, required: true }, // Dạng nguyên nhân của từ
    causative_passive: { type: String, required: true }, // Dạng nguyên nhân bị động của từ
    conditional: { type: String, required: true }, // Dạng điều kiện của từ
    imperative: { type: String, required: true }, // Dạng mệnh lệnh của từ
    volitional: { type: String, required: true }, // Dạng nguyện vọng của từ
    prohibitive: { type: String, required: true } // Dạng cấm đoán của từ
  },
  converted_data: {
    type: String, // Dữ liệu chuyển đổi liên quan đến từ
    required: true
  }
}, {
  timestamps: true // Tự động thêm các trường createdAt và updatedAt vào mô hình
});

// Tạo model từ schema
const Vocabulary = mongoose.model('Vocabulary', vocabularySchema, 'vocabularyCollection');

module.exports = Vocabulary; // Xuất model để sử dụng trong các phần khác của ứng dụng

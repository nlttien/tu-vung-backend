const mongoose = require('mongoose');

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
    type: String, // Nghĩa tiếng Việt
    required: true
  },
  joined_hira: {
    type: String, // Cách đọc
    required: true
  },
  category: {
    type: String, // Phân loại
    required: true
  },
  color: {
    type: String, // Mã màu liên quan đến phân loại
    required: true
  },
  popularity: {
    type: Number, // Độ thông dụng (%)
    required: true
  },
  vietnameseMeaning: {
    type: String, // Giải thích ý nghĩa của từ
    required: true
  },
  related_words: {
    type: [String], // Mảng các từ liên quan
    required: false
  },
  antonyms: {
    type: [String], // Mảng các từ trái nghĩa
    required: false
  },
  vocabularyForms: {
    dictionary: { type: String, required: true },
    past: { type: String, required: true },
    negative: { type: String, required: true },
    polite: { type: String, required: true },
    te: { type: String, required: true },
    potential: { type: String, required: true },
    passive: { type: String, required: true },
    causative: { type: String, required: true },
    causative_passive: { type: String, required: true },
    conditional: { type: String, required: true },
    imperative: { type: String, required: true },
    volitional: { type: String, required: true },
    prohibitive: { type: String, required: true }
  },
  joined_hira: {
    type: String, // Phiên âm Hiragana của từ
    required: true
  },
  converted_data: {
    type: String, // Dữ liệu chuyển đổi
    required: true
  }
}, {
  timestamps: true // Tự động thêm các trường createdAt và updatedAt
});

// Tạo model từ schema
const Vocabulary = mongoose.model('Vocabulary', vocabularySchema, 'vocabularyCollection');

module.exports = Vocabulary;

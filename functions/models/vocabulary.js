const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
  type: {
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
  reading: {
    type: String, // Cách đọc
    required: true
  },
  activity: {
    type: String, // Hoạt động liên quan
    required: false // Không bắt buộc
  },
  hanzi: {
    type: String, // Âm Hán (nếu có)
    required: false // Không bắt buộc
  },
  note: {
    type: String, // Ghi chú
    required: false // Không bắt buộc
  }
}, {
  timestamps: true // Tự động thêm các trường createdAt và updatedAt
});

// Tạo model từ schema
const Vocabulary = mongoose.model('Vocabulary', vocabularySchema, 'vocabularyCollection');

module.exports = Vocabulary;

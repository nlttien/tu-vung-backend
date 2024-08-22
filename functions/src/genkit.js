const { configureGenkit } = require('@genkit-ai/core');
const { googleAI } = require('@genkit-ai/googleai');
const { generate } = require('@genkit-ai/ai');
const { gemini15Flash } = require('@genkit-ai/googleai');

// Cấu hình Genkit AI
// Đặt cấu hình cho Genkit AI, bao gồm tích hợp plugin Google AI với API Key và các thiết lập khác.
configureGenkit({
  plugins: [
    googleAI({ apiKey: "AIzaSyDefMnSigeOr7isT6GFz1vTtKlbgQw1DLM" }), // Sử dụng Google AI plugin với API Key
  ],
  logLevel: 'debug', // Đặt mức độ log là 'debug' để theo dõi chi tiết hoạt động
  enableTracingAndMetrics: true, // Bật tính năng theo dõi và đo lường hiệu suất
});

/**
 * Phân loại từ vựng theo lĩnh vực và đánh giá độ thông dụng
 * @param {string} vocabulary - Từ vựng cần phân loại
 * @returns {Promise<Object>} - Kết quả phân loại và thông tin từ vựng dưới dạng JSON
 */
const classifyVocabularyByField = async (vocabulary) => {
  const prompt = `
  Kiểm tra xem từ vựng "${vocabulary}" có phải là tiếng Nhật không. Nếu không phải, trả về "Không phải tiếng Nhật".
  Nếu từ vựng là tiếng Nhật, thực hiện các yêu cầu sau:
    - Phân loại từ vựng vào các lĩnh vực trong đời sống như thực phẩm, du lịch, công nghệ, y tế, giáo dục, thể thao, v.v.
    - Đánh giá độ thông dụng của từ vựng "${vocabulary}" và trả về giá trị phần trăm (0-100%).
    - Giải thích ý nghĩa của từ tiếng Nhật "${vocabulary}" khoảng 40-50 chữ.
    - Liệt kê những từ liên quan và những từ trái nghĩa với từ "${vocabulary}".

  Vui lòng trả về kết quả theo định dạng JSON và không giải thích gì thêm:
  {
    "category": "phân loại",
    "color": "màu sắc để liên tưởng tới phân loại trả bằng mã #000000",
    "popularity": "độ thông dụng (%)",
    "vietnameseMeaning": "giải thích ý nghĩa của từ",
    "related_words": ["từ liên quan 1", "từ liên quan 2", ...],
    "antonyms": ["từ trái nghĩa 1", "từ trái nghĩa 2", ...],
  }
  Ví dụ: 
  {
    "category": "Công nghệ",
    "color": "#FF5733",
    "popularity": "85",
    "vietnameseMeaning": "Nhìn nhận sự việc một cách khách quan, không bị ảnh hưởng bởi cảm xúc cá nhân.",
    "related_words": ["客観的", "視点"],
    "antonyms": ["主観"],
  }
  `;

  // Gọi hàm generate từ Genkit AI với prompt đã tạo
  const llmResponse = await generate({
    model: gemini15Flash, // Sử dụng model gemini15Flash từ Google AI
    prompt: prompt, // Gửi prompt để yêu cầu xử lý từ vựng
    config: {
      temperature: 0.3, // Giảm nhiệt độ để có kết quả phân loại chính xác hơn
    },
  });

  // Lấy văn bản kết quả từ phản hồi của model
  let resultText = llmResponse.text();

  // Làm sạch chuỗi JSON nếu nó có chứa các ký tự không mong muốn
  let cleanedJsonString = resultText.includes('json') ? resultText.replace('```json', '') : resultText;
  cleanedJsonString = cleanedJsonString.includes('```') ? cleanedJsonString.replace('```', '') : cleanedJsonString.trim();

  // Phân tích chuỗi JSON đã làm sạch thành đối tượng
  try {
    resultText = JSON.parse(cleanedJsonString.replace(/\n/g, ''));
  } catch (error) {
    return `{
    "category": "Công nghệ",
    "color": "#FF5733",
    "popularity": "85",
    "vietnameseMeaning": "Nhìn nhận sự việc một cách khách quan, không bị ảnh hưởng bởi cảm xúc cá nhân.",
    "related_words": ["客観的", "視点"],
    "antonyms": ["主観"],
  }`
  }

  return resultText; // Trả về kết quả cuối cùng
};


/**
 * Tạo các thể khác nhau của từ vựng tiếng Nhật
 * @param {string} vocabulary - Từ vựng cần xử lý
 * @returns {Promise<string>} - Kết quả các thể của từ vựng dưới dạng JSON
 */
const generateVocabularyForms = async (vocabulary) => {
  const prompt = `
    Tạo các thể khác nhau của từ vựng tiếng Nhật "${vocabulary}". Bao gồm các thể sau:
  1. Từ điển (辞書)
  2. Quá khứ (た)
  3. Phủ định (未然)
  4. Lịch sự (丁寧)
  5. te (て)
  6. Khả năng (可能)
  7. Thụ động (受身)
  8. Sai khiến (使役)
  9. Sai khiến thụ động (使役受身)
  10. Điều kiện (条件)
  11. Mệnh lệnh (命令)
  12. Ý chí (意向)
  13. Cấm chỉ (禁止)

  Vui lòng trả về các thể của từ vựng trong định dạng JSON sau và không giải thích gì thêm:
  {
    "dictionary": "từ điển",
    "past": "quá khứ",
    "negative": "phủ định",
    "polite": "lịch sự",
    "te": "te",
    "potential": "khả năng",
    "passive": "thụ động",
    "causative": "sai khiến",
    "causative_passive": "sai khiến thụ động",
    "conditional": "điều kiện",
    "imperative": "mệnh lệnh",
    "volitional": "ý chí",
    "prohibitive": "cấm chỉ"
  }
  Ví dụ:
  {
    "dictionary": "勉強する",
    "past": "勉強した",
    "negative": "勉強しない",
    "polite": "勉強します",
    "te": "勉強して",
    "potential": "勉強できる",
    "passive": "勉強される",
    "causative": "勉強させる",
    "causative_passive": "勉強させられる",
    "conditional": "勉強すれば",
    "imperative": "勉強しろ",
    "volitional": "勉強したい",
    "prohibitive": "勉強するな"
  }
  `;

  // Gọi hàm generate từ Genkit AI với prompt đã tạo
  const llmResponse = await generate({
    model: gemini15Flash, // Sử dụng model gemini15Flash từ Google AI
    prompt: prompt, // Gửi prompt để yêu cầu tạo các thể từ vựng
    config: {
      temperature: 0.5, // Đảm bảo tính chính xác
      maxTokens: 150, // Đảm bảo đủ không gian cho các thể của từ vựng
    },
  });

  // Lấy kết quả từ phản hồi của model và xóa bỏ các khoảng trắng không cần thiết
  let resultText = llmResponse.text().trim();

  let cleanedJsonString = resultText.includes('json') ? resultText.replace('```json', '') : resultText;
  cleanedJsonString = cleanedJsonString.includes('```') ? cleanedJsonString.replace('```', '') : cleanedJsonString.trim();

  // Phân tích chuỗi JSON đã làm sạch thành đối tượng
  try {
    resultText = JSON.parse(cleanedJsonString.replace(/\n/g, ''));
  } catch (error) {
    return resultText;
  }

  return resultText; // Trả về kết quả cuối cùng
};

const generateOrigin = async (vocabulary) => {
  const prompt = `
  Kiểm tra xem từ vựng "${vocabulary}" có phải là tiếng Nhật không. Nếu không phải, trả về "Không phải tiếng Nhật".
  Nếu từ vựng là tiếng Nhật, thực hiện các yêu cầu sau:
    - Nguồn gốc: Nguồn gốc của từ "${vocabulary}" trong tiếng nhật

  Vui lòng trả về kết quả và không giải thích gì thêm chỉ cần kết quả không cần chú thích gì cả:
  ví dụ: Từ '無心' được tạo thành từ hai chữ Hán '無' (mu) nghĩa là 'không' và '心' (shin) nghĩa là 'tâm'. 
  trả lời bằng Tiếng Việt
  `;

  // Gọi hàm generate từ Genkit AI với prompt đã tạo
  const llmResponse = await generate({
    model: gemini15Flash, // Sử dụng model gemini15Flash từ Google AI
    prompt: prompt, // Gửi prompt để yêu cầu xử lý từ vựng
    config: {
      temperature: 0.3, // Giảm nhiệt độ để có kết quả phân loại chính xác hơn
    },
  });

  // Lấy văn bản kết quả từ phản hồi của model
  let resultText = llmResponse.text()

  return resultText; // Trả về kết quả cuối cùng
};

// Xuất các hàm để sử dụng trong các module khác
module.exports = {
  classifyVocabularyByField,
  generateVocabularyForms,
  generateOrigin,
};

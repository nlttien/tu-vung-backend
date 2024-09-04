const { configureGenkit } = require('@genkit-ai/core');
const { googleAI } = require('@genkit-ai/googleai');
const { generate } = require('@genkit-ai/ai');
const { gemini15Flash } = require('@genkit-ai/googleai');


// Cấu hình Genkit AI
// Đặt cấu hình cho Genkit AI, bao gồm tích hợp plugin Google AI với API Key và các thiết lập khác.
configureGenkit({
  plugins: [
    googleAI({ apiKey: "AIzaSyDefMnSigeOr7isT6GFz1vTtKlbgQw1DLM" }), // Sử dụng Google AI plugin với API Key
    // googleAI({ apiKey: "AIzaSyDOlcrmpbtzdArD2Iv9-OvyxGm21mV30Rg" }), // Sử dụng Google AI plugin với API Key gemini pro
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
  yêu cầu trả về đúng định dạng file json
  Nếu "${vocabulary}" không phải tiếng nhật:

  {
    "error": "Vui lòng nhập một từ tiếng nhật."
  }

  nếu từ vựng không phải trường hợp trên thì xử lý những yêu cầu bên dưới

  thực hiện các yêu cầu sau đối với từ vựng tiếng Nhật "${vocabulary}":

  1. Phân loại từ vựng vào một hoặc nhiều lĩnh vực trong đời sống (ví dụ: thực phẩm, du lịch, công nghệ, y tế, giáo dục, thể thao, v.v.).

  2. Đánh giá độ thông dụng của từ vựng và trả về giá trị phần trăm (0-100%).

  3. Giải thích ý nghĩa của từ rõ ràng trong khoảng 40-60 chữ.

  4. Giải thích cách dùng của từ vựng, bao gồm các ngữ cảnh, cấu trúc câu hoặc bất kỳ lưu ý đặc biệt nào.

  5. Liệt kê tối đa {num_related_words} từ liên quan và tối đa {num_antonyms} từ trái nghĩa (nếu có). Nếu không tìm thấy từ trái nghĩa, hãy để trống trường "antonyms" hoặc trả về thông báo "Không có từ trái nghĩa rõ ràng.".

  6. Nếu từ vựng không tồn tại hoặc không thể xử lý, hãy trả về thông báo lỗi sau: {"error": "Không thể xử lý từ vựng này."}

  7. Nếu có thể, hãy cung cấp thông tin về độ khó của từ vựng (sơ cấp, trung cấp, nâng cao), một hoặc hai câu ví dụ bằng tiếng nhật sử dụng từ trong ngữ cảnh.

  Vui lòng trả về kết quả theo định dạng JSON sau:

  {
    "categories": ["phân loại 1", "phân loại 2", ...],
    "color": "#mã màu hex để liên tưởng tới phân loại",
    "popularity": "độ thông dụng (%)",
    "difficulty": "độ khó (sơ cấp, trung cấp, nâng cao)",
    "vietnameseMeaning": "giải thích ý nghĩa của từ "${vocabulary}" giải thích hơn 40 từ",
    "usage": "giải thích cách dùng của từ vựng",
    "examples": ["ví dụ 1", "ví dụ 2"],
    "nihonMeaning": "giải thích nghĩa của từ "${vocabulary}" bằng tiếng nhật và không dùng chính từ đó hoặc từ đồng nghĩa để giải thích. định nghĩa ngắn gọn và súc tích bằng tiếng Nhật, cấm lặp lại một từ",
    "related_words": ["từ liên quan 1", "từ liên quan 2", ...],
    "antonyms": ["từ trái nghĩa 1", "từ trái nghĩa 2", ...]
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
    return JSON.parse(`{
      "category": "Công nghệ",
      "color": "#FF5733",
      "popularity": "85",
      "vietnameseMeaning": "Nhìn nhận sự việc một cách khách quan, không bị ảnh hưởng bởi cảm xúc cá nhân.",
      "related_words": ["客観的", "視点"],
      "antonyms": ["主観"],
    }`);
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
  Tạo các thể khác nhau của từ vựng tiếng Nhật "${vocabulary}". 

  **Lưu ý:**

  * Một số động từ có cách chia bất quy tắc, hãy đảm bảo cung cấp các thể chính xác cho những trường hợp này.
  * Nếu có thể, hãy cung cấp thêm thông tin về các thể, ví dụ như mức độ trang trọng của các thể lịch sự khác nhau.

  Bao gồm các thể sau:

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
  thực hiện các yêu cầu sau đối với từ vựng tiếng Nhật "${vocabulary}":
      - Nguồn gốc: Nguồn gốc của từ "${vocabulary}" trong tiếng nhật

  ví dụ: "購入" mang ý nghĩa "mua vào" hoặc "thu được bằng cách mua". Từ này thường được sử dụng trong các ngữ cảnh trang trọng hoặc kinh doanh hơn so với từ "買う" (kau), một từ tiếng Nhật bản địa cũng có nghĩa là "mua".
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

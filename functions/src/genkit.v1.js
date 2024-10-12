const { configureGenkit } = require('@genkit-ai/core');
const { googleAI } = require('@genkit-ai/googleai');
const { generate } = require('@genkit-ai/ai');
const { gemini15Flash } = require('@genkit-ai/googleai');

// Configure Genkit AI with Google AI plugin and settings
configureGenkit({
  plugins: [
    googleAI({ apiKey: "AIzaSyDefMnSigeOr7isT6GFz1vTtKlbgQw1DLM" }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Function to classify vocabulary by field and get information
const getVocabularyDetails = async (vocabulary) => {
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

  try {
    const llmResponse = await generate({
      model: gemini15Flash,
      prompt,
      config: {
        temperature: 0.3,
      },
    });

    let resultText = llmResponse.text();
    let cleanedJsonString = resultText.includes('json') ? resultText.replace('```json', '') : resultText;
    cleanedJsonString = cleanedJsonString.includes('```') ? cleanedJsonString.replace('```', '') : cleanedJsonString.trim();

    return JSON.parse(cleanedJsonString.replace(/\n/g, ''));
  } catch (error) {
    // Provide a default response if JSON parsing fails
    return {
      "error": error.message
    };
  }
};

const generateOrigin = async (vocabulary) => {
  const prompt = `
  Bạn hãy cho biết nguồn gốc của từ tiếng Nhật "${vocabulary}".
  
  Ví dụ: 
  Từ "購入" mang ý nghĩa "mua vào" hoặc "thu được bằng cách mua". Từ này thường được sử dụng trong các ngữ cảnh trang trọng hoặc kinh doanh hơn so với từ "買う" (kau), một từ tiếng Nhật bản địa cũng có nghĩa là "mua".
  
  Hãy trả lời bằng tiếng Việt.
  `;

  const llmResponse = await generate({
    model: gemini15Flash,
    prompt,
    config: {
      temperature: 0.3,
    },
  });

  return llmResponse.text();
};

const giaiThichNguPhap = async (vocabulary) => {
  const prompt = `
  yêu cầu trả về đúng định dạng file json
      Nếu "${vocabulary}" không phải ngữ pháp tiếng nhật:
    
      {
        "error": "Vui lòng nhập một cấu trúc ngữ pháp tiếng nhật."
      }
    
      nếu "${vocabulary}" là câu văn thì phân tích ngữ pháp có trong câu văn đó nếu không có ngữ pháp nào tồn tại thì trả về "không có"
    
      nếu không phải 2 trường hợp trên thì xử lý những yêu cầu bên dưới
    
      thực hiện các yêu cầu sau đối với cấu trúc ngữ pháp tiếng Nhật "${vocabulary}":
    
      1. Giải thích cấu trúc ngữ pháp "${vocabulary}" bằng tiếng Việt.
    
      2. Đưa ra 10 ví dụ minh họa cho cấu trúc ngữ pháp "${vocabulary}" bằng tiếng Nhật.
    
      3. Dịch 10 ví dụ minh họa ở trên sang tiếng Việt.
      
      4. Lưu ý khi sử dụng cấu trúc ngữ pháp "${vocabulary}".
    
      Vui lòng trả về kết quả theo định dạng JSON sau:
    
      {
        "explanation": "Giải thích cấu trúc ngữ pháp '${vocabulary}'",
        "examples": [
          {
            "japanese": "Ví dụ tiếng Nhật 1",
            "vietnamese": "Dịch ví dụ 1"
          },
          {
            "japanese": "Ví dụ tiếng Nhật 2",
            "vietnamese": "Dịch ví dụ 2"
          }
        ],
        "notes": "Lưu ý khi sử dụng"
      }
  `;

  try {
    const llmResponse = await generate({
      model: gemini15Flash,
      prompt,
      config: {
        temperature: 0.3,
      },
    });

    let resultText = llmResponse.text();
    let cleanedJsonString = resultText.includes('json') ? resultText.replace('```json', '') : resultText;
    cleanedJsonString = cleanedJsonString.includes('```') ? cleanedJsonString.replace('```', '') : cleanedJsonString.trim();

    return JSON.parse(cleanedJsonString.replace(/\n/g, ''));
  } catch (error) {
    // Provide a default response if JSON parsing fails
    return {
      "error": error.message
    };
  }
};

module.exports = {
  getVocabularyDetails,
  generateOrigin,
  giaiThichNguPhap,
};

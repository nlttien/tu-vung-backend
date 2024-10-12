const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");
const admin = require('firebase-admin');
var serviceAccount = require("../tu-vung-447ad-firebase-adminsdk-lqtzk-d16ccd9ad3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tu-vung-447ad-default-rtdb.firebaseio.com"
});

const db = admin.database();

const genAI = new GoogleGenerativeAI("AIzaSyA86UPPiewtkKBC8BPgX5w4obwEJuZJyps");

const generationConfig = {
  temperature: 0.5,
  topP: 0.95,
  topK: 64,
  responseMimeType: "text/plain",
};

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig });

const generationConfigJson = {
  temperature: 0.5,
  topP: 0.95,
  topK: 64,
  responseMimeType: "application/json",
};

const modelJson = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfigJson });

const getVietnameseMeaning = async (vocabulary, userId, theme) => {
  const prompt = `giải thích ý nghĩa của từ "${vocabulary}"${theme ? ` và theo chủ đề ${theme}` : ""} giải thích hơn 40 từ`;

  try {
    const ref = db.ref(`tu-vung/${userId}`);

    const llmResponse = await model.generateContentStream(prompt);

    let fullResponse = '';

    // Duyệt qua các chunk của kết quả stream
    for await (const chunk of llmResponse.stream) {
      // Kết hợp các chunk text lại thành một chuỗi hoàn chỉnh
      fullResponse += chunk.text();
      ref.update({
        origin: fullResponse // Assuming you want to update the 'origin' field in Firebase
      });
    }

    return fullResponse;
  } catch (error) {
    return {
      "error": error.message
    };
  }
};

const getNihonMeaning = async (vocabulary, userId, theme) => {
  const prompt = `giải thích nghĩa của từ "${vocabulary}" bằng tiếng nhật${theme ? ` và theo chủ đề ${theme}` : ""}. Không dùng chính từ đó hoặc từ đồng nghĩa để giải thích. định nghĩa ngắn gọn dễ hiểu bằng tiếng Nhật, cấm lặp lại một từ`;

  try {
    const ref = db.ref(`tu-vung/${userId}`);

    const llmResponse = await model.generateContentStream(prompt);

    let fullResponse = '';

    // Duyệt qua các chunk của kết quả stream
    for await (const chunk of llmResponse.stream) {
      // Kết hợp các chunk text lại thành một chuỗi hoàn chỉnh
      fullResponse += chunk.text();
      ref.update({
        origin: fullResponse // Assuming you want to update the 'origin' field in Firebase
      });
    }

    return fullResponse;
  } catch (error) {
    return {
      "error": error.message
    };
  }
};


const getOtherDetails = async (vocabulary) => {
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

  4. Giải thích cách dùng của từ vựng, bao gồm các ngữ cảnh, cấu trúc câu hoặc bất kỳ lưu ý đặc biệt nào.

  5. Liệt kê tối đa 7 từ liên quan. và tối đa 5 từ trái nghĩa (nếu có). 
     * Đối với mỗi từ liên quan và từ trái nghĩa, hãy cung cấp:
         * Từ vựng
         * Ý nghĩa ngắn gọn nhất có thể
         * Giải thích ý nghĩa của từ đó

     * Nếu không tìm thấy từ trái nghĩa, hãy để trống trường "antonyms" hoặc trả về thông báo "Không có từ trái nghĩa rõ ràng.".

  6. Nếu từ vựng không tồn tại hoặc không thể xử lý, hãy trả về thông báo lỗi sau: {"error": "Không thể xử lý từ vựng này."}

  7. Nếu có thể, hãy cung cấp thông tin về độ khó của từ vựng (sơ cấp, trung cấp, nâng cao), một hoặc hai câu ví dụ bằng tiếng nhật sử dụng từ trong ngữ cảnh.

  Vui lòng trả về kết quả theo định dạng JSON sau:

  {
    "categories": ["phân loại 1", "phân loại 2", ...],
    "color": "#mã màu hex để liên tưởng tới phân loại",
    "popularity": "độ thông dụng (%)",
    "difficulty": "độ khó (sơ cấp, trung cấp, nâng cao)",
    "usage": "giải thích cách dùng của từ vựng",
    "examples": ["ví dụ 1", "ví dụ 2"],
    "related_words": [{"japaneseWord": "từ liên quan 1", "meaning": "ý nghĩa ngắn gọn", "explanation": "giải thích ý nghĩa"}, {"japaneseWord": "từ liên quan 2", "meaning": "ý nghĩa ngắn gọn", "explanation": "giải thích ý nghĩa"}, ...],
    "antonyms": [{"japaneseWord": "từ trái nghĩa 1", "meaning": "ý nghĩa ngắn gọn", "explanation": "giải thích ý nghĩa"}, {"japaneseWord": "từ trái nghĩa 2", "meaning": "ý nghĩa ngắn gọn", "explanation": "giải thích ý nghĩa"}, ...]
  }
  `;

  try {
    const llmResponse = await modelJson.generateContent(prompt);

    let resultText = llmResponse.response.text();
    let cleanedJsonString = resultText.includes('json') ? resultText.replace('```json', '') : resultText;
    cleanedJsonString = cleanedJsonString.includes('```') ? cleanedJsonString.replace('```', '') : cleanedJsonString.trim();

    return JSON.parse(cleanedJsonString.replace(/\n/g, ''));
  } catch (error) {
    return {
      "error": error.message
    };
  }
};

const getVocabularyDetails = async (vocabulary, userId) => {
  try {
    const [vietnameseMeaning, nihonMeaning, otherDetails] = await Promise.all([
      getVietnameseMeaning(vocabulary, userId),
      getNihonMeaning(vocabulary, userId),
      getOtherDetails(vocabulary)
    ]);

    const result = {
      japaneseWord: vocabulary,
      vietnameseMeaning,
      nihonMeaning,
      ...otherDetails
    };

    return result;
  } catch (error) {
    return {
      "error": error.message
    };
  }
};

async function generateOrigin(vocabulary, userId, theme) {
  // const chatSession = model.generateContentStream(generationConfig);
  const prompt = `Bạn hãy cho biết nguồn gốc của từ tiếng Nhật \"${vocabulary}\"${theme ? ` và theo chủ đề ${theme}` : ""}. `;

  try {
    const ref = db.ref(`tu-vung/${userId}`);

    const result = await model.generateContentStream(prompt);

    let fullResponse = '';

    // Duyệt qua các chunk của kết quả stream
    for await (const chunk of result.stream) {
      // Kết hợp các chunk text lại thành một chuỗi hoàn chỉnh
      fullResponse += chunk.text();
      ref.update({
        origin: fullResponse // Assuming you want to update the 'origin' field in Firebase
      });
    }

    return fullResponse;
  } catch (error) {
    return {
      "error": error.message
    };
  }
}

const giaiThichNguPhap = async (vocabulary) => {
  const prompt = `
  ## Phân tích ngữ pháp và giải thích cấu trúc

  Cho ngữ pháp tiếng Nhật: "${vocabulary}"

  Hãy thực hiện các yêu cầu sau:

  1. **Xác định điểm ngữ pháp chính:** Tìm và nêu rõ điểm ngữ pháp chính trong ví dụ. 
    Ví dụ: "赤ちゃんに泣かれた" -> Điểm ngữ pháp chính: "に~れた"

  2. **Giải thích ngữ pháp:** Cung cấp thông tin chi tiết về điểm ngữ pháp chính, bao gồm:
     * **"grammarPoint":** [Tên điểm ngữ pháp]
     * **"JLPTlevel":** [Mức độ JLPT, ví dụ: N5, N4, N3, N2, N1]
     * **"explanation":** 
        * **"meaning":** [Giải thích ý nghĩa của điểm ngữ pháp]
        * **"usage":** [Cách sử dụng, ngữ cảnh sử dụng điểm ngữ pháp]
     * **"commonVariations":** [Các biến thể phổ biến của điểm ngữ pháp (nếu có)]
     * **"sentenceStructure":** [Cấu trúc câu sử dụng điểm ngữ pháp]

  3. **Minh họa:**
     * **"examples":** [
        * {
          * "japanese": "[Ví dụ tiếng Nhật 1]",
          * "vietnamese": "[Dịch ví dụ 1]"
        * },
        * {
          * "japanese": "[Ví dụ tiếng Nhật 2]",
          * "vietnamese": "[Dịch ví dụ 2]"
        * }
      * ]

  4. **Hướng dẫn:**
     * **"tips":** [
        * "[Mẹo 1 về cách sử dụng]",
        * "[Mẹo 2 về cách sử dụng]"
      * ]
     * **"fillInTheBlanks":** [
        * {
          * "japanese": "[Câu tiếng Nhật với chỗ trống]",
          * "vietnamese": "[Dịch câu tiếng Việt với chỗ trống]",
          * "answer": "[Đáp án]"
        * }
      * ]
     * **"practiceQuestions":** [
        * "[Câu hỏi luyện tập 1]",
        * "[Câu hỏi luyện tập 2]"
      * ]

  5. **Kết thúc:**
     * **"encouragement":** "[Lời động viên người học]"

  **Trả về kết quả theo định dạng JSON.**
  `;

  try {
    const llmResponse = await modelJson.generateContent(prompt);

    let resultText = llmResponse.response.text();
    let cleanedJsonString = resultText.includes('json') ? resultText.replace('```json', '') : resultText;
    cleanedJsonString = cleanedJsonString.includes('```') ? cleanedJsonString.replace('```', '') : cleanedJsonString.trim();

    return JSON.parse(cleanedJsonString.replace(/\n/g, ''));
  } catch (error) {
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

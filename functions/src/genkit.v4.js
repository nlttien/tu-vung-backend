const { configureGenkit } = require('@genkit-ai/core');
const { googleAI } = require('@genkit-ai/googleai');
const { generate, generateStream } = require('@genkit-ai/ai');
const { gemini15Flash } = require('@genkit-ai/googleai');
const admin = require('firebase-admin');
var serviceAccount = require("../tu-vung-447ad-firebase-adminsdk-lqtzk-d16ccd9ad3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tu-vung-447ad-default-rtdb.firebaseio.com"
});

const db = admin.database();

// Configure Genkit AI with Google AI plugin and settings
configureGenkit({
  plugins: [
    googleAI({ apiKey: "AIzaSyA86UPPiewtkKBC8BPgX5w4obwEJuZJyps" }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Function to classify vocabulary by field and get information
const getVietnameseMeaning = async (vocabulary, userId, theme) => {
  const prompt = `giải thích ý nghĩa của từ "${vocabulary}"${theme ? ` và theo chủ đề ${theme}` : ""} giải thích hơn 40 từ`;

  try {
    const ref = db.ref(`tu-vung/${userId}`);

    const llmResponse = await generateStream({
      model: gemini15Flash,
      prompt,
      config: {
        temperature: 0.4,
        topP: 0.95,
        
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    let resultText = '';

    for await (const responseChunkData of llmResponse.stream()) {
      const responseChunk = responseChunkData;
      resultText += responseChunk.text();
      ref.update({
        vietnameseMeaning: resultText
      });
    }

    return resultText;
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

    const llmResponse = await generateStream({
      model: gemini15Flash,
      prompt,
      config: {
        temperature: 0.5,
        topP: 0.95,
        
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    let resultText = '';

    for await (const responseChunkData of llmResponse.stream()) {
      const responseChunk = responseChunkData.text();
      resultText += responseChunk;
      ref.update({
        nihonMeaning: resultText
      });
    }

    return resultText;
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


const generateOrigin = async (vocabulary, userId, theme) => {
  const prompt = `Bạn hãy cho biết nguồn gốc của từ tiếng Nhật "${vocabulary}"${theme ? ` và theo chủ đề ${theme}` : ""}. ví dụ: Từ "購入" mang ý nghĩa "mua vào" hoặc "thu được bằng cách mua". Từ này thường được sử dụng trong các ngữ cảnh trang trọng hoặc kinh doanh hơn so với từ "買う" (kau), một từ tiếng Nhật bản địa cũng có nghĩa là "mua"`;

  try {
    const ref = db.ref(`tu-vung/${userId}`);

    const llmResponse = await generateStream({
      model: gemini15Flash,
      prompt,
      config: {
        temperature: 0.4,
        topP: 0.95,
        
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    let resultText = '';

    for await (const responseChunkData of llmResponse.stream()) {
      const responseChunk = responseChunkData.text();
      resultText += responseChunk;
      ref.update({
        origin: resultText // Assuming you want to update the 'origin' field in Firebase
      });
    }

    return resultText;
  } catch (error) {
    return {
      "error": error.message
    };
  }
};



const giaiThichNguPhap = async (vocabulary) => {
  const prompt = `
  hãy giải thích ngữ pháp "${vocabulary}" theo định dạng JSON. giống như sau
  {
    "grammarPoint": "といて",
    "explanation": {
      "meaning": "Dùng để diễn tả hành động 'giải quyết' hoặc 'xử lý' một vấn đề hoặc công việc nào đó. Nó thường được sử dụng khi nói về việc giải quyết các vấn đề cụ thể, nhiệm vụ hoặc tình huống đòi hỏi sự chú ý hoặc nỗ lực.",
      "usage": "といて thường đi kèm với động từ ở dạng て-form. Nó cũng có thể được sử dụng một cách độc lập như một mệnh lệnh hoặc yêu cầu lịch sự để ai đó giải quyết một vấn đề."
    },
    "sentenceStructure": "[Động từ ở dạng て-form] + といて",
    "examples": [
      {
        "japanese": "この問題を解いといてください。",
        "vietnamese": "Vui lòng giải quyết vấn đề này."
      },
      {
        "japanese": "宿題を終わらせておいてね。",
        "vietnamese": "Hãy hoàn thành bài tập về nhà nhé."
      },
      {
        "japanese": "この書類に目を通しておいてください。",
        "vietnamese": "Vui lòng xem qua tài liệu này."
      }
    ],
    "tips": [
      "といて mang tính chất yêu cầu hoặc đề nghị hơn là mệnh lệnh trực tiếp. Nó thường được sử dụng trong các tình huống trang trọng hoặc khi nói chuyện với người lớn tuổi hoặc người có địa vị cao hơn.",
      "といて có thể được thay thế bằng các cách diễn đạt khác như 解決してください (kaiketsu shite kudasai) hoặc 処理してください (shori shite kudasai) tùy thuộc vào ngữ cảnh."
    ],
    "practiceQuestions": [
      "Hãy viết một câu sử dụng といて để yêu cầu đồng nghiệp giải quyết một vấn đề tại nơi làm việc.",
      "Hãy viết một câu sử dụng といて để yêu cầu bạn bè giúp bạn làm một việc gì đó."
    ],
  "fillInTheBlanks": [
      {
        "japanese": "会議の資料を[_____]といてください。",
        "vietnamese": "Vui lòng [_____] tài liệu cho cuộc họp.",
        "answer": "準備して (chuẩn bị)"
      },
      {
        "japanese": "明日のプレゼンテーションの準備を手伝って[_____]くれる？",
        "vietnamese": "Bạn có thể chuẩn bị cho bài thuyết trình ngày mai không?",
        "answer": "といて"
      }
    ],
    "encouragement": "Nếu bạn có bất kỳ câu hỏi nào khác về cách sử dụng といて hoặc bất kỳ điểm ngữ pháp tiếng Nhật nào khác, đừng ngần ngại hỏi nhé!"
  }
  `;

  try {
    const llmResponse = await generate({
      model: gemini15Flash,
      prompt,
      config: {
        temperature: 0.3,
        topP: 0.95,
        
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    let resultText = llmResponse.text();
    let cleanedJsonString = resultText.includes('json') ? resultText.replace('```json', '') : resultText;
    cleanedJsonString = cleanedJsonString.includes('```') ? cleanedJsonString.replace('```', '') : cleanedJsonString.trim();

    return JSON.parse(cleanedJsonString.replace(/\n/g, ''));
  } catch (error) {
    // Provide a default response if JSON parsing fails
    return {
      "category": "Công nghệ",
      "color": "#FF5733",
      "popularity": "85",
      "vietnameseMeaning": "Nhìn nhận sự việc một cách khách quan, không bị ảnh hưởng bởi cảm xúc cá nhân.",
      "related_words": ["客観的", "視点"],
      "antonyms": ["主観"],
    };
  }
};

module.exports = {
  getVocabularyDetails,
  generateOrigin,
  giaiThichNguPhap,
};

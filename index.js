let cleanedJsonString = `{"results": "Từ \\"ために\\" có nguồn gốc từ tiếng Nhật cổ."}`;

// Hàm để thay thế dấu ngoặc kép đôi bên ngoài bằng dấu ngoặc kép đơn
const replaceOuterQuotes = (str) => {
  // Tìm tất cả các chuỗi trong JSON
  return str
    .replace(/\\\"/g, '###') // Thay thế dấu ngoặc kép đã escape
    .replace(/"(?![^"]*")/g, "'") // Thay thế dấu ngoặc kép đôi bên ngoài
    .replace(/###/g, '\\"'); // Khôi phục dấu ngoặc kép đã escape
};

// Thay thế dấu ngoặc kép đôi bên ngoài
cleanedJsonString = replaceOuterQuotes(cleanedJsonString);

console.log(cleanedJsonString);

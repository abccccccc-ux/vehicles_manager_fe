/**
 * Normalize license plate by removing all spaces, dots, and dashes
 * @param {string} plate - Raw license plate input
 * @returns {string} Normalized license plate (uppercase, no spaces/dots/dashes)
 */
export const normalizeLicensePlate = (plate) => {
  if (!plate) return "";
  return plate.toUpperCase().replace(/[\s\-.]+/g, "");
};

/**
 * Format biển số xe về dạng đẹp, dễ đọc.
 * Dựa trên dữ liệu thực tế từ Book1.xlsx:
 * 
 * XE MÁY (motorcycle) - 5 số có dấu chấm:
 * - Series 2 chữ + 5 số: "29AA-63254" → "29AA-632.54"
 * - Series 1 chữ + 1 số + 5 số: "29M1-923.03" → "29M1-923.03"
 * 
 * XE MÁY (motorcycle) - 4 số không có dấu chấm:
 * - Series 1 chữ + 1 số + 4 số: "29Y2-5306" → "29Y2-5306"
 * - Series 1 chữ + 4 số: "30S-4894" → "30S-4894"
 * 
 * Ô TÔ (car) - 5 số có dấu chấm:
 * - Series 1 chữ + 5 số: "30F-25438" → "30F-254.38"
 * 
 * XE QUÂN SỰ:
 * - "TN-354" → "TN-354"
 * 
 * @param {string} plate - Biển số xe (có thể đã hoặc chưa chuẩn hóa)
 * @returns {string} Biển số đã được format đẹp
 */
export const formatLicensePlate = (plate) => {
  if (!plate) return "";
  
  const cleanPlate = normalizeLicensePlate(plate);
  
  // Kiểm tra độ dài tối thiểu
  if (cleanPlate.length < 5) {
    return cleanPlate;
  }
  
  // === BIỂN 9 KÝ TỰ (2 số tỉnh + 2 chữ series + 5 số) ===
  // REGEX 1: XE MÁY - Series 2 chữ cái (AA) + 5 số (VD: 29AA63254 -> 29AA-632.54)
  // Mẫu: 29AA-63254, 29BN-02787
  const motorcycle2Letter5DigitRegex = /^(\d{2})([A-Z]{2})(\d{5})$/;
  const match2Letter5Digit = cleanPlate.match(motorcycle2Letter5DigitRegex);
  if (match2Letter5Digit) {
    const [, province, series, numbers] = match2Letter5Digit;
    return `${province}${series}-${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  }
  
  // === BIỂN 9 KÝ TỰ (2 số tỉnh + 1 chữ + 1 số series + 5 số) ===
  // REGEX 2: XE MÁY - Series 1 chữ + 1 số + 5 số (VD: 29M192303 -> 29M1-923.03)
  // Mẫu: 29M1-923.03, 29L1-239.94, 29X5-38909
  const motorcycle1Letter1Digit5DigitRegex = /^(\d{2})([A-Z])(\d)(\d{5})$/;
  const match1Letter1Digit5Digit = cleanPlate.match(motorcycle1Letter1Digit5DigitRegex);
  if (match1Letter1Digit5Digit) {
    const [, province, letter, seriesDigit, numbers] = match1Letter1Digit5Digit;
    return `${province}${letter}${seriesDigit}-${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  }
  
  // === BIỂN 8 KÝ TỰ - Cần phân biệt dựa trên format input ===
  if (cleanPlate.length === 8) {
    // Phân tích input gốc để xác định format
    const originalPlate = plate.toUpperCase().trim();
    
    // Pattern xe máy: có format XX[chữ][số]-XXXX (dấu gạch ngang sau 4 ký tự đầu)
    // VD: 29Y2-5306, 29H7-1452, 30N9-6749
    const motorcycleInputPattern = /^\d{2}[A-Z]\d[\s\-.]+\d{4}$/;
    if (motorcycleInputPattern.test(originalPlate.replace(/\s+/g, ''))) {
      const match = cleanPlate.match(/^(\d{2})([A-Z])(\d)(\d{4})$/);
      if (match) {
        const [, province, letter, seriesDigit, numbers] = match;
        return `${province}${letter}${seriesDigit}-${numbers}`;
      }
    }
    
    // Pattern ô tô: có format XX[chữ]-XXXXX hoặc XX[chữ] XXXXX (dấu gạch ngang/khoảng trắng sau 3 ký tự đầu)
    // VD: 30F-25438, 30L 54854, 29A-53383
    const carInputPattern = /^\d{2}[A-Z][\s\-.]+\d{5}$/;
    if (carInputPattern.test(originalPlate)) {
      const match = cleanPlate.match(/^(\d{2})([A-Z])(\d{5})$/);
      if (match) {
        const [, province, series, numbers] = match;
        return `${province}${series}-${numbers.slice(0, 3)}.${numbers.slice(3)}`;
      }
    }
    
    // Nếu không xác định được từ input, mặc định format như ô tô (1 chữ + 5 số)
    // vì đây là format phổ biến hơn cho biển 8 ký tự
    const defaultMatch = cleanPlate.match(/^(\d{2})([A-Z])(\d{5})$/);
    if (defaultMatch) {
      const [, province, series, numbers] = defaultMatch;
      return `${province}${series}-${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    }
  }
  
  // === BIỂN 7 KÝ TỰ (2 số tỉnh + 1 chữ + 4 số) ===
  // REGEX: XE MÁY/Ô TÔ - Series 1 chữ + 4 số (VD: 30S4894 -> 30S-4894)
  // Mẫu: 30S-4894
  const vehicle1Letter4DigitRegex = /^(\d{2})([A-Z])(\d{4})$/;
  const matchVehicle1Letter4Digit = cleanPlate.match(vehicle1Letter4DigitRegex);
  if (matchVehicle1Letter4Digit) {
    const [, province, series, numbers] = matchVehicle1Letter4Digit;
    return `${province}${series}-${numbers}`;
  }
  
  // === XE QUÂN SỰ / ĐẶC BIỆT ===
  // REGEX: (VD: TN354 -> TN-354)
  // Mẫu: TN-354
  const armyRegex = /^([A-Z]{2})(\d{3,5})$/;
  const matchArmy = cleanPlate.match(armyRegex);
  if (matchArmy) {
    const [, prefix, numbers] = matchArmy;
    return `${prefix}-${numbers}`;
  }
  
  // Fallback: trả về biển số đã normalize
  return cleanPlate;
};

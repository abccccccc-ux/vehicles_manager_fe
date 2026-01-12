import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_CAMERA_ENCRYPTION_KEY || '';

/**
 * Giải mã password đã được mã hóa bằng AES-256-CBC
 * Format: iv:encryptedText (hex)
 * @param {string} encryptedText - Password đã mã hóa (dạng iv:hex)
 * @returns {string} - Password gốc hoặc chuỗi rỗng nếu lỗi
 */
export const decryptPassword = (encryptedText) => {
  if (!encryptedText || !ENCRYPTION_KEY) {
    return '';
  }

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Format mật khẩu mã hóa không hợp lệ');
    }

    const iv = CryptoJS.enc.Hex.parse(parts[0]);
    const encrypted = CryptoJS.enc.Hex.parse(parts[1]);
    
    // Pad key to 32 bytes (256 bits) for AES-256
    const paddedKey = ENCRYPTION_KEY.padEnd(32, '\0').slice(0, 32);
    const key = CryptoJS.enc.Utf8.parse(paddedKey);

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: encrypted
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    return result;
  } catch (error) {
    console.error('Error decrypting password:', error);
    return '';
  }
};

/**
 * Mã hóa password bằng AES-256-CBC
 * @param {string} password - Password gốc
 * @returns {string} - Password đã mã hóa (dạng iv:hex)
 */
export const encryptPassword = (password) => {
  if (!password || !ENCRYPTION_KEY) {
    return '';
  }

  try {
    // Generate random IV (16 bytes)
    const iv = CryptoJS.lib.WordArray.random(16);
    
    // Pad key to 32 bytes (256 bits) for AES-256
    const paddedKey = ENCRYPTION_KEY.padEnd(32, '\0').slice(0, 32);
    const key = CryptoJS.enc.Utf8.parse(paddedKey);

    const encrypted = CryptoJS.AES.encrypt(password, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Return format: iv:encryptedText (both in hex)
    return iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  } catch (error) {
    console.error('Error encrypting password:', error);
    return '';
  }
};

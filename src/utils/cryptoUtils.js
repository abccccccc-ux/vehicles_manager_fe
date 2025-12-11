// Browser-compatible crypto utilities for camera password encryption/decryption
// Note: This is a client-side implementation and should be used carefully for security

const IV_LENGTH = 16;
const ENCRYPTION_KEY = 'default-32-char-key-for-camera!!'; // Should match backend

/**
 * Convert string to ArrayBuffer
 */
const stringToArrayBuffer = (str) => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

/**
 * Convert ArrayBuffer to string
 */
const arrayBufferToString = (buffer) => {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
};

/**
 * Convert hex string to ArrayBuffer
 */
const hexToArrayBuffer = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
};

/**
 * Convert ArrayBuffer to hex string
 */
const arrayBufferToHex = (buffer) => {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Get crypto key from encryption key string
 */
const getCryptoKey = async () => {
  const keyString = ENCRYPTION_KEY.padEnd(32, '\0').slice(0, 32);
  const keyBuffer = stringToArrayBuffer(keyString);
  
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt password (for completeness - mainly used on backend)
 * @param {string} text - Plain text password
 * @returns {Promise<string>} - Encrypted password in format "iv:encrypted"
 */
export const encryptPassword = async (text) => {
  if (!text) return '';

  try {
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    // Get crypto key
    const key = await getCryptoKey();
    
    // Encrypt
    const textBuffer = stringToArrayBuffer(text);
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: iv },
      key,
      textBuffer
    );
    
    // Convert to hex strings
    const ivHex = arrayBufferToHex(iv.buffer);
    const encryptedHex = arrayBufferToHex(encryptedBuffer);
    
    return ivHex + ':' + encryptedHex;
  } catch (error) {
    console.error('Error encrypting password:', error);
    throw new Error('Không thể mã hóa mật khẩu');
  }
};

/**
 * Decrypt camera password
 * @param {string} encryptedText - Encrypted password (format: iv:encrypted)
 * @returns {Promise<string>} - Decrypted password
 */
export const decryptPassword = async (encryptedText) => {
  if (!encryptedText) return '';
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Format mật khẩu mã hóa không hợp lệ');
    }
    
    // Convert hex strings back to ArrayBuffers
    const iv = hexToArrayBuffer(parts[0]);
    const encryptedData = hexToArrayBuffer(parts[1]);
    
    // Get crypto key
    const key = await getCryptoKey();
    
    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: iv },
      key,
      encryptedData
    );
    
    return arrayBufferToString(decryptedBuffer);
  } catch (error) {
    console.error('Error decrypting password:', error);
    throw new Error('Không thể giải mã mật khẩu');
  }
};

/**
 * Check if a string appears to be encrypted (has the expected format)
 * @param {string} text - Text to check
 * @returns {boolean} - True if text appears to be encrypted
 */
export const isEncrypted = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // Check if it has the format "hex:hex" where both parts are valid hex
  const parts = text.split(':');
  if (parts.length !== 2) return false;
  
  const hexPattern = /^[0-9a-fA-F]+$/;
  return hexPattern.test(parts[0]) && hexPattern.test(parts[1]) && parts[0].length === 32; // IV should be 32 hex chars (16 bytes)
};

/**
 * Safely display password - shows decrypted if encrypted, otherwise shows as-is
 * @param {string} password - Password to display (may be encrypted or plain)
 * @returns {Promise<string>} - Password to display
 */
export const safeDisplayPassword = async (password) => {
  if (!password) return '';
  
  try {
    if (isEncrypted(password)) {
      return await decryptPassword(password);
    }
    return password;
  } catch (error) {
    console.warn('Could not decrypt password, showing masked:', error);
    return '***encrypted***';
  }
};

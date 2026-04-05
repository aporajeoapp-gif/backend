import * as CryptoJS from "crypto-js";

export const encryptPassword = (password: string) => {
  const secretKey = process.env.SECRET_PASS_KEY;
  if (!secretKey) {
    throw new Error("SECRET_PASS_KEY is not defined");
  }
  return CryptoJS.AES.encrypt(password, secretKey).toString();
};

export const decryptPassword = (encryptedPassword: string) => {
  const secretKey = process.env.SECRET_PASS_KEY;
  if (!secretKey) {
    throw new Error("SECRET_PASS_KEY is not defined");
  }
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (error) {
    console.error("Decryption failed:", error);
    return "";
  }
};
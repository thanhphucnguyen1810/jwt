// Author: thanhphuc1810
import JWT from 'jsonwebtoken'

/* FUNCTION TẠO MỚI MỘT TOKEN
userInfo: những thông tin muốn đính kèm vào token
secretSignature: chữ ký bí mật (dạng string ngẫu nhiên)
tokenLife: thời gian sống của token
*/
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    // Hàm sign của thư viện JWT - thuật toán mặc định HS256
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

/* FUNCTION KIỂM TRA HỢP LỆ
*/
const verifyToken = async (token, secretSignature) => {
  try {
    // Hàm verify của thư viện JWT
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}

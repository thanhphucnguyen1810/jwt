// Author: thanhphuc1810

import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'

//Lấy và xác thực cái JWT accessToken nhận được từ FE có hợp lệ không
const isAuthorized = async (req, res, next) => {

  // cách 1: lấy AC nằm trong req cookie phía client - withCredentials trong file authorizedAxios và credentials trong CORS
  const accessTokenFromCookie = req.cookies?.accessToken
  console.log('accessTokenFromCookie', accessTokenFromCookie)

  if (!accessTokenFromCookie) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized! (Token not found!)' })
    return
  }


  // cách 2: lấy trong trường hợp FE lưu trong LocalStorage thông qua header authorization
  const accessTokenFromHeader = req.headers.authorization
  console.log('accessTokenFromHeader', accessTokenFromHeader)
  if (!accessTokenFromHeader) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized! (Token not found!)' })
    return
  }

  try {
    //B1: thực hiện giải mã xem token có hợp lệ không
    const accessTokenDecoded = await JwtProvider.verifyToken(
      // accessTokenFromCookie,
      accessTokenFromHeader.substring('Bearer '.length),
      'KBgJwUETt4HeVD05WaXXI9V3JnwCVP'
    )

    // B2: hợp lệ, lưu thông tin giải mã vào req.jwtDecode
    req.jwtDecoded = accessTokenDecoded

    // B3: cho phép req đi tiếp 
    next()

  } catch (error) {
    console.log('Error from authMiddleware: ', error)
    //TH1: accessToken hết hạn --> BE cần trả về mã GONE 401 --> để FE gọi API refreshToken
    if (error.message?.includes('jwt expired')) {
      res.status(StatusCodes.GONE).json({ message: 'Need to refresh token' })
      return
    }

    // TH2: Lỗi còn lại trừ việc hết hạn
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized! PLease login!' })
  }
}

export const authMiddleware = {
  isAuthorized
}

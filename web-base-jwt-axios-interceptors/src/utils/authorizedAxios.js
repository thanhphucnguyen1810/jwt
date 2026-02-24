// Author: thanhphuc1810
import axios from 'axios'
import { toast } from 'react-toastify'

let authorizedAxiosInstance = axios.create()

// thời gian chờ tối đa của một request: để 10 phút
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10

//withCredentials: cho phép axios đính kèm và gửi cookie trong mỗi request lên BE
// c2: (trong TH sử dụng JWT tokens theo cơ chế httpOnly cookie)
authorizedAxiosInstance.defaults.withCredentials = true

// CẤU HÌNH Interceptors (Bộ đánh chặn vào giữa mọi res và req)

// add request interceptor: can thiệp vào giữa những cái req API
authorizedAxiosInstance.interceptors.request.use((config) => {
  // Do something before request is sent
  // c1: Lấy accessToken từ localStorage và đính kèm vào header
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    // Cần Bearer vì: tuân thủ tiêu chuẩn OAuth 2.0 trong việc xác định loại token
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
}, (error) => {
  // Do something with request error
  return Promise.reject(error)
})


// add response interceptor: can thiệp vào giữa những res từ API
authorizedAxiosInstance.interceptors.response.use((response) => {
  // Do something with response data
  return response
}, (error) => {
  // Do something with response error
  if (error.response.status !== 410) {
    toast.error(error.response?.data?.message || error?.message)
  }
  return Promise.reject(error)
})

export default authorizedAxiosInstance

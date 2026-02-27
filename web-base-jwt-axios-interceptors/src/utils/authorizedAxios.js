// Author: thanhphuc1810
import axios from 'axios'
import { toast } from 'react-toastify'
import { handleLogoutAPI, refreshTokenAPI } from '~/apis'

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

  // Xử lý refreshToken tự động
  // Nếu nhận 401 từ BE thì gọi API logout
  if (error.response?.status === 401) {
    handleLogoutAPI.then(() => {
      // nều dùng cookie nhớ xóa userInfo trong localStrorage
      // localStorage.removeItem('userInfo')
      location.href = '/login'
    })
  }

  // Nếu nhận 410 thì gọi tạo lại refreshToken
  // Đầu tiên lấy lại các request API bị lỗi thông qua error.config
  const originalRequest = error.config

  if (error.response?.status === 410 && !originalRequest._retry) {
    // Gán thêm một giá trị retry luôn = true trong thời gian chờ, để refreshToken chỉ gọi một lần tại một thời điểm
    originalRequest._retry = true

    // Lấy refreshToken từ localStorage (cho TH localStorage)
    const refreshToken = localStorage.getItem('refreshToken')
    // Gọi API refreshToken
    return refreshTokenAPI(refreshToken)
      .then((res) => {
        // Lấy và gán lại ac vào localStorage
        const { accessToken } = res.data
        localStorage.setItem('accessToken', accessToken)
        authorizedAxiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`

        // Đồng thời lưu ý ac cũng đã được update lại ở cookie
        //Return lại axios instance của ta kết hợp vs originalRequest để gọi lại những api ban đầu bị lỗi
        return authorizedAxiosInstance(originalRequest)
      })
      .catch((_error) => {
        // Nếu nhận bất kỳ lỗi nào từ api refreshToken thì logout
        handleLogoutAPI.then(() => {
          location.href = '/login'
        })

        return Promise.reject(_error)
      })
  }


  if (error.response?.status !== 410) {
    toast.error(error.response?.data?.message || error?.message)
  }
  return Promise.reject(error)
})

export default authorizedAxiosInstance

import axios from 'axios'

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api', // Update with your backend URL
})

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the access token from localStorage
    const user = localStorage.getItem('user')
    const token = user ? JSON.parse(user).token : null

    // If token is available, add it to the headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default axiosInstance

import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Thay đổi nếu cần
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;

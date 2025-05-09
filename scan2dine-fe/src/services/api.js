// // src/services/api.js
// import axios from 'axios';

// const API_URL = `${process.env.REACT_APP_URL}`;

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Các phương thức API
// export const get = (url) => api.get(url);
// export const post = (url, data) => api.post(url, data);
// export const patch = (url, data) => api.patch(url, data);
// export const del = (url) => api.delete(url);

// // Export default để giữ tính tương thích (nếu cần)
// export default {
//   get,
//   post,
//   patch,
//   delete: del,
// };
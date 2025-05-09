// src/services/api.js
const API_URL = process.env.REACT_APP_URL || "http://localhost:3000";

const api = {
  // Thêm giỏ hàng
  addCart: async (customerId) => {
    const response = await fetch(`${API_URL}/s2d/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer: customerId }),
    });
    return response.json();
  },

  // Xóa giỏ hàng
  deleteCart: async (cartId) => {
    const response = await fetch(`${API_URL}/s2d/cart/${cartId}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Xóa chi tiết giỏ hàng
  deleteCartDetails: async (cartId) => {
    const response = await fetch(
      `${API_URL}/s2d/cart/deleteCartdetail/${cartId}`,
      {
        method: "DELETE",
      }
    );
    return response.json();
  },

  // Lấy danh sách giỏ hàng
  getCarts: async () => {
    const response = await fetch(`${API_URL}/s2d/cart`);
    return response.json();
  },
};

export default api;

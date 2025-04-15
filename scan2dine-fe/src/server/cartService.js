import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const addCart = async (customerId) => {
  const response = await axios.post(`${API_URL}/carts`, { customerId });
  return response.data;
};

export const getCartDetails = async (cartId) => {
  const response = await axios.get(`${API_URL}/carts/${cartId}`);
  return response.data;
};

export const addCartDetail = async (cartId, productId, quantity) => {
  const response = await axios.post(`${API_URL}/carts/${cartId}/items`, {
    productId,
    quantity
  });
  return response.data;
};

export const removeCartDetail = async (cartId, productId) => {
  const response = await axios.delete(`${API_URL}/carts/${cartId}/items/${productId}`);
  return response.data;
};

export const updateCartDetail = async (cartId, productId, quantity) => {
  const response = await axios.put(`${API_URL}/carts/${cartId}/items/${productId}`, {
    quantity
  });
  return response.data;
};
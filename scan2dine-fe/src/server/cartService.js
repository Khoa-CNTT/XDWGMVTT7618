import axios from 'axios';
import api from './api';

const API_URL = 'http://localhost:5000/s2d';

export const createCart = async () => {
  try {
    const response = await axios.post(`${API_URL}/cart`, {});
    localStorage.setItem('cartId', response.data._id);
    return response.data;
  } catch (error) {
    console.error('Error creating cart:', error);
    throw error;
  }
};

export const getOrCreateCart = async () => {
  try {
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
      const cart = await createCart();
      cartId = cart._id;
    }
    return cartId;
  } catch (error) {
    console.error('Error getting/creating cart:', error);
    throw error;
  }
};

export const addToCartDetail = async (productId, quantity = 1) => {
  try {
      const cartId = localStorage.getItem('cartId');
      if (!cartId) {
          throw new Error('No cart found');
      }

      // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
      const cartResponse = await api.get('/s2d/cartdetail');
      const existingItem = cartResponse.data.find(
          item => item.products._id === productId && item.cart._id === cartId
      );

      if (existingItem) {
          // Nếu sản phẩm đã tồn tại, cập nhật số lượng
          return await api.patch(`/s2d/cartdetail/${existingItem._id}`, {
              quantity: existingItem.quantity + quantity  // Cộng thêm số lượng mới
          });
      } else {
          // Nếu sản phẩm chưa tồn tại, thêm mới với số lượng được chỉ định
          return await api.post('/s2d/cartdetail', {
              cart: cartId,
              products: productId,
              quantity: quantity
          });
      }
  } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
  }
};

export const removeFromCartDetail = async (productId) => {
  try {
    const cartId = await getOrCreateCart();
    const response = await axios.delete(`${API_URL}/cartdetail/${cartId}`, {
      data: {
        products: productId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in removeFromCartDetail:', error);
    throw error;
  }
};

export const getCartDetails = async () => {
  try {
    const cartId = await getOrCreateCart();
    const response = await axios.get(`${API_URL}/cartdetail/${cartId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting cart details:', error);
    throw error;
  }
};
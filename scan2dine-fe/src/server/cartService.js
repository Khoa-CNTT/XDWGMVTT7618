import axios from 'axios';
import api from './api';

//Hiếu sửa
const API_URL = `${process.env.REACT_APP_API_URL}/s2d`;

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
    let cartId = localStorage.getItem('cartId');
    const userId = localStorage.getItem('userId');

    if (!cartId) {
      // Sửa lại endpoint và body request
      const res = await api.post('/s2d/cart', { 
        userId: userId,
        status: "1" 
      });
      cartId = res.data._id;
      localStorage.setItem('cartId', cartId);
    }

    // Thêm sản phẩm vào giỏ hàng
    return await api.post('/s2d/cartdetail', {
      cart: cartId,
      products: productId,
      quantity: quantity
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const removeFromCartDetail = async (productId) => {
  try {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) throw new Error('No cart found');

    // Get current cart details
    const res = await api.get('/s2d/cartdetail');
    const item = res.data.find(
      (detail) => detail.products._id === productId && detail.cart._id === cartId
    );

    if (!item) throw new Error('Product not found in cart');

    // If quantity is 1, delete the item
    if (item.quantity <= 1) {
      return await api.delete(`/s2d/cartdetail/${item._id}`);
    }

    // Otherwise decrease quantity by 1
    return await api.patch(`/s2d/cartdetail/${item._id}`, {
      quantity: item.quantity - 1
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
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
import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaMinus, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getCartDetails, addToCartDetail, removeFromCartDetail } from '../services/cartService';

const CartDetails = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const cartId = localStorage.getItem('cartId');
      const response = await getCartDetails(cartId);
      setCartItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (item, change) => {
    try {
      const cartId = localStorage.getItem('cartId');
      if (change > 0) {
        await addToCartDetail(cartId, item._id);
      } else {
        await removeFromCartDetail(cartId, item._id);
      }
      await fetchCartItems(); // Refresh cart items
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) =>
    sum + (parseInt(item.products.price) * item.quantity), 0);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">Giỏ hàng của bạn</h1>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4">
          {cartItems.map((item) => (
            <div key={item._id} className="flex items-center gap-4 p-3 border-b">
              <img
                src={`${process.env.REACT_APP_API_URL}/${item.products.image}`}
                alt={item.products.pd_name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.products.pd_name}</h3>
                <p className="text-primary font-medium">
                  {parseInt(item.products.price).toLocaleString()}đ
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleUpdateQuantity(item.products, -1)}
                  className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center"
                >
                  <FaMinus className="text-white" />
                </button>
                <span className="w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.products, 1)}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                >
                  <FaPlus className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium">Tổng tiền</span>
            <span className="text-primary font-bold text-xl">
              {totalPrice.toLocaleString()}đ
            </span>
          </div>
          <button className="w-full bg-primary text-white py-3 rounded-full font-medium">
            Xác nhận gửi yêu cầu gọi món
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDetails;
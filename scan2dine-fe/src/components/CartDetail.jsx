import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaMinus, FaPlus, FaStore } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../server/api';

const CartDetails = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCounters, setExpandedCounters] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const cartId = localStorage.getItem('cartId');
      if (!cartId) {
        setCartItems({});
        setLoading(false);
        return;
      }

      const [cartDetailRes, foodstallRes] = await Promise.all([
        api.get('/s2d/cartdetail'),
        api.get('/s2d/foodstall')
      ]);

      // Lọc các item thuộc cart hiện tại
      const items = cartDetailRes.data.filter(item => {
        const match = item.cart?._id === cartId;
        if (!match) {
        }
        return match;
      });

      // Tạo map foodstall
      const foodstallMap = {};
      foodstallRes.data.forEach(stall => {
        foodstallMap[stall._id] = {
          name: stall.stall_name,
          itemCount: 0
        };
      });

      // Nhóm item theo stall_id
      const groupedItems = {};
      items.forEach(item => {
        if (!item.products || !item.products.stall_id) {
          return;
        }
        const stallId = item.products.stall_id;
        const stall = foodstallMap[stallId];
        if (!stall) {
          return;
        }
        if (!groupedItems[stallId]) {
          groupedItems[stallId] = {
            stallName: stall.name,
            items: []
          };
        }

        groupedItems[stallId].items.push(item);
        foodstallMap[stallId].itemCount++;
      });

      setCartItems(groupedItems);
      setExpandedCounters(Object.keys(groupedItems));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setCartItems({});
    }
  };



  const handleUpdateQuantity = async (item, change) => {
    try {
      const newQuantity = item.quantity + change;
      if (newQuantity <= 0) {
        await api.delete(`/s2d/cartdetail/${item._id}`);
      } else {
        await api.patch(`/s2d/cartdetail/${item._id}`, { quantity: newQuantity });
      }
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const toggleCounter = (stallId) => {
    setExpandedCounters(prev =>
      prev.includes(stallId)
        ? prev.filter(id => id !== stallId)
        : [...prev, stallId]
    );
  };

  const totalPrice = Object.values(cartItems).reduce((sum, stall) => {
    return sum + stall.items.reduce((stallSum, item) => {
      return stallSum + parseInt(item.products.price) * item.quantity;
    }, 0);
  }, 0);

  const handleConfirmOrder = async () => {
    try {
      const cartId = localStorage.getItem('cartId');
      await api.post('/s2d/cartdetail/confirm', { cartId });
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  const handleUnderstand = () => {
    setShowConfirmation(false);
    navigate('/orderdetail');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full sm:max-w-[800px] mx-auto shadow-2xl overflow-hidden relative">
      <div className="bg-primary text-white p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold">Các món đang chọn</h1>
      </div>

      <div className="flex-1 overflow-auto pb-24">
        {Object.entries(cartItems).map(([stallId, stall]) => (
          <div key={stallId} className="border-b">
            <div className="flex items-center justify-between p-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <FaStore className="text-gray-500" />
                  <span className="font-medium">{stall.stallName}</span>
                  <span className="text-gray-500">({stall.items.length} món)</span>
                </div>
                <span className="text-sm text-gray-400">{stall.location}</span>
              </div>
              <button onClick={() => toggleCounter(stallId)} className="text-primary">
                {expandedCounters.includes(stallId) ? 'Ẩn' : 'Sửa'}
              </button>
            </div>

            {expandedCounters.includes(stallId) && stall.items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 p-4 border-t">
                <img
                  src={`${process.env.REACT_APP_API_URL}/${item.products.image}`}
                  alt={item.products.pd_name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium mb-2">{item.products.pd_name}</h3>
                  <p className="text-primary font-medium mt-1">
                    {parseInt(item.products.price).toLocaleString()}đ
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleUpdateQuantity(item, -1)} className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                    <FaMinus className="text-white" />
                  </button>
                  <span className="w-4 text-center">{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item, 1)} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <FaPlus className="text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-white mt-auto">
        <div className="flex justify-between items-center p-4 border-t">
          <span className="font-medium">Tổng tiền</span>
          <span className="text-primary font-bold text-xl">
            {totalPrice.toLocaleString()}đ
          </span>
        </div>
        <div className="p-4 pt-0">
          <button
            onClick={handleConfirmOrder}
            className="w-full bg-primary text-white py-3 rounded-full font-medium"
          >
            Xác nhận gửi yêu cầu gọi món
          </button>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
            <div className="mb-4 text-xl font-bold">ĐÃ GỬI YÊU CẦU XÁC NHẬN</div>
            <p className="mb-6">Gọi món thành công vui lòng chờ nhân viên đến xác nhận</p>
            <button
              onClick={handleUnderstand}
              className="bg-blue-500 text-white px-8 py-2 rounded-full"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDetails;

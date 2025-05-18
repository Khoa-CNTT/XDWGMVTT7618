import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaMinus, FaPlus, FaStore, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../server/api';
import ConfirmModal from './ConfirmModal';


const CartDetails = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCounters, setExpandedCounters] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showUnderstand, setShowUnderstand] = useState(false);
  const [itemDelete, setItemDelete] = useState(null);
  const [editingCounter, setEditingCounter] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const [isListenerRegistered, setIsListenerRegistered] = useState(false);

  const customer = JSON.parse(sessionStorage.getItem('customer'));
  console.log('Customer:', customer); // Log để kiểm tra

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const [cartDetailRes, foodstallRes] = await Promise.all([
        api.get('/s2d/cartdetail'),
        api.get('/s2d/foodstall'),
      ]);

      const currentCartItems = cartDetailRes.data.filter(
        (item) => item.cart._id === customer.cart
      );

      const foodstallMap = Object.fromEntries(
        foodstallRes.data.map((stall) => [
          stall._id,
          { name: stall.stall_name, itemCount: 0 },
        ])
      );

      const groupedItems = {};
      currentCartItems.forEach((item) => {
        const stallId = item.products?.stall_id;
        if (!stallId || !foodstallMap[stallId]) return;

        if (!groupedItems[stallId]) {
          groupedItems[stallId] = {
            stallName: foodstallMap[stallId].name,
            items: [],
          };
        }

        groupedItems[stallId].items.push(item);
        foodstallMap[stallId].itemCount++;
      });

      setCartItems(groupedItems);
      setExpandedCounters(Object.keys(groupedItems));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems({});
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (item, change) => {
    try {
      const newQuantity = item.quantity + change;
      if (newQuantity <= 0) {
        await api.delete(`/s2d/cartdetail/${item._id}`);
      } else {
        await api.patch(`/s2d/cartdetail/${item._id}`, {
          quantity: newQuantity,
        });
      }
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/s2d/cartdetail/${itemId}`);
      fetchCartItems();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      const res = await api.post('/s2d/cart/confirm', {
        cart: customer.cart,
        table: customer.idTable,
      });
      //xem xét
      // sessionStorage.setItem('user', JSON.stringify(user));

      await api.patch(`/s2d/table/${customer.idTable}`, { status: '3' });

      // Cập nhật trạng thái bàn ngay trong giao diện (chắc chắn đã cập nhật thành công)
      setOrderResult(res.data);
      setShowUnderstand(true);

      // Có thể thêm logic để cập nhật trạng thái bàn trong UI ngay lập tức nếu cần
      // Ví dụ, bạn có thể tự động fetch lại trạng thái bàn mới nhất
      // fetchCartItems();
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };


  const handleUnderstand = () => {
    setShowUnderstand(false);

    navigate('/orderdetail', { state: { orderData: orderResult } });
  };

  const handleDelete = (item) => {
    setShowConfirmation(true);
    setItemDelete(item);
  };

  const toggleEdit = (stallId) => {
    setEditingCounter((prev) => (prev === stallId ? null : stallId));
  };

  const toggleCounter = (stallId) => {
    setExpandedCounters((prev) =>
      prev.includes(stallId)
        ? prev.filter((id) => id !== stallId)
        : [...prev, stallId]
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const totalPrice = Object.values(cartItems).reduce((sum, stall) => {
    return (
      sum +
      stall.items.reduce((s, item) => s + item.quantity * parseInt(item.products.price), 0)
    );
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full sm:max-w-[800px] mx-auto shadow-2xl overflow-hidden relative">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold">Các món đang chọn</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-24">
        {!loading && Object.keys(cartItems).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h3>
            <p className="text-gray-500 text-center mb-6">Bạn chưa thêm bất kỳ món ăn nào vào giỏ hàng</p>
            <button
              onClick={() => navigate('/menu')}
              className="flex items-center justify-center px-6 py-3 bg-primary text-white rounded-full font-medium"
            >
              <FaStore className="mr-2" /> Khám phá món ăn
            </button>
          </div>
        ) : (
          Object.entries(cartItems).map(([stallId, stall]) => (
            <div key={stallId} className="border-b bg-white mb-3">
              <div
                className="flex items-center justify-between p-4 cursor-pointer border-b border-gray-100"
                onClick={() => toggleCounter(stallId)}
              >
                <div className="flex items-center gap-2">
                  <FaStore className="text-primary w-5 h-5" />
                  <span className="font-medium">{stall.stallName}</span>
                  <span className="text-gray-500 text-sm">({stall.items.length} món)</span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEdit(stallId);
                    }}
                    className="text-primary text-sm font-medium mr-2"
                  >
                    {editingCounter === stallId ? 'Xong' : 'Sửa'}
                  </button>
                  <FaChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform ${expandedCounters.includes(stallId) ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {/* Items */}
              <div
                className={`transition-all overflow-hidden ${expandedCounters.includes(stallId) ? 'max-h-[2000px]' : 'max-h-0'}`}
              >
                {stall.items.map((item) => (
                  <div key={item._id} className="border-b border-gray-100 relative">
                    <div className={`flex p-3 transition-transform ${editingCounter === stallId ? '-translate-x-32' : ''}`}>
                      <div className="w-16 h-16 rounded-lg overflow-hidden mr-3 bg-gray-100 flex-shrink-0">
                        <img
                          src={`${process.env.REACT_APP_API_URL}/${item.products.image}`}
                          alt={item.products.pd_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.products.pd_name}</div>
                        <div className="text-primary font-medium mt-1">{formatCurrency(item.products.price)}</div>
                        <div className="flex items-center justify-end mt-1">
                          <button
                            onClick={() => handleUpdateQuantity(item, -1)}
                            className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                          >
                            <FaMinus size={14} color="white" />
                          </button>
                          <span className="mx-3 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item, 1)}
                            className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                          >
                            <FaPlus size={14} color="white" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Buttons khi chỉnh sửa */}
                    <div
                      className={`absolute right-0 top-0 bottom-0 flex items-center w-32 h-full transition-opacity ${editingCounter === stallId ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    >
                      <button className="bg-yellow-500 text-white text-xs flex-1 h-full">Sản phẩm tương tự</button>
                      <button
                        className="bg-primary text-white text-xs flex-1 h-full"
                        onClick={() => handleDelete(item)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-white mt-auto">
        <div className="flex justify-between items-center p-4 border-t">
          <span className="font-medium">Tổng tiền</span>
          <span className="text-primary font-bold text-xl">{formatCurrency(totalPrice)}</span>
        </div>
        <div className="p-4 pt-0">
          <button
            onClick={() => {
              if (totalPrice === 0) {
                alert('Vui lòng chọn ít nhất một món trước khi gửi yêu cầu.');
                return;
              }
              handleConfirmOrder();
            }}
            className={`w-full py-3 rounded-full font-medium text-white transition ${totalPrice === 0 ? 'bg-primary opacity-50 cursor-not-allowed' : 'bg-primary hover:opacity-90'
              }`}
          >
            Xác nhận gửi yêu cầu gọi món
          </button>
        </div>
      </div>

      {/* Modal xác nhận đã gửi yêu cầu */}
      {showUnderstand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
            <div className="mb-4 text-xl font-bold">ĐÃ GỬI YÊU CẦU XÁC NHẬN</div>
            <p className="mb-6">Gọi món thành công, vui lòng chờ nhân viên đến xác nhận</p>
            <button onClick={handleUnderstand} className="bg-blue-500 text-white px-8 py-2 rounded-full">
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showConfirmation && (
        <ConfirmModal
          title="Xác nhận xóa sản phẩm khỏi giỏ hàng"
          message="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?"
          onConfirm={() => {
            removeItem(itemDelete._id);
            setShowConfirmation(false);
          }}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default CartDetails;

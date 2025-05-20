import React, { useEffect, useState } from 'react'
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import O_OrderManage from '../components/O_OrderManage';
import O_MenuManage from '../components/O_MenuManage';
import api from '../server/api';
import O_CounterStatistics from '../components/O_CounterStatistics';
import { FaHome, FaClipboardList, FaUtensils, FaSignOutAlt } from 'react-icons/fa';

export const Owner = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('ownerCurrentView') || 'dashboard';
  });
  const [stallName, setStallName] = useState('');
  const [currentStallId, setCurrentStallId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [inputStallName, setInputStallName] = useState('');
  const [foodstalls, setFoodstalls] = useState([]);

  useEffect(() => {
    const fetchStallInfo = async () => {
      try {
        const userString = localStorage.getItem('user');
        if (!userString) {
          navigate('/login');
          return;
        }
        const parsed = JSON.parse(userString);
        if (!parsed || !parsed.user || !parsed.user._id) {
          console.log('Invalid user structure:', parsed);
          navigate('/login');
          return;
        }
        const user = parsed.user;
        const response = await api.get('/s2d/foodstall');
        const foodstalls = response.data;
        setFoodstalls(foodstalls);

        // Sửa đoạn này: user là mảng
        const userStall = foodstalls.find(stall =>
          Array.isArray(stall.user) &&
          stall.user.some(u => u?.toString() === user._id.toString())
        );

        if (userStall) {
          setStallName(userStall.stall_name);
          setCurrentStallId(userStall._id);
        } else {
          setStallName('Chưa có quầy được chỉ định');
          setCurrentStallId(null);
        }
      } catch (error) {
        console.error('Error fetching stall info:', error);
        navigate('/login');
      }
    };

    fetchStallInfo();
  }, [navigate]);


  const handleLogoClick = () => {
    setCurrentView('dashboard');
    localStorage.setItem('ownerCurrentView', 'dashboard');
  };


  const handleConfirmStallName = async () => {
    // Tìm lại đúng quầy của user (user là mảng)
    const foundStall = foodstalls.find(stall =>
      Array.isArray(stall.user) &&
      stall.user.some(u => u?.toString() === currentStallId?.toString())
    ) || foodstalls.find(stall => stall._id === currentStallId);

    if (foundStall && inputStallName.trim()) {
      try {
        await api.put(`/s2d/foodstall/${foundStall._id}`, {
          stall_name: inputStallName.trim()
        });
        const response = await api.get('/s2d/foodstall');
        const updatedFoodstalls = response.data;
        setFoodstalls(updatedFoodstalls);

        const updatedStall = updatedFoodstalls.find(stall => stall._id === foundStall._id);
        setStallName(updatedStall?.stall_name || inputStallName.trim());
        setCurrentStallId(updatedStall?._id || foundStall._id);
        setEditMode(false);
      } catch (error) {
        alert('Cập nhật tên quầy thất bại!');
      }
    } else {
      alert('Không tìm thấy quầy hoặc tên quầy không hợp lệ!');
    }
  };


  return (
    <div className="min-h-screen flex flex-col">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="text-lg font-bungee font-extrabold cursor-pointer hover:opacity-80" onClick={handleLogoClick}>
            <div>Chủ quầy</div>
            <div>SCAN<span className='text-primary'>2</span>DINE</div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="text-sm uppercase font-semibold text-gray-400 mb-2">TỔNG QUAN</div>
          <button
            onClick={() => {
              setCurrentView('dashboard');
              localStorage.setItem('ownerCurrentView', 'dashboard');
            }}
            className={`w-full flex items-center p-2 rounded-lg transition hover:bg-gray-800 ${currentView === 'dashboard' ? 'bg-gray-800' : ''}`}
          >
            <FaHome className="mr-2" /> Thống kê tổng quan
          </button>
        </div>

        <div className="p-4">
          <div className="text-sm uppercase font-semibold text-gray-400 mb-2">QUẢN LÝ</div>
          <div className="space-y-2">
            <button
              onClick={() => {
                setCurrentView('orders');
                localStorage.setItem('ownerCurrentView', 'orders');
              }}
              className={`w-full flex items-center p-2 rounded-lg transition hover:bg-gray-800 ${currentView === 'orders' ? 'bg-gray-800' : ''}`}
            >
              <FaClipboardList className="mr-2" /> Đơn hàng
            </button>
            <button
              onClick={() => {
                setCurrentView('menu');
                localStorage.setItem('ownerCurrentView', 'menu');
              }}
              className={`w-full flex items-center p-2 rounded-lg transition hover:bg-gray-800 ${currentView === 'menu' ? 'bg-red-700' : ''}`}
            >
              <FaUtensils className="mr-2" /> Thực đơn
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="w-full flex items-center p-2 rounded-lg transition hover:bg-gray-800"
            >
              <FaSignOutAlt className="mr-2" /> Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex-1 flex flex-col">
        {/* Header */}
        <header className="w-full px-6 py-4 bg-white border-b shadow-sm flex justify-center items-center">
          <div className='text-center'>
            <span className="font-bold text-lg text-primary">
              Xin chào, {stallName}!
              {/* Only show edit button if stallName is default */}
              {!editMode && (
                (stallName === 'Trống' || stallName === 'Chưa có tên quầy' || stallName === 'Chưa có quầy được chỉ định') && (
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
                    onClick={() => setEditMode(true)}
                  >
                    Sửa
                  </button>
                )
              )}
            </span>
            {editMode && (
              <div className="mt-2 flex justify-center items-center">
                <input
                  type="text"
                  className="border px-2 py-1 rounded mr-2"
                  placeholder="Nhập tên quầy..."
                  value={inputStallName}
                  onChange={e => setInputStallName(e.target.value)}
                />
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded mr-2"
                  onClick={handleConfirmStallName}
                >
                  Xác nhận
                </button>
                <button
                  className="px-2 py-1 bg-gray-400 text-white rounded"
                  onClick={() => setEditMode(false)}
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-grow p-6 bg-gray-100">
          {currentView === 'dashboard' && (
            <O_CounterStatistics
              stallId={currentStallId}
            />
          )}
          {currentView === 'orders' && (
            <O_OrderManage
              stallId={currentStallId}
            />
          )}
          {currentView === 'menu' && (
            <O_MenuManage
              stallId={currentStallId}
            />
          )}
        </div>

        <Footer />
      </div>
    </div>
  )
}

export default Owner; 
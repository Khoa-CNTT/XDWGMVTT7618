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

  useEffect(() => {
    const fetchStallInfo = async () => {
      try {
        const userString = localStorage.getItem('user');

        if (!userString) {
          navigate('/login');
          return;
        }

        const parsed = JSON.parse(userString);

        // Kiểm tra parsed.user._id
        if (!parsed || !parsed.user || !parsed.user._id) {
          console.log('Invalid user structure:', parsed);
          navigate('/login');
          return;
        }

        const user = parsed.user; // <- lấy đúng
        const response = await api.get('/s2d/foodstall');
        const foodstalls = response.data;

        const userStall = foodstalls.find(stall => {
          const stallUserId = typeof stall.user === 'object' ? stall.user._id : stall.user;
          return stallUserId?.toString() === user._id.toString();
        });


        if (userStall) {
          setStallName(userStall.stall_name);
          setCurrentStallId(userStall._id);
        } else {
          setStallName('Chưa có quầy được chỉ định');
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
            <span className="font-medium text-lg">Xin chào, {stallName}!</span>
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
import React, { useEffect, useState } from 'react'
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import O_OrderManage from '../components/O_OrderManage';
import O_MenuManage from '../components/O_MenuManage';
import api from '../server/api';
import O_CounterStatistics from '../components/O_CounterStatistics';

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
            console.log('All foodstalls:', foodstalls);

            const userStall = foodstalls.find(stall => {
                const stallUserId = typeof stall.user === 'object' ? stall.user._id : stall.user;
                return stallUserId?.toString() === user._id.toString();
            });

            console.log('Found stall:', userStall);

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
      {/* Header */}
      <header className="w-full px-6 py-3 bg-gray-900 text-white flex justify-between items-center">
        <div
          onClick={handleLogoClick}
          className="text-lg font-bungee font-extrabold cursor-pointer hover:opacity-80"
        >
          SCAN<span className='text-primary'>2</span>DINE
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span>Xin chào, {stallName}!</span>
        </div>
        <div>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="text-white hover:underline"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Body: Sidebar + Main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-300 flex flex-col">
          <nav className="flex-1 p-4 space-y-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="w-full block p-3 rounded-lg transition bg-primary text-white hover:bg-red-500"
            >
              Thống kê tổng quan
            </button>
            <button
              onClick={() => setCurrentView('orders')}
              className="w-full block p-3 rounded-lg transition bg-primary text-white hover:bg-red-500"
            >
              Quản lý đơn hàng
            </button>
            <div className="space-y-2">
              <button
                onClick={() => setCurrentView('menu')}
                className="w-full block p-3 rounded-lg transition bg-primary text-white hover:bg-red-500"
              >
                Quản lý thực đơn
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content + Footer */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1">
            {currentView === 'orders' ? (
              <O_OrderManage stallId={currentStallId} />
            ) : currentView === 'menu' ? (
              <O_MenuManage stallId={currentStallId} />
            ) : (
              <O_CounterStatistics stallId={currentStallId} />
            )}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default Owner;
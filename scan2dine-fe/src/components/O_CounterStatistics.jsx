import React, { useState, useEffect } from 'react';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { fetchStallRevenue, fetchMonthlyRevenue, fetchOrderStats } from '../server/revenueService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,    // Thêm dòng này
  LineElement,     // Thêm dòng này
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,    // Thêm dòng này
  LineElement,     // Thêm dòng này
  Title,
  Tooltip,
  Legend
);

const O_CounterStatistics = ({ stallId }) => {
  const [timeFilter, setTimeFilter] = useState('today');
  const [revenueData, setRevenueData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyRevenueData, setDailyRevenueData] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [filteredData, setFilteredData] = useState({
    total_orders: 0,
    total_revenue: 0,
    daily_revenue: []
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (!stallId) {
          setError('No stall ID provided');
          setLoading(false);
          return;
        }

        // Fetch both revenue data sets
        const [revenueResponse, monthlyResponse] = await Promise.all([
          fetchStallRevenue(stallId),
          fetchMonthlyRevenue(stallId)
        ]);

        setRevenueData(revenueResponse);
        setMonthlyData(monthlyResponse);

        // Apply initial filter (today)
        filterDataByTimeRange('today', revenueResponse, monthlyResponse);

        setLoading(false);
      } catch (err) {
        console.error('Error in data fetching:', err);
        setError(err.message || 'Failed to fetch data');
        setLoading(false);
      }
    };

    if (stallId) {
      fetchData();
      setError(null); // Clear any previous errors when stallId becomes available
    } else {
      setError('No stall ID provided');
      setLoading(false);
    }
  }, [stallId]);


  const filterDataByTimeRange = async (range) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats from backend
      const stats = await fetchOrderStats();

      let totalOrders = 0;
      let totalRevenue = 0;
      let dailyRevenue = [];
      let monthlyRevenue = [];

      if (stats) {
        if (range === 'today' && stats.dayStats) {
          totalOrders = stats.dayStats.totalOrders || 0;
          totalRevenue = stats.dayStats.totalRevenue || 0;
          const today = new Date();
          const todayStr = today.toISOString().slice(0, 10);
          dailyRevenue = [{
            date: todayStr,
            revenue: totalRevenue,
            orders: totalOrders
          }];
          setDailyRevenueData(dailyRevenue);
          setMonthlyRevenueData([]);
        } else if (range === 'week' && stats.dailyRevenueInMonth) {
          // Filter only days in current week
          const now = new Date();
          const firstDayOfWeek = new Date(now);
          const dayOfWeek = now.getDay();
          const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
          firstDayOfWeek.setDate(now.getDate() + diffToMonday);
          firstDayOfWeek.setHours(0, 0, 0, 0);
          const lastDayOfWeek = new Date(firstDayOfWeek);
          lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
          lastDayOfWeek.setHours(23, 59, 59, 999);

          dailyRevenue = stats.dailyRevenueInMonth
            .filter(item => {
              const date = new Date(item._id);
              return date >= firstDayOfWeek && date <= lastDayOfWeek;
            })
            .map(item => ({
              date: item._id,
              revenue: item.totalRevenue,
              orders: item.totalOrders
            }));

          totalOrders = dailyRevenue.reduce((sum, d) => sum + d.orders, 0);
          totalRevenue = dailyRevenue.reduce((sum, d) => sum + d.revenue, 0);

          setDailyRevenueData(dailyRevenue);
          setMonthlyRevenueData([]);
        } else if (range === 'month' && stats.monthlyRevenueInYear) {
          // Show all months in current year
          // Pad months to always show 1-12
          const monthsArr = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            revenue: 0,
            orders: 0
          }));
          stats.monthlyRevenueInYear.forEach(item => {
            const idx = item.month - 1;
            if (monthsArr[idx]) {
              monthsArr[idx].revenue = item.totalRevenue;
              monthsArr[idx].orders = item.totalOrders;
            }
          });

          monthlyRevenue = monthsArr;
          totalOrders = monthlyRevenue.reduce((sum, d) => sum + d.orders, 0);
          totalRevenue = monthlyRevenue.reduce((sum, d) => sum + d.revenue, 0);

          setMonthlyRevenueData(monthlyRevenue);
          setDailyRevenueData([]);
        }
      }

      setFilteredData({
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        daily_revenue: dailyRevenue
      });

      setTimeFilter(range);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch order stats');
      setLoading(false);
    }
  };


  const handleFilterChange = (range) => {
    filterDataByTimeRange(range, revenueData, monthlyData);
  };

  // Format currency
  const formatCurrency = (amount) =>
    amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
      .replace(/\s₫/, 'đ'); // Thay thế khoảng trắng trước ₫ bằng 'đ'

  // Prepare chart data
  const chartData = timeFilter === 'month' && monthlyRevenueData.length > 0
    ? {
      labels: monthlyRevenueData.map(item => `Tháng ${item.month}`),
      datasets: [
        {
          label: 'Doanh thu',
          data: monthlyRevenueData.map(item => item.revenue),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ],
    }
    : {
      labels: dailyRevenueData.map(item => item.date) || [],
      datasets: [
        {
          label: 'Doanh thu',
          data: dailyRevenueData.map(item => item.revenue) || [],
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ],
    };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Biểu đồ doanh thu',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
  };


  if (loading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Lỗi: {error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          📊 Thống kê doanh thu
        </h2>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition">
            <FaFileExcel className="mr-2" /> Xuất Excel
          </button>
          <button className="flex items-center px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition">
            <FaFilePdf className="mr-2" /> Xuất PDF
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center flex-wrap gap-3 mb-10">
        {['today', 'week', 'month'].map((type) => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            className={`px-6 py-2.5 rounded-full font-semibold capitalize transition duration-150 ${timeFilter === type
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {type === 'today' ? 'Hôm Nay' : type === 'week' ? 'Tuần Này' : 'Tháng Này'}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-blue-200 p-5 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-blue-700">Tổng đơn hàng</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{filteredData.total_orders}</p>
        </div>
        <div className="bg-white border border-green-200 p-5 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-green-700">Tổng doanh thu</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(filteredData.total_revenue)}</p>
        </div>
      </div>

      {/* Revenue Chart + Top Product */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 Biểu đồ doanh thu</h3>
          <div className="h-96">
            <Bar options={chartOptions} data={chartData} />
          </div>
        </div>

        {/* Top Product */}
        {revenueData?.top_product?.pd_name && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-yellow-800">⭐ Món bán chạy nhất</h3>
            <p className="mt-1 text-gray-800 font-medium text-lg">{revenueData.top_product.pd_name}</p>
            <p className="text-sm text-gray-600 mt-1">Đã bán: {revenueData.top_product.total_sold} món</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default O_CounterStatistics;
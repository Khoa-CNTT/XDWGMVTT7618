import React, { useState, useEffect } from 'react';
import { FaFileExcel, FaFilePdf, FaChartBar, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import api from '../server/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const O_CounterStatistics = ({ stallId }) => {
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    highestRevenueDate: '',
    revenueByDate: []
  });

  useEffect(() => {
    fetchStatistics();
  }, [stallId, dateRange, startDate, endDate]);

  const fetchStatistics = async () => {
    try {
      // This will be replaced with actual API call
      const response = await api.get(`/s2d/statistics/${stallId}`, {
        params: { dateRange, startDate, endDate }
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-100">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Thống kê doanh thu</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            <FaFileExcel /> Xuất Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            <FaFilePdf /> Xuất PDF
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 items-center">
          <select
            className="p-2 border rounded"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="custom">Tùy chọn</option>
          </select>

          {dateRange === 'custom' && (
            <div className="flex gap-2 items-center">
              <input
                type="date"
                className="p-2 border rounded"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span>đến</span>
              <input
                type="date"
                className="p-2 border rounded"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Tổng số đơn hàng</h3>
          <p className="text-3xl font-bold text-blue-600">{statistics.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Tổng doanh thu</h3>
          <p className="text-3xl font-bold text-green-600">
            {statistics.totalRevenue.toLocaleString()}đ
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Ngày doanh thu cao nhất</h3>
          <p className="text-3xl font-bold text-purple-600">{statistics.highestRevenueDate}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Biểu đồ doanh thu</h3>
        <div className="h-80">
          <Bar
            data={{
              labels: statistics.revenueByDate.map(item => item.date),
              datasets: [{
                label: 'Doanh thu',
                data: statistics.revenueByDate.map(item => item.revenue),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default O_CounterStatistics;
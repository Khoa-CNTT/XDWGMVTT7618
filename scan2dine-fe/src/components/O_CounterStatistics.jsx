import React, { useState, useEffect } from 'react';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import { Bar } from 'react-chartjs-2';

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
  const [yesterdayRevenue, setYesterdayRevenue] = useState(0);
  const [topProductToday, setTopProductToday] = useState(null);
  const [topProductWeek, setTopProductWeek] = useState(null);
  const [topProductMonth, setTopProductMonth] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [customStats, setCustomStats] = useState(null);

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
      const stats = await fetchOrderStats(stallId);

      let totalOrders = 0;
      let totalRevenue = 0;
      let dailyRevenue = [];
      let monthlyRevenue = [];
      let yesterdayRevenueValue = 0;

      if (stats) {
        if (range === 'today' && stats.dayStats) {
          totalOrders = stats.dayStats.totalOrders || 0;
          totalRevenue = stats.dayStats.totalRevenue || 0;
          const today = new Date();
          const todayStr = today.toISOString().slice(0, 10);
          dailyRevenue = [{
            date: 'Hôm nay',
            revenue: totalRevenue,
            orders: totalOrders
          }];

          // Get yesterday's revenue if available
          if (stats.yesterdayStats) {
            yesterdayRevenueValue = stats.yesterdayStats.totalRevenue || 0;
            dailyRevenue.unshift({
              date: 'Hôm qua',
              revenue: yesterdayRevenueValue,
              orders: stats.yesterdayStats.totalOrders || 0
            });
            // Log yesterday's data
            console.log('Yesterday stats:', stats.yesterdayStats);
          } else if (stats.dailyRevenueInMonth) {
            // Fallback: try to find yesterday in dailyRevenueInMonth
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().slice(0, 10);
            const found = stats.dailyRevenueInMonth.find(item => item._id === yesterdayStr);
            if (found) {
              yesterdayRevenueValue = found.totalRevenue || 0;
              dailyRevenue.unshift({
                date: 'Hôm qua',
                revenue: yesterdayRevenueValue,
                orders: found.totalOrders || 0
              });
            } else {
              // Log if yesterday's data is not found
              console.log('No yesterday data found in dailyRevenueInMonth');
            }
          }

          setYesterdayRevenue(yesterdayRevenueValue);
          setDailyRevenueData(dailyRevenue);
          setMonthlyRevenueData([]);
          setTopProductToday(stats.topProductToday || null);
        } else if (range === 'week' && stats.dailyRevenueInMonth) {
          // Always get Monday as the first day of the week
          const now = new Date();
          const dayOfWeek = now.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
          const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
          const firstDayOfWeek = new Date(now);
          firstDayOfWeek.setDate(now.getDate() + diffToMonday);
          firstDayOfWeek.setHours(0, 0, 0, 0);

          // Create an array of 7 days from Monday to Sunday
          const weekDays = [];
          for (let i = 0; i < 7; i++) {
            const d = new Date(firstDayOfWeek);
            d.setDate(firstDayOfWeek.getDate() + i);
            weekDays.push(d.toISOString().slice(0, 10));
          }

          // Map revenue data to each day, 0 if not found
          dailyRevenue = weekDays.map(dateStr => {
            const found = stats.dailyRevenueInMonth.find(item => item._id === dateStr);
            return {
              date: dateStr,
              revenue: found ? found.totalRevenue : 0,
              orders: found ? found.totalOrders : 0
            };
          });

          // Assign weekday labels
          const weekDayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
          dailyRevenue = dailyRevenue.map((item, idx) => ({
            ...item,
            weekLabel: weekDayLabels[idx]
          }));

          totalOrders = dailyRevenue.reduce((sum, d) => sum + d.orders, 0);
          totalRevenue = dailyRevenue.reduce((sum, d) => sum + d.revenue, 0);

          setDailyRevenueData(dailyRevenue);
          setMonthlyRevenueData([]);
          setTopProductWeek(stats.topProductWeek || null);
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
          setTopProductMonth(stats.topProductMonth || null);
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
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0đ';
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
      .replace(/\s₫/, 'đ');
  }

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
    : timeFilter === 'today'
      ? {
        labels: dailyRevenueData.map(item => item.date),
        datasets: [
          {
            label: 'Doanh thu',
            data: dailyRevenueData.map(item => item.revenue),
            backgroundColor: ['rgba(53, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)'], // Today/Yesterday colors
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

  const handleExportExcel = async () => {
    // Fetch order list for the selected time range
    let orders = [];
    try {
      // You may need to adjust this API call to match your backend
      if (timeFilter === 'today') {
        const stats = await fetchOrderStats();
        orders = stats.ordersToday || [];
      } else if (timeFilter === 'week') {
        const stats = await fetchOrderStats();
        orders = stats.ordersThisWeek || [];
      } else if (timeFilter === 'month') {
        const stats = await fetchOrderStats();
        orders = stats.ordersThisMonth || [];
      }
    } catch (err) {
      alert('Không thể lấy danh sách đơn hàng để xuất Excel!');
      return;
    }

    // Prepare header
    const wsData = [
      ['Mã đơn', 'Khách hàng', 'Số điện thoại', 'Bàn', 'Tổng tiền', 'Thời gian tạo', 'Trạng thái']
    ];

    // Add order rows
    orders.forEach(order => {
      wsData.push([
        order.order_id || order._id || '',
        order.customer_name || order.customer?.name || '',
        order.customer_phone || order.customer?.phone || '',
        order.table_number || order.table?.tb_number || '',
        order.total_amount || order.total || '',
        order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : '',
        order.status || order.order_status || ''
      ]);
    });

    // Add best-selling product if available
    if (revenueData?.top_product?.pd_name) {
      wsData.push([]);
      wsData.push(['Món bán chạy nhất', 'Số lượng đã bán']);
      wsData.push([revenueData.top_product.pd_name, revenueData.top_product.total_sold]);
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DonHang');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'danh_sach_don_hang.xlsx';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Thống kê doanh thu', 14, 16);

    // Prepare table data
    const tableColumn = ['Thời gian', 'Tổng đơn hàng', 'Tổng doanh thu'];
    const tableRows = [
      [
        timeFilter === 'today' ? 'Hôm nay' : timeFilter === 'week' ? 'Tuần này' : 'Tháng này',
        filteredData.total_orders,
        formatCurrency(filteredData.total_revenue)
      ]
    ];
    if (timeFilter === 'today' && dailyRevenueData.length > 1) {
      tableRows.push(['Hôm qua', dailyRevenueData[0].orders, formatCurrency(dailyRevenueData[0].revenue)]);
    }

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 24,
    });
    if (revenueData?.top_product?.pd_name) {
      doc.text('Món bán chạy nhất:', 14, doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 40);
      autoTable(doc, {
        head: [['Tên món', 'Số lượng đã bán']],
        body: [[revenueData.top_product.pd_name, revenueData.top_product.total_sold]],
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 44,
        theme: 'grid'
      });
    }
    doc.save('thong_ke_doanh_thu.pdf');
  };

  const handleCustomRange = async () => {
    if (!fromDate || !toDate) {
      setError('Vui lòng chọn đủ ngày bắt đầu và kết thúc!');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // You need to implement this API in your backend
      const res = await fetchOrderStats(stallId, fromDate, toDate);
      console.log('Custom range API response:', res);
      setCustomStats(res);
      setLoading(false);
    } catch (err) {
      setError('Không thể lấy dữ liệu cho khoảng ngày này!');
      setLoading(false);
    }
  };
  if (loading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Lỗi: {error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">📊</span> Thống kê doanh thu
        </h2>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition"
            onClick={handleExportExcel}>
            <FaFileExcel className="mr-2" /> Xuất Excel
          </button>
          <button className="flex items-center px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
            onClick={handleExportPDF}>
            <FaFilePdf className="mr-2" /> Xuất PDF
          </button>
        </div>
      </div>

      {/* Filter Buttons with badge */}
      <div className="flex justify-center flex-wrap gap-3 mb-10">
        {['today', 'week', 'month'].map((type) => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            className={`px-6 py-2.5 rounded-full font-semibold capitalize transition duration-150 relative ${timeFilter === type
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {type === 'today' ? 'Hôm Nay' : type === 'week' ? 'Tuần Này' : 'Tháng Này'}
            {timeFilter === type && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs px-2 py-0.5 rounded-full font-bold shadow">
                Đang xem
              </span>
            )}
          </button>
        ))}
        {/* Custom Range Button */}
        <button
          onClick={() => {
            setFromDate('');
            setToDate('');
            setCustomStats(null);
            setError(null);
            setTimeFilter('custom');
          }}
          className={`px-6 py-2.5 rounded-full font-semibold capitalize transition duration-150 ${timeFilter === 'custom'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Tùy chọn ngày
        </button>
      </div>

      {/* Custom Date Range Picker */}
      {timeFilter === 'custom' && (
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 justify-center">
          <div>
            <label className="mr-2 font-medium">Từ ngày:</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="mr-2 font-medium">Đến ngày:</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <button
            className="px-4 py-2 bg-primary text-white rounded hover:bg-red-600"
            onClick={handleCustomRange}
          >
            Xem thống kê
          </button>
        </div>
      )}

      {/* Show statistics for custom range if selected */}
      {timeFilter === 'custom' && customStats && (
        <div className="mb-8">
          {console.log('customStats for render:', customStats)}
          <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center">
            <div className="flex-1 bg-white border border-blue-200 p-5 rounded-xl shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-semibold text-blue-700">Tổng đơn hàng</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {
                  // Chỉ tính tổng đơn hàng trong khoảng fromDate - toDate
                  customStats.dailyRevenueInMonth
                    ? customStats.dailyRevenueInMonth
                      .filter(d => d._id >= fromDate && d._id <= toDate)
                      .reduce((sum, d) => sum + (d.totalOrders || 0), 0)
                    : 0
                }
              </p>
            </div>
            <div className="flex-1 bg-white border border-green-200 p-5 rounded-xl shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-semibold text-green-700">Tổng doanh thu</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {
                  // Chỉ tính tổng doanh thu trong khoảng fromDate - toDate
                  formatCurrency(
                    customStats.dailyRevenueInMonth
                      ? customStats.dailyRevenueInMonth
                        .filter(d => d._id >= fromDate && d._id <= toDate)
                        .reduce((sum, d) => sum + (d.totalRevenue || 0), 0)
                      : 0
                  )
                }
              </p>
            </div>
            {customStats.topProduct && (
              <div className="flex-1 bg-gradient-to-br from-yellow-100 to-yellow-50 border-l-4 border-yellow-400 p-5 rounded-xl shadow-lg flex flex-col items-center min-w-[280px] max-w-xs mx-auto">
                <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
                  <span className="mr-2">⭐</span> Món bán chạy nhất
                </h3>
                <p className="mt-1 text-gray-800 font-medium text-lg">{customStats.topProduct.name}</p>
                <p className="text-sm text-gray-600 mt-1">Đã bán: {customStats.topProduct.quantitySold} lần</p>
              </div>
            )}
          </div>
          {/* You can add a chart for customStats if your API returns daily breakdown */}
        </div>
      )}

      {/* Cards Layout */}
      {timeFilter === 'today' ? (
        <>
          {/* First row: Tổng đơn hàng & Tổng doanh thu */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center">
            <div className="flex-1 bg-white border border-blue-200 p-5 rounded-xl shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-semibold text-blue-700">Tổng đơn hàng</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{filteredData.total_orders}</p>
            </div>
            <div className="flex-1 bg-white border border-green-200 p-5 rounded-xl shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-semibold text-green-700">Tổng doanh thu</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(filteredData.total_revenue)}</p>
            </div>
          </div>
          {/* Second row: Món bán chạy nhất & Số liệu hôm qua */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center">
            {topProductToday?.name && (
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-l-4 border-yellow-400 p-5 rounded-xl shadow-lg min-w-[280px] max-w-xs mx-auto flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
                  <span className="mr-2">⭐</span> Món bán chạy nhất
                </h3>
                <p className="mt-1 text-gray-800 font-medium text-lg">{topProductToday.name}</p>
                <p className="text-sm text-gray-600 mt-1">Đã bán: {topProductToday.quantitySold} Lần</p>
              </div>
            )}
            {dailyRevenueData.length > 1 && (
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 border-l-4 border-blue-400 p-5 rounded-xl shadow-lg min-w-[280px] max-w-xs mx-auto flex-1">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <span className="mr-2">📅</span> Số liệu hôm qua
                </h3>
                <p className="mt-1 text-gray-800">
                  Đơn hàng: <span className="font-bold">{dailyRevenueData[0].orders}</span>
                </p>
                <p className="mt-1 text-gray-800">
                  Doanh thu: <span className="font-bold">{formatCurrency(dailyRevenueData[0].revenue)}</span>
                </p>
              </div>
            )}
          </div>
        </>
      ) : timeFilter === 'week' ? (
        <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center">
          <div className="flex-1 bg-white border border-blue-200 p-5 rounded-xl shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-semibold text-blue-700">Tổng đơn hàng</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{filteredData.total_orders}</p>
          </div>
          <div className="flex-1 bg-white border border-green-200 p-5 rounded-xl shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-semibold text-green-700">Tổng doanh thu</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(filteredData.total_revenue)}</p>
          </div>
          {topProductWeek?.name && (
            <div className="flex-1 bg-gradient-to-br from-yellow-100 to-yellow-50 border-l-4 border-yellow-400 p-5 rounded-xl shadow-lg flex flex-col items-center min-w-[280px] max-w-xs mx-auto">
              <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
                <span className="mr-2">⭐</span> Món bán chạy nhất
              </h3>
              <p className="mt-1 text-gray-800 font-medium text-lg">{topProductWeek.name}</p>
              <p className="text-sm text-gray-600 mt-1">Đã bán: {topProductWeek.quantitySold} lần</p>
            </div>
          )}
        </div>
      ) : timeFilter === 'month' ? (
        // For month: all three cards in one row
        <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center">
          <div className="flex-1 bg-white border border-blue-200 p-5 rounded-xl shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-semibold text-blue-700">Tổng đơn hàng</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{filteredData.total_orders}</p>
          </div>
          <div className="flex-1 bg-white border border-green-200 p-5 rounded-xl shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-semibold text-green-700">Tổng doanh thu</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(filteredData.total_revenue)}</p>
          </div>
          {topProductMonth?.name && (
            <div className="flex-1 bg-gradient-to-br from-yellow-100 to-yellow-50 border-l-4 border-yellow-400 p-5 rounded-xl shadow-lg flex flex-col items-center min-w-[280px] max-w-xs mx-auto">
              <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
                <span className="mr-2">⭐</span> Món bán chạy nhất
              </h3>
              <p className="mt-1 text-gray-800 font-medium text-lg">{topProductMonth.name}</p>
              <p className="text-sm text-gray-600 mt-1">Đã bán: {topProductMonth.quantitySold} lần</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Revenue Chart */}
      {(timeFilter === 'week' || timeFilter === 'month') && (
        <div className="bg-gradient-to-br from-purple-50 to-white p-7 rounded-2xl border border-purple-200 shadow-xl w-full max-w-5xl mx-auto">
          <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
            <span className="mr-2">📈</span> Biểu đồ doanh thu
          </h3>
          <div className="h-96 w-full">
            <Bar options={{
              ...chartOptions,
              maintainAspectRatio: false,
            }} data={chartData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default O_CounterStatistics;
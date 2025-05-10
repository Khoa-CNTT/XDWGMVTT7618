import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaFileExcel, FaFilePdf, FaChartBar, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import api from '../server/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { registerSocketListeners, cleanupSocketListeners } from '../services/socketListeners';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const O_CounterStatistics = ({ stallId }) => {
    const [dateRange, setDateRange] = useState('today');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statistics, setStatistics] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        highestRevenueDate: '',
        revenueByDate: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounce API call để tránh gọi liên tục
    const fetchStatistics = useCallback(
        debounce(async () => {
            if (!stallId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/s2d/statistics/${stallId}`, {
                    params: { dateRange, startDate, endDate },
                });
                setStatistics({
                    totalOrders: response.data.totalOrders || 0,
                    totalRevenue: response.data.totalRevenue || 0,
                    highestRevenueDate: response.data.highestRevenueDate || 'N/A',
                    revenueByDate: response.data.revenueByDate || [],
                });
            } catch (error) {
                console.error('Error fetching statistics:', error);
                setError('Không thể tải thống kê. Vui lòng thử lại sau.');
                toast.error('Không thể tải thống kê!');
            } finally {
                setLoading(false);
            }
        }, 500),
        [stallId, dateRange, startDate, endDate]
    );

    // Gọi API khi thay đổi bộ lọc
    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    // Đăng ký socket listeners để cập nhật thời gian thực
    useEffect(() => {
        if (!stallId) return;

        registerSocketListeners({
            customer: { stallId },
            OrderCreated: () => {
                fetchStatistics();
                toast.info('Đơn hàng mới được tạo, thống kê đã được cập nhật!');
            },
            OrderUpdated: () => {
                fetchStatistics();
                toast.info('Đơn hàng đã được cập nhật, thống kê đã được cập nhật!');
            },
            OrderDeleted: () => {
                fetchStatistics();
                toast.info('Đơn hàng đã bị xóa, thống kê đã được cập nhật!');
            },
        });

        return () => {
            cleanupSocketListeners();
        };
    }, [fetchStatistics, stallId]);

    // Xuất Excel
    const exportToExcel = useCallback(() => {
        try {
            const worksheetData = [
                ['Ngày', 'Doanh thu (VND)'],
                ...statistics.revenueByDate.map((item) => [item.date, item.revenue]),
            ];
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Thống kê doanh thu');
            XLSX.writeFile(workbook, `ThongKeDoanhThu_${new Date().toISOString()}.xlsx`);
            toast.success('Xuất Excel thành công!');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            toast.error('Xuất Excel thất bại!');
        }
    }, [statistics.revenueByDate]);

    // Xuất PDF
    const exportToPDF = useCallback(() => {
        try {
            const doc = new jsPDF();
            doc.text('Thống kê doanh thu', 20, 10);
            doc.autoTable({
                head: [['Ngày', 'Doanh thu (VND)']],
                body: statistics.revenueByDate.map((item) => [item.date, item.revenue.toLocaleString()]),
                startY: 20,
            });
            doc.save(`ThongKeDoanhThu_${new Date().toISOString()}.pdf`);
            toast.success('Xuất PDF thành công!');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.error('Xuất PDF thất bại!');
        }
    }, [statistics.revenueByDate]);

    // Dữ liệu biểu đồ
    const chartData = useMemo(
        () => ({
            labels: statistics.revenueByDate.map((item) => item.date),
            datasets: [
                {
                    label: 'Doanh thu',
                    data: statistics.revenueByDate.map((item) => item.revenue),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1,
                },
            ],
        }),
        [statistics.revenueByDate]
    );

    // Tùy chọn biểu đồ
    const chartOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `${value.toLocaleString()}đ`,
                    },
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString()}đ`,
                    },
                },
            },
        }),
        []
    );

    return (
        <div className="flex-1 p-6 bg-gray-100">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Thống kê doanh thu</h2>
                <div className="flex gap-2">
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || statistics.revenueByDate.length === 0}
                    >
                        <FaFileExcel /> Xuất Excel
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || statistics.revenueByDate.length === 0}
                    >
                        <FaFilePdf /> Xuất PDF
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex gap-4 items-center">
                    <select
                        className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={dateRange}
                        onChange={(e) => {
                            setDateRange(e.target.value);
                            if (e.target.value !== 'custom') {
                                setStartDate('');
                                setEndDate('');
                            }
                        }}
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
                                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={endDate || new Date().toISOString().split('T')[0]}
                            />
                            <span>đến</span>
                            <input
                                type="date"
                                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {[...Array(3)].map((_, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-lg shadow animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center p-6 text-gray-500">{error}</div>
            ) : (
                <>
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
                            <p className="text-3xl font-bold text-purple-600">
                                {statistics.highestRevenueDate}
                            </p>
                        </div>
                    </div>

                    {/* Revenue Chart */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Biểu đồ doanh thu</h3>
                        {statistics.revenueByDate.length === 0 ? (
                            <div className="text-center text-gray-500 p-6">Không có dữ liệu để hiển thị.</div>
                        ) : (
                            <div className="h-80">
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default O_CounterStatistics;
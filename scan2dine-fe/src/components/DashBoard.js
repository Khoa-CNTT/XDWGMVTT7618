import { useEffect, useState } from 'react';
import api from '../server/api';
import React, { PureComponent } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Brush,
    AreaChart,
    Area,
    ResponsiveContainer,
} from 'recharts';

import {

    FaUsers,
    FaShoppingCart,
    FaDollarSign,
    FaChartBar,
    FaChartPie,
    FaCalendarAlt,
    FaBell,
    FaArrowUp,
    FaArrowDown
} from 'react-icons/fa';

export default function Dashboard() {

    const [data, setData] = useState({});
    const [data2, setData2] = useState({});


    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        const res = await api.get('/s2d/foodstall/thongke');
        const res2 = await api.get('/s2d/foodstall/thongkeCustomer');
        console.log('data', res2.data);
        setData(res.data)
        setData2(res2.data)

    }


    // 
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };
    // Dữ liệu thống kê mẫu
    const stats = [
        { id: 1, title: "Khách hàng", value: (data2.totalCustomers), icon: FaUsers, change: "+5%", color: "bg-blue-500" },
        { id: 2, title: "Doanh thu", value: formatCurrency(data?.totalRevenue || 0), icon: FaDollarSign, change: "+12%", color: "bg-green-500" },
        { id: 3, title: "Đơn hàng", value: (data.totalOrders), icon: FaShoppingCart, change: "-2%", color: "bg-purple-500" },
    ];

    //custom rê chuột biểu đồ
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border border-gray-300 rounded shadow text-sm">
                    <p className="font-semibold">Ngày: {label}</p>
                    <p className="text-blue-600">Tổng tiền: {payload[0].value.toLocaleString('vi-VN')} VND</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6 bg-gray-100">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
                <p className="text-gray-600">Chào mừng bạn đến với bảng điều khiển tổng quan</p>
            </div>

            {/* Thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat) => (
                    <div key={stat.id} className="bg-white rounded-lg shadow p-6 flex items-center">
                        <div className={`${stat.color} rounded-full p-3 mr-4 text-white`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                            <p className={`text-sm ${stat.change.includes('+') ? 'text-green-500' : 'text-red-500'} flex items-center mt-1`}>
                                {stat.change.includes('+') ? (
                                    <FaArrowUp size={12} className="mr-1" />
                                ) : (
                                    <FaArrowDown size={12} className="mr-1" />
                                )}
                                {stat.change} so với tháng trước
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Doanh thu {data.currentMonth}</h2>
                        <div className="text-gray-500">
                            <FaChartBar size={18} />
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            width={500}
                            height={400}
                            data={data.dailyRevenue}
                            syncId=""
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id"
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    return `${day}/${month}`;
                                }} />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Phân bổ doanh thu</h2>
                        <div className="text-gray-500">
                            <FaChartPie size={18} />
                        </div>
                    </div>
                    <div className="flex justify-center items-center h-64">
                        <div className="relative w-48 h-48">
                            {/* Đây là biểu đồ tròn đơn giản */}
                            <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
                            <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' }}></div>
                            <div className="absolute inset-0 rounded-full border-8 border-yellow-500" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)' }}></div>
                            <div className="absolute inset-0 rounded-full border-8 border-red-500" style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 0, 50% 0)' }}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white rounded-full w-24 h-24"></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center mt-4 space-x-4">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Sản phẩm A (40%)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Sản phẩm B (25%)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Sản phẩm C (20%)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Khác (15%)</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
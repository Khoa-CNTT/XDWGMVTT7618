import { useEffect, useState } from 'react';
import api from '../server/api';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart, Bar,
    Rectangle
} from 'recharts';

import {
    FaChartLine,
    FaUsers,
    FaShoppingCart,
    FaDollarSign,
    FaChartBar,
    FaArrowUp,
    FaArrowDown
} from 'react-icons/fa';

export default function Dashboard() {

    const [data, setData] = useState({});
    const [data2, setData2] = useState({});
    const [data3, setData3] = useState({});
    const today = new Date();
    const fromDate = new Date(today.getFullYear(), today.getMonth(), 1); // ngày 1 tháng hiện tại

    const formatDate = (date) => {
        return date.toISOString().split('T')[0]; // Trả về "2025-04-30"
    };



    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        const [res, res2, res3] = await Promise.all([
            api.get('/s2d/foodstall/thongke'),
            api.get('/s2d/foodstall/thongkeCustomer'),
            api.post('/s2d/foodstall/thongkequay', {

                from: formatDate(fromDate),
                to: formatDate(today)

            }),

        ]);
        // console.log('data', res3.data);
        setData(res.data)
        setData2(res2.data)
        setData3(res3.data)

    }

    // Custom giá tiền
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    // Dữ liệu thống kê mẫu
    const stats = [
        {
            id: 1, title: "Khách hàng", value: (data2.customerCount), icon: FaUsers, change: "+5%", color: "bg-blue-500"
        },
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
                <p className="text-gray-600 text-xl font-bold">Chào mừng bạn đến với bảng điều khiển tổng quan</p>
            </div>

            {/* Thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {stats.map((stat) => (
                    <div key={stat.id} className="bg-white rounded-lg shadow p-6 flex items-center">
                        <div className={`${stat.color} rounded-full p-3 mr-4 text-white`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                            {/* <p className={`text-sm ${stat.change.includes('+') ? 'text-green-500' : 'text-red-500'} flex items-center mt-1`}>
                                {stat.change.includes('+') ? (
                                    <FaArrowUp size={12} className="mr-1" />
                                ) : (
                                    <FaArrowDown size={12} className="mr-1" />
                                )}
                                {stat.change} so với tháng trước
                            </p> */}
                        </div>
                    </div>
                ))}
            </div>

            {/* Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Tổng doanh thu {data.currentMonth}</h2>
                        <div className="text-gray-500">
                            <FaChartLine size={18} />
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
                        <h2 className="text-lg font-semibold">Doanh thu theo quầy trong tháng 5</h2>
                        <div className="text-gray-500">
                            <FaChartBar size={18} />
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            width={500}
                            height={300}
                            data={data3}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="stall_name" />
                            <YAxis
                                tickFormatter={(value) =>
                                    new Intl.NumberFormat('vi-VN').format(value)
                                }
                            />
                            <Tooltip
                                formatter={(value, name) => [
                                    new Intl.NumberFormat('vi-VN').format(value),
                                    name === "totalRevenue" ? "Doanh thu" : name
                                ]}
                            />
                            <Legend
                                formatter={(value) => value === "totalRevenue" ? "Doanh thu" : value}
                            />
                            <Bar dataKey="totalRevenue" fill="#82ca9d" activeBar={<Rectangle fill="#B6282C" stroke="purple" />} />
                        </BarChart>
                    </ResponsiveContainer>


                </div>
            </div>

        </div>
    );
}
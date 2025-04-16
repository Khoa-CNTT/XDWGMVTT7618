import { useState } from 'react';
import {
    FaChartLine,
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
    // Dữ liệu thống kê mẫu
    const stats = [
        { id: 1, title: "Khách hàng", value: "1,257", icon: FaUsers, change: "+5%", color: "bg-blue-500" },
        { id: 2, title: "Doanh thu", value: "$32,580", icon: FaDollarSign, change: "+12%", color: "bg-green-500" },
        { id: 3, title: "Đơn hàng", value: "867", icon: FaShoppingCart, change: "-2%", color: "bg-purple-500" },
        { id: 4, title: "Lượt truy cập", value: "24,798", icon: FaChartLine, change: "+8%", color: "bg-red-500" },
    ];

    // Dữ liệu biểu đồ mẫu
    const chartData = [
        { month: 'Jan', sales: 65, customers: 45 },
        { month: 'Feb', sales: 59, customers: 39 },
        { month: 'Mar', sales: 80, customers: 55 },
        { month: 'Apr', sales: 81, customers: 60 },
        { month: 'May', sales: 56, customers: 42 },
        { month: 'Jun', sales: 55, customers: 40 },
        { month: 'Jul', sales: 78, customers: 63 },
        { month: 'Aug', sales: 65, customers: 45 },
        { month: 'Sep', sales: 90, customers: 70 },
        { month: 'Oct', sales: 75, customers: 55 },
        { month: 'Nov', sales: 85, customers: 65 },
        { month: 'Dec', sales: 95, customers: 75 }
    ];

    // Dữ liệu hoạt động gần đây
    const recentActivities = [
        { id: 1, action: "Đơn hàng mới", details: "Đơn hàng #12345 đã được tạo", time: "5 phút trước" },
        { id: 2, action: "Khách hàng mới", details: "John Smith đã đăng ký tài khoản", time: "15 phút trước" },
        { id: 3, action: "Thanh toán", details: "Đơn hàng #12344 đã được thanh toán", time: "1 giờ trước" },
        { id: 4, action: "Báo cáo mới", details: "Báo cáo tháng 4 đã sẵn sàng", time: "3 giờ trước" },
        { id: 5, action: "Phản hồi", details: "Khách hàng Jane Doe đã gửi phản hồi", time: "5 giờ trước" },
    ];

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
                        <h2 className="text-lg font-semibold">Doanh thu theo tháng</h2>
                        <div className="text-gray-500">
                            <FaChartBar size={18} />
                        </div>
                    </div>
                    <div className="h-64 flex items-end justify-between px-4">
                        {chartData.map((data, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className="flex flex-col items-center space-y-1">
                                    <div
                                        className="bg-blue-500 rounded-t w-8"
                                        style={{ height: `${data.sales * 2}px` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">{data.month}</div>
                            </div>
                        ))}
                    </div>
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

            {/* Hoạt động gần đây */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2 bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Hoạt động gần đây</h2>
                        <div className="text-gray-500">
                            <FaBell size={18} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100">
                                <div className="bg-blue-100 rounded-full p-2 mr-4">
                                    <FaBell size={16} className="text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium">{activity.action}</h4>
                                    <p className="text-sm text-gray-500">{activity.details}</p>
                                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-center">
                        <button className="text-blue-500 text-sm font-medium">Xem tất cả hoạt động</button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Lịch</h2>
                        <div className="text-gray-500">
                            <FaCalendarAlt size={18} />
                        </div>
                    </div>
                    <div className="border rounded-lg">
                        <div className="bg-blue-500 text-white font-medium p-2 text-center">
                            Tháng 4, 2025
                        </div>
                        <div className="grid grid-cols-7 gap-1 p-2 text-center">
                            <div className="text-xs text-gray-500">CN</div>
                            <div className="text-xs text-gray-500">T2</div>
                            <div className="text-xs text-gray-500">T3</div>
                            <div className="text-xs text-gray-500">T4</div>
                            <div className="text-xs text-gray-500">T5</div>
                            <div className="text-xs text-gray-500">T6</div>
                            <div className="text-xs text-gray-500">T7</div>

                            <div className="text-xs text-gray-300 py-1">30</div>
                            <div className="text-xs text-gray-300 py-1">31</div>
                            <div className="text-xs py-1">1</div>
                            <div className="text-xs py-1">2</div>
                            <div className="text-xs py-1">3</div>
                            <div className="text-xs py-1">4</div>
                            <div className="text-xs py-1">5</div>

                            <div className="text-xs py-1">6</div>
                            <div className="text-xs py-1">7</div>
                            <div className="text-xs py-1">8</div>
                            <div className="text-xs py-1">9</div>
                            <div className="text-xs py-1">10</div>
                            <div className="text-xs py-1">11</div>
                            <div className="text-xs py-1">12</div>

                            <div className="text-xs py-1">13</div>
                            <div className="text-xs py-1">14</div>
                            <div className="text-xs py-1">15</div>
                            <div className="text-xs py-1 bg-blue-100 rounded-full font-medium text-blue-700">16</div>
                            <div className="text-xs py-1">17</div>
                            <div className="text-xs py-1">18</div>
                            <div className="text-xs py-1">19</div>

                            <div className="text-xs py-1">20</div>
                            <div className="text-xs py-1">21</div>
                            <div className="text-xs py-1">22</div>
                            <div className="text-xs py-1">23</div>
                            <div className="text-xs py-1">24</div>
                            <div className="text-xs py-1">25</div>
                            <div className="text-xs py-1">26</div>

                            <div className="text-xs py-1">27</div>
                            <div className="text-xs py-1">28</div>
                            <div className="text-xs py-1">29</div>
                            <div className="text-xs py-1">30</div>
                            <div className="text-xs text-gray-300 py-1">1</div>
                            <div className="text-xs text-gray-300 py-1">2</div>
                            <div className="text-xs text-gray-300 py-1">3</div>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <p className="text-sm">Cuộc họp với khách hàng (10:00)</p>
                        </div>
                        <div className="flex items-center p-2 bg-green-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <p className="text-sm">Phát hành phiên bản mới (15:00)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
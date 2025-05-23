
import { useEffect, useState } from 'react';
import {
    FaSearch,
    FaChevronDown,
    FaChevronUp,
    FaChartLine,
    FaChartBar,
    FaChartPie,
} from 'react-icons/fa';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    BarChart, Bar,
    Rectangle,
    PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import api from '../server/api';
import { A_OneStatisticCounter } from './A_OneStatisticCounter';
export const A_StatisticCounter = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');

    const [isChart, setIsChart] = useState(true);

    const [showAlertDate, setShowAlertDate] = useState(false);

    const [data, setData] = useState([]);


    const getToday = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    //state lưu từ ngày đến ngày
    const [fromDate, setFromDate] = useState(getToday());
    const [toDate, setToDate] = useState(getToday());

    //lưu ngày hiển thị ở bảng
    const [confirmedFromDate, setConfirmedFromDate] = useState(getToday());
    const [confirmedToDate, setConfirmedToDate] = useState(getToday());


    //Lấy dữ liệu từ data User
    useEffect(() => {
        fetchDataStatisticCounter()
    }, []);


    const fetchDataStatisticCounter = async () => {
        try {
            const getData = await api.post('/s2d/foodstall/thongkeall', {
                type: "stall",
                filter: "range",
                value: {
                    startDate: fromDate,
                    endDate: toDate
                }
            });
            console.log('Dữ liệu get data', getData.data);
            setData(getData.data);
        } catch (error) {
            console.error('Lỗi khi tải danh mục sản phẩm:', error);
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredData = data.filter(data =>
        data.stall_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
        // data.role_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedData = [...filteredData].sort((a, b) => {
        const isNumericField = ['id', 'number_of_products', 'total_revenue'].includes(sortField);

        const valueA = isNumericField ? parseFloat(a[sortField]) : String(a[sortField]).toLowerCase();
        const valueB = isNumericField ? parseFloat(b[sortField]) : String(b[sortField]).toLowerCase();

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleStatistic = () => {
        if (new Date(fromDate) > new Date(toDate)) {
            setShowAlertDate(true)
            return;
        }
        setShowAlertDate(false)

        setConfirmedFromDate(fromDate);
        setConfirmedToDate(toDate);
        fetchDataStatisticCounter();
    };

    //custom DD/MM/YYYY
    const formatDateToVietnamese = (dateStr) => {
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    };

    const totalRevenue = sortedData.reduce((sum, item) => sum + parseFloat(item.total_revenue), 0);
    const totalDiscount = totalRevenue * 15 / 100;

    //bảng màu 
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    //custom biểu đồ tròn   
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { name, value } = payload[0];
            return (
                <div style={{ background: 'white', padding: '8px', border: '1px solid #ccc' }}>
                    <p>{name}: {value.toLocaleString('vi-VN')} VNĐ</p>
                </div>
            );
        }

        return null;
    };
    const renderCustomLabel = ({ name, percent }) => {
        const percentage = (percent * 100).toFixed(0);
        return `${name}: ${percentage}%`;
    };

    const dataFilter = data.filter(item => item.total_revenue > 0);

    return (

        <div className=" mx-auto bg-white rounded-lg shadow">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Thống kê các quầy</h1>




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
                        onClick={handleStatistic}
                    >
                        Xem thống kê
                    </button>

                </div>
                {showAlertDate && (
                    <div className='flex flex-col md:flex-row items-center gap-4 mb-8 justify-center '><div className='text-primary'>Ngày bắt đầu không được lớn hơn ngày kết thúc!</div></div>
                )

                }
                {/* Search and Add */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Tìm kiếm ..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            <FaSearch size={18} />
                        </div>
                    </div>

                </div>


                {confirmedFromDate && confirmedToDate && (
                    <div className='flex gap-6'>
                        <div className="mb-4 text-gray-700 text-base font-medium">
                            Hiển thị thống kê từ ngày <span className="text-primary">{formatDateToVietnamese(confirmedFromDate)}</span> đến ngày <span className="text-primary">{formatDateToVietnamese(confirmedToDate)}</span>
                        </div>
                        <button
                            className="px-4 bg-primary text-white rounded hover:bg-red-600"
                            onClick={() => setIsChart(true)}
                        >
                            Biểu đồ
                        </button>
                        <button
                            className="px-4 bg-primary text-white rounded hover:bg-red-600"
                            onClick={() => setIsChart(false)}
                        >
                            Chi tiết
                        </button>
                    </div>
                )}
                {/* Table */}
                {isChart ? (
                    <div className=" gap-6 mb-6 mt-5">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Phân bổ doanh thu các quầy</h2>
                                    <div className="text-gray-500">
                                        <FaChartPie size={18} />
                                    </div>
                                </div>
                                {data.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                dataKey="total_revenue"
                                                data={dataFilter}
                                                nameKey="stall_name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label={renderCustomLabel}
                                            >
                                                {dataFilter.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p>Không có dữ liệu để hiển thị</p>
                                )}

                            </div>

                            {/* <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Doanh thu theo quầy</h2>
                                    <div className="text-gray-500">
                                        <FaChartBar size={18} />
                                    </div>
                                </div>
                                {data.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ComposedChart
                                            layout="vertical"
                                            width={500}
                                            height={400}
                                            data={data}
                                            margin={{
                                                top: 20,
                                                right: 20,
                                                bottom: 20,
                                                left: 20,
                                            }}
                                        >
                                            <CartesianGrid stroke="#f5f5f5" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" scale="band" />
                                            <Tooltip />
                                            <Legend />
                                            <Area dataKey="amt" fill="#8884d8" stroke="#8884d8" />
                                            <Bar dataKey="pv" barSize={20} fill="#413ea0" />
                                            <Line dataKey="uv" stroke="#ff7300" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p>Không có dữ liệu để hiển thị</p>
                                )}


                            </div> */}
                        </div>

                        <div className="bg-white rounded-lg shadow p-6 mt-5 ">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Doanh thu theo quầy</h2>
                                <div className="text-gray-500">
                                    <FaChartBar size={18} />
                                </div>
                            </div>
                            {data.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        width={500}
                                        height={300}
                                        data={data}
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
                                                name === "total_revenue" ? "Doanh thu" : name
                                            ]}
                                        />
                                        <Legend
                                            formatter={(value) => value === "total_revenue" ? "Doanh thu" : value}
                                        />
                                        <Bar dataKey="total_revenue" fill="#82ca9d" activeBar={<Rectangle fill="#B6282C" stroke="purple" />} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p>Không có dữ liệu để hiển thị</p>
                            )}



                        </div>
                    </div>

                ) : (
                    <div className="max-w-6xl mx-auto bg-white p-4 shadow-md rounded-md">
                        <table className="w-full border-collapse shadow-xl">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">STT</th>
                                    <th
                                        className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                        onClick={() => handleSort('stall_name')}
                                    >
                                        <div className="flex items-center">
                                            TÊN QUẦY
                                            {sortField === 'stall_name' &&
                                                (sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />)}
                                        </div>
                                    </th>
                                    <th
                                        className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                        onClick={() => handleSort('owner_name')}
                                    >
                                        <div className="flex items-center">
                                            TÊN CHỦ QUẦY
                                            {sortField === 'owner_name' &&
                                                (sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />)}
                                        </div>
                                    </th>
                                    <th
                                        className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                        onClick={() => handleSort('number_of_products')}
                                    >
                                        <div className="flex items-center">
                                            SỐ MÓN
                                            {sortField === 'number_of_products' &&
                                                (sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />)}
                                        </div>
                                    </th>
                                    <th
                                        className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                        onClick={() => handleSort('username')}
                                    >
                                        <div className="flex items-center">
                                            SỐ ĐƠN
                                            {sortField === 'username' &&
                                                (sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />)}
                                        </div>
                                    </th>
                                    <th
                                        className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                        onClick={() => handleSort('total_revenue')}
                                    >
                                        <div className="flex items-center">
                                            DOANH THU CỦA QUẦY
                                            {sortField === 'total_revenue' &&
                                                (sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />)}
                                        </div>
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">PHÍ CHIẾT KHẤU (15%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.length > 0 ? (
                                    sortedData.map((data, index) => (
                                        <A_OneStatisticCounter key={data._id} data={data} index={index} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-gray-500">
                                            Không tìm thấy người dùng nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Phần tổng kết nằm dưới bảng */}
                        <div className="h-5" /> {/* Spacer để không bị che bởi footer */}
                        <div className="fixed left-100   bottom-0 right-0 bg-white border-t border-gray-300 shadow-lg p-4 flex justify-center gap-10 z-50">
                            <div className="text-lg font-semibold text-gray-800">
                                Tổng Doanh thu: <span className="text-green-600">{totalRevenue.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                                Tổng Phí chiết khấu (15%): <span className="text-red-600">{totalDiscount.toLocaleString('vi-VN')}₫</span>
                            </div>
                        </div>
                    </div>
                )}



            </div>

        </div>


    )
}

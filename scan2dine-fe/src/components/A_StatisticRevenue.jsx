
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
import { A_OneStatisticDish } from './A_OneStatisticDish';
export const A_StatisticRevenue = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');

    const [isChart, setIsChart] = useState(true);

    const [data, setData] = useState([]);
    const currentYear = new Date().getFullYear();


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
            const getData = await api.post('/s2d/foodstall/thongkeall12month', {
                year: currentYear
            });
            console.log('Dữ liệu get data year', getData.data.monthlyStats);
            setData(getData.data.monthlyStats);
        } catch (error) {
            console.error('Lỗi khi tải danh mục sản phẩm:', error);
        }
    };



    return (

        <div className=" mx-auto bg-white rounded-lg shadow">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Biểu đồ doanh thu</h1>

                <div className=" gap-6 mb-6 mt-5">
                    <div className="bg-white rounded-lg shadow p-6 mt-5 ">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Tổng doanh thu và đơn hàng trong năm {currentYear}</h2>
                            <div className="text-gray-500">
                                <FaChartBar size={18} />
                            </div>
                        </div>

                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height={490}>
                                <ComposedChart data={data}>
                                    <XAxis dataKey="month" />

                                    <YAxis
                                        yAxisId="left"
                                        label={{ value: 'Số tiền (triệu)', angle: -90, position: 'insideLeft' }}
                                        width={170}
                                        tickFormatter={(value) => (value / 1_000_000).toFixed(1)}
                                    />
                                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Số đơn', angle: -90 }} width={100} />

                                    <Tooltip
                                        labelFormatter={(value) => `Tháng ${value}`}
                                        formatter={(value, name) => {
                                            if (name === "Số tiền") {
                                                const millions = value / 1_000_000;
                                                return [`${millions.toFixed(2)} triệu VND`, name];
                                            }
                                            return [value, name]; // Giữ nguyên số đơn
                                        }}
                                    />


                                    {/* Cột biểu diễn số tiền */}
                                    <Bar yAxisId="left" dataKey="totalRevenue" fill="#8884d8" name="Số tiền" />

                                    {/* Đường biểu diễn số đơn */}
                                    <Line yAxisId="right" type="monotone" dataKey="totalOrders" stroke="#82ca9d" name="Số đơn" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>Không có dữ liệu để hiển thị</p>
                        )}



                    </div>
                </div>






            </div >

        </div >


    )
}

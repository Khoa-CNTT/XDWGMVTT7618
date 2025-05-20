
import { useEffect, useState } from 'react';
import {
    FaUserPlus,
    FaSearch,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa';
import api from '../server/api';
import { A_OneStatisticCounter } from './A_OneStatisticCounter';
export const A_StatisticCounter = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');

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
    const totalDiscount = sortedData.reduce((sum, item) => sum + parseFloat(item.discount_fee || 0), 0);

    return (

        <div className=" mx-auto bg-white rounded-lg shadow">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Thống kê các quầy</h1>




                <div className="flex flex-col md:flex-row items-center gap-4 mb-8 justify-center">
                    <div>
                        <label className="mr-2 font-medium">Ngày bắt đầu:</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={e => setFromDate(e.target.value)}
                            className="border rounded px-2 py-1"
                        />
                    </div>
                    <div>
                        <label className="mr-2 font-medium">Ngày kết thúc:</label>
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
                {/* Search and Add */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-3 top-2.5 text-gray-400">
                            <FaSearch size={18} />
                        </div>
                    </div>

                </div>

                {/* Table */}
                {confirmedFromDate && confirmedToDate && (
                    <div className="mb-4 text-gray-700 text-sm font-medium">
                        Hiển thị thống kê từ ngày <span className="text-primary">{formatDateToVietnamese(confirmedFromDate)}</span> đến ngày <span className="text-primary">{formatDateToVietnamese(confirmedToDate)}</span>
                    </div>
                )}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="w-full border-collapse shadow-xl">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-200">
                                <th
                                    className="text-left py-3 px-4 font-semibold text-sm text-gray-600"
                                >
                                    <div className="flex items-center">
                                        STT
                                    </div>
                                </th>
                                <th
                                    className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                    onClick={() => handleSort('stall_name')}
                                >
                                    <div className="flex items-center">
                                        TÊN QUẦY
                                        {sortField === 'stall_name' && (
                                            sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                    onClick={() => handleSort('owner_name')}
                                >
                                    <div className="flex items-center">
                                        TÊN CHỦ QUẦY
                                        {sortField === 'owner_name' && (
                                            sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                    onClick={() => handleSort('number_of_products')}
                                >
                                    <div className="flex items-center">
                                        TỔNG SỐ MÓN
                                        {sortField === 'number_of_products' && (
                                            sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />
                                        )}
                                    </div>
                                </th>

                                <th
                                    className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                    onClick={() => handleSort('username')}
                                >
                                    <div className="flex items-center">
                                        TỔNG SỐ ĐƠN
                                        {sortField === 'username' && (
                                            sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                    onClick={() => handleSort('total_revenue')}
                                >
                                    <div className="flex items-center">
                                        DOANH THU
                                        {sortField === 'total_revenue' && (
                                            sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="text-left py-3 px-4 font-semibold text-sm text-gray-600 "
                                >
                                    <div className="flex items-center">
                                        PHÍ CHIẾT KHẤU (15%)

                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.length > 0 ? (
                                sortedData.map((data, index) => (
                                    <A_OneStatisticCounter
                                        key={data._id}
                                        data={data}
                                        index={index}

                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500">
                                        Không tìm thấy người dùng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg p-4 flex justify-center gap-10 z-50">
                    <div className="text-lg font-semibold text-gray-800">
                        Tổng Doanh thu: <span className="text-green-600">{totalRevenue.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-800">
                        Tổng Phí chiết khấu (15%): <span className="text-red-600">{totalDiscount.toLocaleString('vi-VN')}₫</span>
                    </div>
                </div>
            </div>

        </div>


    )
}

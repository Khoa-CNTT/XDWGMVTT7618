import React, { useEffect, useState, useContext } from 'react';
import { FaArrowLeft, FaUser, FaMapPin, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { TableItem } from '../components/E_TableItem';
import api from '../server/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Footer } from '../components/Footer';
import ConfirmModal from '../components/ConfirmModal'
import { AppContext } from "../components/AppContext";

export const EmployeePage = () => {
    const [tables, setTables] = useState([]);
    const [filteredTables, setFilteredTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();

    //hàm chạy hổ trợ chạy fetchttable khi khách hàng bấm
    const { employeeRefreshFlag } = useContext(AppContext);
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || 'Nhân viên';

    useEffect(() => {
        const handleStorage = (event) => {
            if (event.key === 'employee-refresh') {
                fetchTables(); // 👈 Gọi hàm load danh sách bàn lại
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Filter tables when search term changes
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredTables(tables);
        } else {
            const filtered = tables.filter(table =>
                table.name.toLowerCase().includes(searchTerm.toLowerCase())
                //  ||
                // table.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredTables(filtered);
        }
    }, [searchTerm, tables]);




    const fetchTables = async () => {
        // setLoading(true);
        setError(null);
        try {
            const response = await api.get('/s2d/table');
            setTables(response.data);
            setFilteredTables(response.data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách bàn:', error);
            setError('Không thể tải danh sách bàn. Vui lòng thử lại sau.');
            toast.error('Không thể tải danh sách bàn');
        } finally {
            setLoading(false);
        }
    };


    //Đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('user');
        toast.success('Đăng xuất thành công');
        navigate('/login');
    };

    //hiển thị xác nhận đăng xuất
    const confirmLogout = () => {
        setShowLogoutConfirm(true);
    };

    //hủy
    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-primary p-4 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center">
                    <span className="font-medium text-lg">{`Xin chào, ${user.user?.full_name}`}</span>
                </div>
                <div
                    className="flex items-center cursor-pointer hover:bg-primary-dark p-2 rounded-full transition-all duration-300"
                    onClick={confirmLogout}
                >
                    <FaSignOutAlt size={18} />
                    <span className="ml-2">Đăng xuất</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3 bg-white mt-2 shadow-sm">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bàn..."
                        className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Section Title */}
            <div className="px-4 pt-4 pb-2 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Danh sách bàn</h2>
                <button
                    onClick={fetchTables}
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                    Làm mới
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="text-center p-8">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={fetchTables}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredTables.length === 0 && (
                <div className="text-center p-8">
                    <p className="text-gray-500">Không tìm thấy bàn nào</p>
                </div>
            )}

            {/* Table Grid */}
            {!loading && !error && filteredTables.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-4 pb-20 animate-fade-in">
                    {filteredTables.map(table => (
                        <TableItem key={table.id} table={table} fetchTables={fetchTables} />
                    ))}
                </div>
            )}

            {/* Footer */}
            <Footer />

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <ConfirmModal
                    title={'Xác nhận đăng xuất'}
                    message={'Bạn các chắc chắn muốn đăng xuất?'}
                    onConfirm={handleLogout}
                    onCancel={cancelLogout}
                ></ConfirmModal>
            )}
        </div>
    );
};
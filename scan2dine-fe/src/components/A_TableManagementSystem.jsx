import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaSearch } from 'react-icons/fa';
import { A_TableItem } from './A_TableItem';
import api from '../server/api';
import { A_TableDetail } from './A_TableDetail';
import ConfirmModal from './ConfirmModal';
import Alert from './Alert';
import Swal from 'sweetalert2';


export default function TableManagementSystem() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [alert, setAlert] = useState(null);


    const fetchTable = async () => {
        try {
            const getTable = await api.get('/s2d/table');
            setTables(getTable.data);

        } catch (error) {
            console.error('Lỗi khi tải danh mục sản phẩm:', error);
        }
    };
    //lấy dữ liệu từ data
    useEffect(() => {
        fetchTable();
    }, []);

    const filteredTables = tables
        .filter(table =>
            table.tb_number?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(table => {
            if (statusFilter === 'all') return true;
            if (statusFilter === 'special') return ['3', '4', '5'].includes(table.status);
            return table.status === statusFilter;
        })
        .sort((a, b) => a.tb_number - b.tb_number);



    //Trạng thái số sang chữ
    const getStatusLabel = (status) => {
        switch (status) {
            case '1':
                return 'Bàn trống';
            case '2':
                return 'Đang phục vụ';
            case '3':
            case '4':
            case '5':
                return 'Có yêu cầu đặc biệt';
            default:
                return 'Không xác định';
        }
    };

    //Màu trạng thái
    const statusColors = {
        '1': 'bg-green-100 text-green-800',
        '2': 'bg-blue-100 text-blue-800',
        '3': 'bg-yellow-100 text-yellow-800',
        '4': 'bg-yellow-100 text-yellow-800',
        '5': 'bg-yellow-100 text-yellow-800'
    };

    //thêm bàn

    const createNewTable = async () => {
        try {
            const res = await api.post('/s2d/table');
            fetchTable();

            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Thêm bàn thành công!',
                confirmButtonColor: '#3085d6',
            });
        } catch (error) {
            console.error(error);

            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Thêm bàn thất bại!',
                confirmButtonColor: '#d33',
            });
        }
    };


    //xóa bàn
    // const handleDeleteTable = async (id) => {
    //     try {
    //         await api.delete(`/s2d/table/status/${id}`);
    //         setAlert({ type: 'success', message: 'Xóa bàn thành công!' });
    //         fetchTable()

    //     } catch (error) {
    //         console.error(error);
    //         alert('Xóa bàn thất bại!');
    //     }
    // };

    const handleDeleteTable = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc muốn xóa bàn này?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/s2d/table/status/${id}`);
                fetchTable();

                Swal.fire({
                    icon: 'success',
                    title: 'Đã xóa!',
                    text: 'Bàn đã được xóa thành công.',
                    timer: 2000,
                    showConfirmButton: false
                });

            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Xóa bàn thất bại!',
                    confirmButtonColor: '#d33'
                });
            }
        }
    };



    return (
        <div className="p-6 mx-auto bg-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Hệ thống Quản lý Bàn</h1>

            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaSearch className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                        placeholder="Tìm kiếm bàn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="1">Bàn trống</option>
                        <option value="2">Đang phục vụ</option>
                        <option value="special">Có yêu cầu đặc biệt</option>
                    </select>
                </div>

                <button
                    className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition w-full md:w-auto"
                    onClick={() => setShowConfirmModal(true)}                >
                    <FaPlus className="w-5 h-5 mr-2" />
                    Thêm bàn mới
                </button>
            </div>

            {/* Bảng danh sách */}
            <div className="overflow-x-auto mt-4 shadow-sm border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                STT
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tên bàn
                            </th>
                            {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vị trí
                            </th> */}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTables.map((table, index) => (
                            <A_TableItem
                                key={table._id}
                                index={index}
                                table={table}
                                setSelectedTable={setSelectedTable}
                                setShowQRModal={setShowQRModal}
                                handleDeleteTable={handleDeleteTable}
                                statusColors={statusColors}
                                getStatusLabel={getStatusLabel}></A_TableItem>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800">Bàn trống</h3>
                    <p className="text-2xl font-bold text-green-600">
                        {tables.filter(t => t.status === '1').length}
                    </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800">Đang phục vụ</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {tables.filter(t => t.status === '2').length}
                    </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="text-lg font-semibold text-yellow-800">Có yêu cầu đặc biệt</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                        {tables.filter(t => ['3', '4', '5'].includes(t.status)).length}
                    </p>
                </div>

            </div>

            {/* Modal hiển thị QR code */}
            {showQRModal && selectedTable && (
                <A_TableDetail
                    selectedTable={selectedTable}
                    setShowQRModal={setShowQRModal}></A_TableDetail>
            )}
            {showConfirmModal && (
                <ConfirmModal
                    title="Xác nhận tạo bàn mới"
                    message="Bạn có chắc chắn muốn tạo bàn mới không?"
                    onConfirm={() => {
                        setShowConfirmModal(false);
                        createNewTable();
                    }}
                    onCancel={() => setShowConfirmModal(false)}
                />
            )}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
        </div>

    );
}
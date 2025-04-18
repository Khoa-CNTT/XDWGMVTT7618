import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaSearch } from 'react-icons/fa';
import { AdTableItem } from './A_TableItem';
import api from '../server/api';
import { A_TableDetail } from './A_TableDetail';
import { A_AddTable } from './A_AddTable';

export default function TableManagementSystem() {
    const [tables, setTables] = useState([]);

    const [selectedTable, setSelectedTable] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTable, setNewTable] = useState({ name: '', location: '' });

    useEffect(() => {
        const fetchTable = async () => {
            try {
                const getTable = await api.get('/s2d/table');
                setTables(getTable.data);
            } catch (error) {
                console.error('Lỗi khi tải danh mục sản phẩm:', error);
            }
        };
        fetchTable();
    }, []);

    const filteredTables = tables.filter(table =>
        table.tb_number?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        ||
        // table.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusColors = {
        'Trống': 'bg-green-100 text-green-800',
        'Đang phục vụ': 'bg-blue-100 text-blue-800',
        'Đã đặt': 'bg-yellow-100 text-yellow-800'
    };

    const handleAddTable = () => {
        if (newTable.name && newTable.location) {
            setTables([...tables, {
                id: tables.length + 1,
                name: newTable.name,
                location: newTable.location,
                status: '1'
            }]);
            setNewTable({ name: '', location: '' });
            setShowAddModal(false);
        }
    };

    const handleDeleteTable = (id) => {
        setTables(tables.filter(table => table.id !== id));
    };

    const toggleTableStatus = (id) => {
        setTables(tables.map(table => {
            if (table.id === id) {
                const statuses = ['Trống', 'Đang phục vụ', 'Đã đặt'];
                const currentIndex = statuses.indexOf(table.status);
                const nextIndex = (currentIndex + 1) % statuses.length;
                return { ...table, status: statuses[nextIndex] };
            }
            return table;
        }));
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

                <button
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full md:w-auto"
                    onClick={() => setShowAddModal(true)}
                >
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
                        {filteredTables.map((table) => (
                            <AdTableItem
                                key={table.id}
                                table={table}
                                toggleTableStatus={toggleTableStatus}
                                setSelectedTable={setSelectedTable}
                                setShowQRModal={setShowQRModal}
                                handleDeleteTable={handleDeleteTable}
                                statusColors={statusColors}></AdTableItem>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800">Trống</h3>
                    <p className="text-2xl font-bold text-green-600">{tables.filter(t => t.status === 'Trống').length}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800">Đang phục vụ</h3>
                    <p className="text-2xl font-bold text-blue-600">{tables.filter(t => t.status === 'Đang phục vụ').length}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="text-lg font-semibold text-yellow-800">Đã đặt</h3>
                    <p className="text-2xl font-bold text-yellow-600">{tables.filter(t => t.status === 'Đã đặt').length}</p>
                </div>
            </div>

            {/* Modal hiển thị QR code */}
            {showQRModal && selectedTable && (
                <A_TableDetail
                    selectedTable={selectedTable}
                    setShowQRModal={setShowQRModal}></A_TableDetail>
            )}

            {/* Modal thêm bàn mới */}
            {showAddModal && (
                <A_AddTable
                    newTable={newTable}
                    setNewTable={setNewTable}
                    setShowAddModal={setShowAddModal}
                    handleAddTable={handleAddTable}></A_AddTable>

            )}
        </div>
    );
}
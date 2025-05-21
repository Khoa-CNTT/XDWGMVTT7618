import { useEffect, useState } from 'react';
import { MdPerson, MdRestaurantMenu, MdHistory, MdNotifications, MdSettings, } from 'react-icons/md';
import { FaSearch, FaUserPlus, FaQrcode, FaFileAlt, FaEdit, FaTrashAlt, FaCheck, FaTimes, FaSortAmountDown, FaEllipsisV } from 'react-icons/fa';
import api from '../server/api';
import ToggleSwitch from './ToggleSwitch';

export default function CustomerManagement() {

    //Chứa thông tin khách hàng
    const [customers, setCustomers] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isAddingCustomer, setIsAddingCustomer] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
    });
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    //lấy thông tin khách hàng
    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const getCustomers = await api.get('/s2d/customer/static');
                setCustomers(getCustomers.data.data);
                console.log('Thông tin khách hàng', getCustomers.data.data);


            } catch (error) {
                console.error('Lỗi khi tải danh mục sản phẩm:', error);
            }
        };
        fetchCustomer();
    }, []);

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm)
        // customer.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'active') return matchesSearch && customer.status !== '1';
        if (activeTab === 'inactive') return matchesSearch && customer.status === '1';
        return false;
    });




    const handleToggle = (_id, newStatus) => {
        const updated = customers.map((customer) =>
            customer.customer_id === _id ? { ...customer, status: newStatus } : customer
        );
        setCustomers(updated);

        // Gọi API cập nhật nếu cần
        console.log(`Khách hàng ${customers.customer_id} -> status = ${newStatus}`);
    };

    const handleAddCustomer = () => {
        if (!newCustomer.name || !newCustomer.phone) return;

        const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
        const customerToAdd = {
            ...newCustomer,
            id: newId,
            visits: 0,
            totalSpent: 0,
            lastVisit: new Date().toISOString().split('T')[0],
            status: 'active'
        };

        setCustomers([...customers, customerToAdd]);
        setNewCustomer({ name: '', phone: '', email: '' });
        setIsAddingCustomer(false);
    };

    const handleEditSave = () => {
        setCustomers(customers.map(c => c.id === editingCustomer.id ? editingCustomer : c));
        setEditingCustomer(null);
    };

    const handleDeleteCustomer = (id) => {
        setCustomers(customers.filter(c => c.id !== id));
        setShowDeleteConfirm(null);
    };

    const toggleSelectCustomer = (id) => {
        if (selectedCustomers.includes(id)) {
            setSelectedCustomers(selectedCustomers.filter(cId => cId !== id));
        } else {
            setSelectedCustomers([...selectedCustomers, id]);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div>
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm p-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Quản Lý Khách Hàng</h1>

                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Search and Filters */}
                    <div className="mb-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm khách hàng..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    className={`px-4 py-2 rounded-md transition duration-200 ${activeTab === 'all' ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                    onClick={() => setActiveTab('all')}
                                >
                                    Tất cả
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-md transition duration-200 ${activeTab === 'active' ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                    onClick={() => setActiveTab('active')}
                                >
                                    Hoạt động
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-md transition duration-200 ${activeTab === 'inactive' ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                    onClick={() => setActiveTab('inactive')}
                                >
                                    Bị chặn
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* Customer Table */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600 rounded"
                                            onChange={() => {
                                                if (selectedCustomers.length === filteredCustomers.length) {
                                                    setSelectedCustomers([]);
                                                } else {
                                                    setSelectedCustomers(filteredCustomers.map(c => c.id));
                                                }
                                            }}
                                            checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                                        />
                                    </th> */}
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Liên hệ
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số lần ghé
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng chi tiêu
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lần ghé gần nhất
                                    </th>

                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Chặn
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.customer_id} className="hover:bg-gray-50">
                                        {/* <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 rounded"
                                                checked={selectedCustomers.includes(customer.customer_id)}
                                                onChange={() => toggleSelectCustomer(customer.customer_id)}
                                            />
                                        </td> */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-sm">{customer.name.substring(0, 2).toUpperCase()}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                    <div className="text-sm text-gray-500">ID: {customer.customer_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{customer.phone}</div>
                                            <div className="text-sm text-gray-500">{customer.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            {customer.totalOrders}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                            {formatCurrency(customer.totalSpent)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {customer.latestOrderDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap justify-center items-center text-sm font-medium">
                                            <ToggleSwitch
                                                status={customer.status}
                                                onToggle={(newStatus) => handleToggle(customer.customer_id, newStatus)}></ToggleSwitch>
                                        </td>
                                    </tr>
                                ))}

                                {filteredCustomers.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                            Không tìm thấy khách hàng nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">{filteredCustomers.length}</span> trong tổng số <span className="font-medium">{customers.length}</span> khách hàng
                        </div>
                        <div className="flex space-x-2">
                            <button className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50">Trước</button>
                            <button className="px-4 py-2 border rounded-md bg-blue-600 text-white">1</button>
                            <button className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50">2</button>
                            <button className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50">3</button>
                            <button className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50">Sau</button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Add Customer Modal */}
            {isAddingCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Thêm khách hàng mới</h2>
                            <button onClick={() => setIsAddingCustomer(false)} className="text-gray-500 hover:text-gray-700">
                                <FaTimes className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsAddingCustomer(false)}
                                className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddCustomer}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                disabled={!newCustomer.name || !newCustomer.phone}
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Customer Modal */}
            {editingCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Chỉnh sửa thông tin khách hàng</h2>
                            <button onClick={() => setEditingCustomer(null)} className="text-gray-500 hover:text-gray-700">
                                <FaTimes className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editingCustomer.name}
                                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editingCustomer.phone}
                                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editingCustomer.email}
                                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editingCustomer.status}
                                    onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value })}
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Không hoạt động</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setEditingCustomer(null)}
                                className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleEditSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { FaUtensils, FaClock, FaCheckCircle, FaPrint, FaCheck, FaTimes, FaSpinner, FaUser, FaPhone, } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../server/api';


// Dữ liệu mẫu
const mockTableInfo = {
    id: "table-123",
    name: "Bàn số 15",
    capacity: 4,
    status: "occupied",
    orderTime: "14:30 - 26/04/2025"
};

const mockOrderItems = [
    {
        id: "item-1",
        name: "Phở bò tái",
        price: 75000,
        quantity: 2,
        image: "https://example.com/pho.jpg", // Sẽ hiển thị icon khi ảnh không load được
        notes: "Không hành, nhiều ớt"
    },
    {
        id: "item-2",
        name: "Gỏi cuốn tôm thịt",
        price: 45000,
        quantity: 1,
        image: null,
        notes: null
    },
    {
        id: "item-3",
        name: "Cơm rang hải sản",
        price: 85000,
        quantity: 1,
        image: "https://example.com/rice.jpg",
        notes: "Ít cay"
    },
    {
        id: "item-4",
        name: "Nước chanh tươi",
        price: 25000,
        quantity: 3,
        image: null,
        notes: "Ít đường"
    }
];



const E_OrderDetailDialog = ({ tableId, isOpen, onClose, fetchTables }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tableInfo, setTableInfo] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (isOpen && tableId) {
            // Giả lập việc tải dữ liệu với setTimeout
            setTimeout(() => {
                fetchInfoOrder();
                setLoading(false);
            }, 700); // Giả lập delay 700ms
        }
    }, [isOpen, tableId]);

    useEffect(() => {
        // Calculate total whenever orderItems change
        if (orderItems.length > 0) {
            const calculatedTotal = orderItems.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);
            setTotal(calculatedTotal);
        }
    }, [orderItems]);

    const fetchInfoOrder = async () => {
        try {
            const res = await api.get(`/s2d/table/current/${tableId}`);
            console.log('API của nhân viên', res);

            setTableInfo(res.data.orders[0]); // Lấy đơn đầu tiên
            console.log('Thông tin bàn', res.data.orders[0]);

            setOrderItems(res.data.orders[0].products); // Lấy danh sách món ăn
            console.log('Thông tin order', res.data.orders[0].products);

        } catch (error) {
            console.error('Lỗi fetchOrderItems', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';

        return new Date(dateString).toLocaleString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCompleteOrder = async () => {
        try {
            // Cập nhật trạng thái bàn
            await api.patch(`/s2d/table/${tableId}`, {
                status: '1',
            });

            // Cập nhật trạng thái đơn hàng
            await api.patch(`/s2d/order/${tableInfo.orderId}`, {
                "od_status": "3",
            });
            fetchInfoOrder()
            fetchTables()
            // Nếu cần, thêm thông báo thành công
            console.log("Xác nhận thành công!");
        } catch (error) {
            console.error("Lỗi xác nhận:", error);
        }
    };

    const handleConfirm = async () => {
        try {
            // Cập nhật trạng thái bàn
            await api.patch(`/s2d/table/${tableId}`, {
                status: '2',
            });

            // Cập nhật trạng thái đơn hàng
            await api.patch(`/s2d/order/${tableInfo.orderId}`, {
                status: '2',
            });
            fetchInfoOrder()
            fetchTables()
            // Nếu cần, thêm thông báo thành công
            console.log("Xác nhận thành công!");
        } catch (error) {
            console.error("Lỗi xác nhận:", error);
        }
    };


    //in hóa đơn
    const handlePrintBill = () => {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(`
                < !DOCTYPE html >
                    <html lang="vi">
                        <head>
                            <meta charset="UTF-8">
                                <title>Hóa Đơn Thanh Toán</title>
                                <style>
                                    body {
                                        font - family: Arial, sans-serif;
                                    margin: 20px;
        }
                                    h1 {
                                        text - align: center;
                                    margin-bottom: 10px;
        }
                                    .info, .total {
                                        margin - bottom: 20px;
        }
                                    table {
                                        width: 100%;
                                    border-collapse: collapse;
                                    margin-bottom: 15px;
        }
                                    table, th, td {
                                        border: 1px solid #000;
        }
                                    th, td {
                                        padding: 8px;
                                    text-align: center;
        }
                                    .total p {
                                        text - align: right;
                                    margin: 5px 0;
        }
                                    .footer {
                                        text - align: center;
                                    margin-top: 30px;
                                    font-style: italic;
        }
                                    .qr-code {
                                        text - align: center;
                                    margin-top: 20px;
        }
                                </style>
                        </head>
                        <body>
                            <h1>HÓA ĐƠN THANH TOÁN</h1>

                            <div class="info">
                                <p><strong>Nhà hàng:</strong> Khu chợ đêm SCAN2DINE</p>
                                <p><strong>Địa chỉ:</strong> Cù Chính Lan</p>
                                <p><strong>SĐT:</strong> 0909 123 456</p>
                                <hr>
                                    <p><strong>Mã hóa đơn:</strong> ${tableInfo?.orderId.toUpperCase()}</p>
                                    <p><strong>Bàn số:</strong> ${tableInfo?.tableNumber || ''}</p>
                                    <p><strong>Ngày giờ:</strong> ${formatDate(new Date().toISOString())}</p>
                                    <p><strong>Khách hàng:</strong> ${tableInfo?.customer.name || 'Khách lẻ'}</p>
                                    <p><strong>Số điện thoại:</strong> ${tableInfo?.customer.phone || '---'}</p>

                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th>Món ăn</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${orderItems.map(item => `
                <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.price * item.quantity)}</td>
                </tr>
            `).join('')}
                                </tbody>
                            </table>

                            <div class="total">
                                <p><strong>Tạm tính:</strong> ${formatCurrency(total)}</p>
                                <p><strong>Thuế (8%):</strong> ${formatCurrency(total * 0.08)}</p>
                                <p><strong>Tổng cộng:</strong> ${formatCurrency(total * 1.08)}</p>
                            </div>

                            <div class="qr-code">
                                <p>Quét mã để xem lại hóa đơn:</p>
        //Điền img lại chổ này
                            </div>

                            <div class="footer">
                                <p>Cảm ơn Quý khách! Hẹn gặp lại!</p>
                            </div>

                            <script>
                                window.onload = function() {
                                    window.print();
            setTimeout(() => window.close(), 500);
        };
                            </script>
                        </body>
                    </html>

    `);
            printWindow.document.close();
        } else {
            toast.error('Không thể mở cửa sổ in hóa đơn.');
        }
    };

    // <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(orderLink)}&size=120x120" alt="QR Code"></img>
    // <p><strong>Nhân viên phục vụ:</strong> ${staffName || 'Hệ thống'}</p>
    // <p><strong>Phương thức thanh toán:</strong> ${paymentMethod || 'Chưa xác định'}</p>
    // <p><strong>Ghi chú:</strong> ${orderNote || 'Không có ghi chú'}</p>
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case '1':
                return { label: 'Trống', class: 'bg-green-100 text-green-800' };
            case '2':
                return { label: 'Đang phục vụ', class: 'bg-blue-100 text-blue-800' };
            case '3':
                return { label: 'Yêu cầu xác nhận', class: 'bg-red-100 text-yellow-800' };
            case '4':
                return { label: 'Yêu cầu nhân viên', class: 'bg-red-100 text-yellow-800' };
            case '5':
                return { label: 'Yêu cầu thanh toán', class: 'bg-red-100 text-yellow-800' };
            default:
                return { label: 'Không xác định', class: 'bg-gray-100 text-gray-800' };
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
                {/* Dialog Header */}
                <div className="bg-primary p-4 text-white flex items-center justify-between rounded-t-lg">
                    <h2 className="text-lg font-medium">
                        {loading
                            ? 'Đang tải thông tin...'
                            : tableInfo?.tableNumber != null
                                ? `Chi tiết bàn số ${tableInfo.tableNumber} `
                                : 'Chi tiết bàn'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-primary-dark p-1 rounded-full"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Dialog Content */}
                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <FaSpinner className="animate-spin text-primary" size={32} />
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center">
                            <p className="text-red-500 mb-4">{error}</p>
                            <button
                                onClick={() => {
                                    setLoading(true);
                                    setTimeout(() => {
                                        fetchInfoOrder();
                                        setError(null);
                                        setLoading(false);
                                    }, 700);
                                }}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Table Info */}
                            <div className="p-4 border-b bg-gray-50">
                                <div className="space-y-2">
                                    {tableInfo?.customer && (
                                        <div className="flex items-center text-gray-700">
                                            <FaUser className="mr-2 text-gray-500" size={14} />
                                            <span className="font-medium">
                                                {tableInfo.customer.name || 'Khách vãng lai'}
                                            </span>
                                        </div>
                                    )}

                                    {tableInfo?.customer?.phone && (
                                        <div className="flex items-center text-gray-700">
                                            <FaPhone className="mr-2 text-gray-500" size={14} />
                                            <span>{tableInfo.customer.phone}</span>
                                        </div>
                                    )}

                                    {tableInfo?.createdAt && (
                                        <div className="flex items-center text-gray-700">
                                            <FaClock className="mr-2 text-gray-500" size={14} />
                                            <span>{formatDate(tableInfo.createdAt)}</span>
                                        </div>
                                    )}

                                    {tableInfo?.tableStatus && (
                                        <div className="mt-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusLabel(tableInfo.tableStatus).class}`}>
                                                {getStatusLabel(tableInfo.tableStatus).label}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>


                            {/* Order Items */}
                            <div className="p-4">
                                <h3 className="font-medium text-gray-800 mb-3">Danh sách món</h3>

                                {orderItems.length === 0 ? (
                                    <div className="text-center p-4 text-gray-500">
                                        Chưa có món ăn nào được đặt
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orderItems.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center border-b border-gray-100 pb-3"
                                            >
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded bg-gray-200 mr-3 overflow-hidden">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.productName}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentNode.innerHTML = `< div class="h-full w-full flex items-center justify-center text-gray-400" > <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M352 144c0-44.1 35.9-80 80-80s80 35.9 80 80-35.9 80-80 80-80-35.9-80-80zm128 237.8c0 11-9 20.2-20 20.2h-28c17.9-26.4 28-60.5 28-96 0-19.1-3.2-38.2-9.5-56.7C439.7 255.8 448 237.6 448 216.9c0-30.4-21.9-55.3-48-55.3s-48 24.9-48 55.3c0 11.7 3.2 22.8 8.4 32.4-19.9-5-41.1-7.4-63.4-7.4-0.5 0-1 0.1-1.6 0.1 0.7-5.3 1.6-10.7 1.6-16 0-44.1-35.9-80-80-80s-80 35.9-80 80c0 5.3 0.9 10.7 1.6 16-0.5 0-1-0.1-1.6-0.1-22.3 0-43.5 2.5-63.4 7.4 5.3-9.7 8.4-20.7 8.4-32.4 0-30.4-21.9-55.3-48-55.3s-48 24.9-48 55.3c0 20.7 8.3 38.9 21.5 52.4C3.2 218.6 0 237.7 0 256.9c0 35.5 10.1 69.6 28 96H0c-11 0-20 9.2-20 20.2-0.1 11.5 9.1 20.8 19.9 20.8h346c0.1 0.2 0.3 0.2 0.4 0.4 5.7 9.9 12.9 18.8 22.9 18.8h88c11 0 20-9.2 20-20.2V381.8h2.8zM240 71.9c22.1 0 40 17.9 40 40s-17.9 40-40 40-40-17.9-40-40 17.9-40 40-40zm-128 168c18 0 34.7-9 42.4-23.3 14.7-6 49.1-20.1 85.6-20.1s70.9 14.1 85.6 20.1c7.7 14.4 24.4 23.3 42.4 23.3 26.5 0 48-20.6 48-45.9s-21.5-45.9-48-45.9-48 20.6-48 45.9c0 4.9 0.8 9.5 2.1 13.9-20.3-9-46.4-17.9-82.1-17.9-35.7 0-61.9 8.9-82.1 17.9 1.3-4.4 2.1-9 2.1-13.9 0-25.2-21.5-45.9-48-45.9s-48 20.6-48 45.9 21.5 45.9 48 45.9z"></path></svg></ > `;
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                                <FaUtensils />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{item.productName}</h4>
                                                        <div className="text-sm text-gray-500">
                                                            <span>{item.quantity} x {formatCurrency(item.price)}</span>
                                                            {item.notes && (
                                                                <p className="text-xs italic mt-1">Ghi chú: {item.notes}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="font-medium">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Order Summary */}
                                {orderItems.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-600">Tạm tính</span>
                                            <span className="font-medium">{formatCurrency(total)}</span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-600">Thuế (8%)</span>
                                            <span className="font-medium">{formatCurrency(total * 0.08)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 text-lg font-bold mt-1">
                                            <span>Tổng cộng</span>
                                            <span className="text-primary">{formatCurrency(total * 1.08)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Dialog Actions */}
                {!loading && !error && (
                    <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={handleConfirm}
                                className="px-3 py-2 bg-blue-500 text-white rounded-md flex items-center justify-center hover:bg-blue-600 transition-colors text-sm"
                            >
                                <FaCheck className="mr-1" size={12} />
                                Xác nhận
                            </button>
                            <button
                                onClick={handlePrintBill}
                                className="px-3 py-2 bg-gray-700 text-white rounded-md flex items-center justify-center hover:bg-gray-800 transition-colors text-sm"
                            >
                                <FaPrint className="mr-1" size={12} />
                                In hóa đơn
                            </button>
                            <button
                                onClick={handleCompleteOrder}
                                className="px-3 py-2 bg-green-600 text-white rounded-md flex items-center justify-center hover:bg-green-700 transition-colors text-sm"
                            >
                                <FaCheckCircle className="mr-1" size={12} />
                                Hoàn thành
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default E_OrderDetailDialog;
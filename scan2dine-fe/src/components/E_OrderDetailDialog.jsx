import React, { useState, useEffect, useCallback } from 'react';
import { FaUtensils, FaClock, FaCheckCircle, FaPrint, FaCheck, FaTimes, FaSpinner, FaUser, FaPhone } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../server/api';
import { E_ItemOrderDetail } from './E_ItemOrderDetail';
import debounce from 'lodash/debounce'; // Dùng lodash để debounce thông báo

const E_OrderDetailDialog = ({ tableId, isOpen, onClose, fetchTables }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tableInfo, setTableInfo] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [infoPayment, setInfoPayment] = useState([]);
    const [expandedItemId, setExpandedItemId] = useState(null);

    const handleToggleExpand = useCallback((itemId) => {
        setExpandedItemId(expandedItemId === itemId ? null : itemId);
    }, [expandedItemId]);

    // Debounce thông báo để tránh spam toast
    const debouncedToast = useCallback(
        debounce((message, type = 'info') => {
            toast[type](message);
        }, 1000),
        []
    );

    // Load dữ liệu thông tin đơn hàng
    const fetchInfoOrder = useCallback(async () => {
        try {
            const res = await api.get(`/s2d/table/current/${tableId}`);
            // Kiểm tra nếu không có đơn hợp lệ
            if (!res.data.orders || res.data.orders.length === 0) {
                setTableInfo(null);
                setOrderItems([]);
                setError('Bàn trống.');
                return;
            }
            const order = res.data.orders[0];
            // Nếu đơn đã bị hủy (ví dụ: kiểm tra trạng thái đơn)
            if (order.od_status === '4' || order.isCanceled) { // Tùy vào API trả về
                setTableInfo(null);
                setOrderItems([]);
                setError('Bàn trống.');
                return;
            }
            setTableInfo(order);
            setOrderItems(order.products);
            setError(null);
        } catch (error) {
            setTableInfo(null);
            setOrderItems([]);
            setError('Bàn trống.');
        }
    }, [tableId]);

    // Tính tổng tiền khi orderItems thay đổi
    useEffect(() => {
        if (orderItems.length > 0) {
            const calculatedTotal = orderItems.reduce((sum, item) => {
                return sum + item.price * item.quantity;
            }, 0);
            setTotal(calculatedTotal);
        } else {
            setTotal(0);
        }
    }, [orderItems]);

    // Load dữ liệu khi dialog mở
    useEffect(() => {
        if (isOpen && tableId) {
            fetchInfoOrder()
            const handleStorage = (event) => {
                if (event.key === 'orderEmployee-refresh') {
                    fetchInfoOrder();
                }
            };

            window.addEventListener('storage', handleStorage);
            return () => window.removeEventListener('storage', handleStorage);
            // setLoading(true);
            // setTimeout(() => {
            //     fetchInfoOrder().finally(() => setLoading(false));
            // }, 500);
        }
    }, [isOpen, tableId, fetchInfoOrder]);

    // Cập nhật số lượng sản phẩm
    const handleUpdateQuantity = async (itemId, newQuantity) => {
        try {
            await api.patch(`/s2d/orderdetail/${itemId}`, { quantity: newQuantity });
            setOrderItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                )
            );
            localStorage.setItem('order-refresh', Date.now());
            localStorage.setItem('owner-refresh', Date.now());

            debouncedToast('Cập nhật số lượng thành công!', 'success');
        } catch (error) {
            console.error('Lỗi cập nhật số lượng:', error);
            throw new Error('Cập nhật số lượng thất bại');
        }
    };

    // Xóa sản phẩm
    const handleDeleteItem = async (itemId) => {
        try {
            await api.delete(`/s2d/orderdetail/${itemId}`);
            setOrderItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
            debouncedToast('Đã xóa sản phẩm!', 'success');
            fetchInfoOrder();
            localStorage.setItem('order-refresh', Date.now());
            localStorage.setItem('owner-refresh', Date.now());
        } catch (error) {
            console.error('Lỗi xóa sản phẩm:', error);
            throw new Error('Xóa sản phẩm thất bại');
        }
    };

    // Hoàn thành đơn hàng
    const handleCompleteOrder = async () => {
        try {
            await Promise.all([
                api.patch(`/s2d/table/${tableId}`, { status: '1' }),
                api.patch(`/s2d/order/${tableInfo.orderId}`, { od_status: '3' })
            ]);
            localStorage.removeItem("infoOrder");
            fetchInfoOrder();
            fetchTables();
            localStorage.setItem('order-refresh', Date.now());
            localStorage.setItem('owner-refresh', Date.now());


            debouncedToast('Đơn hàng hoàn thành!', 'success');
            onClose();
        } catch (error) {
            console.error('Lỗi hoàn thành đơn hàng:', error);
            debouncedToast('Hoàn thành đơn hàng thất bại!', 'error');
        }
    };

    // Xác nhận món
    const handleConfirm = async () => {
        try {
            await api.patch(`/s2d/order/confirm-all/${tableInfo.orderId}`);
            fetchInfoOrder();
            fetchTables();
            localStorage.setItem('order-refresh', Date.now());
            localStorage.setItem('owner-refresh', Date.now());

            debouncedToast('Xác nhận món thành công!', 'success');
        } catch (error) {
            console.error('Lỗi xác nhận:', error);
            debouncedToast('Xác nhận món thất bại!', 'error');
        }
    };

    // Hủy đơn hàng
    const handleCancel = async () => {
        try {
            await api.delete(`/s2d/order/removestatus/${tableInfo.orderId}`);
            localStorage.removeItem("infoOrder");
            fetchInfoOrder();
            fetchTables();
            localStorage.setItem('order-refresh', Date.now());

            debouncedToast('Đã hủy đơn hàng!', 'success');
            onClose();
        } catch (error) {
            console.error('Lỗi hủy đơn hàng:', error);
            debouncedToast('Hủy đơn hàng thất bại!', 'error');
        }
    };

    // In hóa đơn (giữ nguyên logic hiện tại, nhưng thêm debounce cho toast)
    const handlePrintBill = async () => {
        try {
            const res = await api.post(`/s2d/vietqr/generate-vietqr`, {
                orderId: tableInfo.orderId,
            });
            setInfoPayment(res);

            const printWindow = window.open('', '_blank', 'width=800,height=600');
            if (printWindow) {
                printWindow.document.write(`
          <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <title>Hóa Đơn Thanh Toán</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; margin-bottom: 10px; }
                .info, .total { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                table, th, td { border: 1px solid #000; }
                th, td { padding: 8px; text-align: center; }
                .total p { text-align: right; margin: 5px 0; }
                .footer { text-align: center; margin-top: 30px; font-style: italic; }
                .qr-code { text-align: center; margin-top: 20px; }
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
                  ${orderItems
                        .map(
                            (item) => `
                    <tr>
                      <td>${item.productName}</td>
                      <td>${item.quantity}</td>
                      <td>${formatCurrency(item.price)}</td>
                      <td>${formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  `
                        )
                        .join('')}
                </tbody>
              </table>
              <div class="total">
                <p><strong>Tạm tính:</strong> ${formatCurrency(total)}</p>
                <p><strong>Thuế (0%):</strong> ${formatCurrency(total * 0.0)}</p>
                <p><strong>Tổng cộng:</strong> ${formatCurrency(total * 1.0)}</p>
              </div>
              <div class="qr-code">
                <p>Quét mã để thanh toán hóa đơn:</p>
                <img src="${res.data.qr_url}" alt="QR Code" style="width: 240px; height: 300px;" />
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
                debouncedToast('Không thể mở cửa sổ in hóa đơn.', 'error');
            }
        } catch (error) {
            console.error('Lỗi in hóa đơn:', error);
            debouncedToast('Không thể tạo QR thanh toán.', 'error');
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
            minute: '2-digit',
        });
    };

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
                <div className="bg-primary p-4 text-white flex items-center justify-between rounded-t-lg">
                    <h2 className="text-lg font-medium">
                        {loading
                            ? 'Đang tải thông tin...'
                            : tableInfo?.tableNumber != null
                                ? `Chi tiết bàn số ${tableInfo.tableNumber}`
                                : 'Chi tiết bàn'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-primary-dark p-1 rounded-full"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <FaSpinner className="animate-spin text-primary" size={32} />
                        </div>
                    ) : (
                        <>
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
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusLabel(tableInfo.tableStatus).class}`}
                                            >
                                                {getStatusLabel(tableInfo.tableStatus).label}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-medium text-gray-800 mb-3">Danh sách món</h3>
                                {orderItems.length === 0 ? (
                                    <div className="text-center p-4 text-gray-500">
                                        Chưa có món ăn nào được đặt
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orderItems.map((item, index) => (
                                            <E_ItemOrderDetail
                                                key={item.id || index}
                                                item={{ ...item, id: item.id || `item-${index}` }}
                                                index={index}
                                                expandedItemId={expandedItemId}
                                                onToggleExpand={handleToggleExpand}
                                                onUpdateQuantity={handleUpdateQuantity}
                                                onDeleteItem={handleDeleteItem}
                                            />
                                        ))}
                                    </div>
                                )}

                                {orderItems.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-600">Tạm tính</span>
                                            <span className="font-medium">{formatCurrency(total)}</span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-600">VAT (0%)</span>
                                            <span className="font-medium">{formatCurrency(total * 0.0)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 text-lg font-bold mt-1">
                                            <span>Tổng cộng</span>
                                            <span className="text-primary">{formatCurrency(total * 1.0)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {!loading && !error && tableInfo && (
                    <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                        <div className="grid grid-cols-2 gap-3">
                            {tableInfo.tableStatus !== '2' && (
                                <>
                                    <button
                                        onClick={handleConfirm}
                                        className="px-3 py-2 rounded-md flex items-center justify-center text-sm transition-colors bg-blue-500 text-white hover:bg-blue-600"
                                    >
                                        <FaCheck className="mr-1" size={12} />
                                        Xác nhận
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-3 py-2 rounded-md flex items-center justify-center text-sm transition-colors bg-red-500 text-white hover:bg-red-600"
                                    >
                                        <FaTimes className="mr-1" size={12} />
                                        Hủy
                                    </button>
                                </>
                            )}
                            {tableInfo.tableStatus === '2' && (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default E_OrderDetailDialog;
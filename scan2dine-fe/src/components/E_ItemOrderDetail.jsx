import React, { useState, useEffect, useCallback } from 'react';
import { FaUtensils, FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { registerSocketListeners, cleanupSocketListeners } from '../services/socketListeners';

export const E_ItemOrderDetail = ({
    item,
    index,
    expandedItemId,
    onToggleExpand,
    onUpdateQuantity,
    onDeleteItem,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const isExpanded = expandedItemId === item.id;

    // Toggle expand item
    const toggleExpand = useCallback(() => {
        if (onToggleExpand) {
            onToggleExpand(item.id);
        }
    }, [onToggleExpand, item.id]);

    // Tăng số lượng
    const handleIncreaseQuantity = useCallback(
        async (e) => {
            e.stopPropagation();
            const maxQuantity = item.maxQuantity || 100;
            if (item.quantity >= maxQuantity) {
                toast.warning(`Số lượng tối đa là ${maxQuantity}!`);
                return;
            }
            if (!onUpdateQuantity || isLoading || (item.status !== '1' && item.status !== '2')) return;
            setIsLoading(true);
            try {
                await onUpdateQuantity(item.id, item.quantity + 1);
                toast.success('Cập nhật số lượng thành công!');
            } catch (error) {
                console.error('Lỗi khi tăng số lượng:', error);
                toast.error('Cập nhật số lượng thất bại!');
            } finally {
                setIsLoading(false);
            }
        },
        [onUpdateQuantity, item.quantity, item.maxQuantity, item.status, isLoading]
    );

    // Giảm số lượng
    const handleDecreaseQuantity = useCallback(
        async (e) => {
            e.stopPropagation();
            if (item.quantity <= 1) {
                toast.warning('Số lượng tối thiểu là 1!');
                return;
            }
            if (!onUpdateQuantity || isLoading || (item.status !== '1' && item.status !== '2')) return;
            setIsLoading(true);
            try {
                await onUpdateQuantity(item.id, item.quantity - 1);
                toast.success('Cập nhật số lượng thành công!');
            } catch (error) {
                console.error('Lỗi khi giảm số lượng:', error);
                toast.error('Cập nhật số lượng thất bại!');
            } finally {
                setIsLoading(false);
            }
        },
        [onUpdateQuantity, item.quantity, item.status, isLoading]
    );

    // Xóa món
    const handleDeleteItem = useCallback(
        async (e) => {
            e.stopPropagation();
            if (!onDeleteItem || isLoading || (item.status !== '1' && item.status !== '2')) return;
            setIsLoading(true);
            try {
                await onDeleteItem(item.id);
                toast.success('Đã xóa sản phẩm thành công!');
            } catch (error) {
                console.error('Lỗi khi xóa sản phẩm:', error);
                toast.error('Xóa sản phẩm thất bại!');
            } finally {
                setIsLoading(false);
            }
        },
        [onDeleteItem, item.id, item.status, isLoading]
    );

    // Định dạng tiền tệ
    const formatCurrency = useCallback((value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    }, []);

    // Hiển thị trạng thái
    const renderStatusBadge = useCallback((status) => {
        let bgColor = 'bg-gray-200 text-gray-700';
        switch (status) {
            case '2':
                bgColor = 'bg-purple-100 text-purple-700';
                return (
                    <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>
                        Đã xác nhận
                    </span>
                );
            case '3':
                bgColor = 'bg-blue-100 text-blue-700';
                return (
                    <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>
                        Đang chuẩn bị
                    </span>
                );
            case '4':
                bgColor = 'bg-green-100 text-green-700';
                return (
                    <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>
                        Hoàn tất
                    </span>
                );
            default:
                bgColor = 'bg-gray-100 text-gray-700';
                return (
                    <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>
                        Chờ xác nhận
                    </span>
                );
        }
    }, []);

    // Đăng ký socket listeners
    useEffect(() => {
        if (!item || !item.id) return;

        registerSocketListeners({
            customer: { orderId: item.orderId }, // Giả định item có orderId, điều chỉnh nếu khác
            OrderDetailChanged: (data) => {
                if (data && typeof data === 'object' && data.orderId === item.orderId) {
                    switch (data.action) {
                        case 'updated':
                            if (data.item && data.item.id === item.id) {
                                // Cập nhật số lượng hoặc trạng thái từ server
                                toast.info('Chi tiết món đã được cập nhật!');
                            }
                            break;
                        case 'deleted':
                            if (data.itemId === item.id) {
                                toast.info('Món đã bị xóa khỏi đơn hàng!');
                                // Có thể gọi onDeleteItem từ cha để đồng bộ
                            }
                            break;
                        default:
                            break;
                    }
                }
            },
        });

        return () => {
            cleanupSocketListeners();
        };
    }, [item]);

    return (
        <div className="border-b border-gray-100 pb-3">
            <div
                className={`flex justify-between items-center py-2 cursor-pointer hover:bg-gray-50 transition-colors rounded-md px-2 ${isExpanded ? 'bg-gray-50' : ''}`}
                onClick={toggleExpand}
            >
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded bg-gray-200 mr-3 overflow-hidden">
                        {item.image ? (
                            <img
                                src={`${process.env.REACT_APP_API_URL}/${item.image}`}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentNode.innerHTML = `<div class="h-full w-full flex items-center justify-center text-gray-400"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M352 144c0-44.1 35.9-80 80-80s80 35.9 80 80-35.9 80-80 80-80-35.9-80-80zm128 237.8c0 11-9 20.2-20 20.2h-28c17.9-26.4 28-60.5 28-96 0-19.1-3.2-38.2-9.5-56.7C439.7 255.8 448 237.6 448 216.9c0-30.4-21.9-55.3-48-55.3s-48 24.9-48 55.3c0 11.7 3.2 22.8 8.4 32.4-19.9-5-41.1-7.4-63.4-7.4-0.5 0-1 0.1-1.6 0.1 0.7-5.3 1.6-10.7 1.6-16 0-44.1-35.9-80-80-80s-80 35.9-80 80c0 5.3 0.9 10.7 1.6 16-0.5 0-1-0.1-1.6-0.1-22.3 0-43.5 2.5-63.4 7.4 5.3-9.7 8.4-20.7 8.4-32.4 0-30.4-21.9-55.3-48-55.3s-48 24.9-48 55.3c0 20.7 8.3 38.9 21.5 52.4C3.2 218.6 0 237.7 0 256.9c0 35.5 10.1 69.6 28 96H0c-11 0-20 9.2-20 20.2-0.1 11.5 9.1 20.8 19.9 20.8h346c0.1 0.2 0.3 0.2 0.4 0.4 5.7 9.9 12.9 18.8 22.9 18.8h88c11 0 20-9.2 20-20.2V381.8h2.8zM240 71.9c22.1 0 40 17.9 40 40s-17.9 40-40 40-40-17.9-40-40 17.9-40 40-40zm-128 168c18 0 34.7-9 42.4-23.3 14.7-6 49.1-20.1 85.6-20.1s70.9 14.1 85.6 20.1c7.7 14.4 24.4 23.3 42.4 23.3 26.5 0 48-20.6 48-45.9s-21.5-45.9-48-45.9-48 20.6-48 45.9c0 4.9 0.8 9.5 2.1 13.9-20.3-9-46.4-17.9-82.1-17.9-35.7 0-61.9 8.9-82.1 17.9 1.3-4.4 2.1-9 2.1-13.9 0-25.2-21.5-45.9-48-45.9s-48 20.6-48 45.9 21.5 45.9 48 45.9z"></path></svg></div>`;
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
                            <span>
                                {item.quantity} x {formatCurrency(item.price)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="font-medium text-right">
                    {formatCurrency(item.price * item.quantity)}
                    {item.status && <p className="text-xs italic mt-1">{renderStatusBadge(item.status)}</p>}
                </div>
            </div>

            {isExpanded && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md mx-2 mb-1">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <button
                                onClick={handleDecreaseQuantity}
                                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                                    isLoading || item.quantity <= 1 || (item.status !== '1' && item.status !== '2')
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white'
                                }`}
                                disabled={isLoading || item.quantity <= 1 || (item.status !== '1' && item.status !== '2')}
                                title={item.quantity <= 1 ? 'Số lượng tối thiểu là 1' : ''}
                            >
                                <FaMinus size={12} />
                            </button>
                            <span className="mx-4 font-medium text-gray-700">{item.quantity}</span>
                            <button
                                onClick={handleIncreaseQuantity}
                                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                                    isLoading || (item.status !== '1' && item.status !== '2')
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white'
                                }`}
                                disabled={isLoading || (item.status !== '1' && item.status !== '2')}
                                title={
                                    item.quantity >= (item.maxQuantity || 100) ? 'Đã đạt số lượng tối đa' : ''
                                }
                            >
                                <FaPlus size={12} />
                            </button>
                        </div>

                        <button
                            onClick={handleDeleteItem}
                            className={`p-2 rounded-full transition-colors ${
                                isLoading || (item.status !== '1' && item.status !== '2')
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-500 hover:bg-red-50'
                            }`}
                            disabled={isLoading || (item.status !== '1' && item.status !== '2')}
                        >
                            <FaTrash size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
import { useState } from 'react';
import { FaArrowLeft, FaChevronDown, FaPlus, FaMinus, FaStore } from "react-icons/fa";

export default function CartPage() {
    const [editingCounter, setEditingCounter] = useState(null);
    const [expandedCounters, setExpandedCounters] = useState([1, 2]); // Initially expand all

    // Initial cart data
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            counter: 'Quầy A',
            items: [
                { id: 11, name: 'Lẩu thái nấm chay', price: 150000, quantity: 1, image: '/api/placeholder/400/400' },
                { id: 12, name: 'Lẩu thái nấm mặn', price: 150000, quantity: 1, image: '/api/placeholder/400/400' }
            ]
        },
        {
            id: 2,
            counter: 'Quầy B',
            items: [
                { id: 21, name: 'Lẩu thái nấm chay', price: 150000, quantity: 1, image: '/api/placeholder/400/400' }
            ]
        },
        {
            id: 3,
            counter: 'Quầy C',
            items: [
                { id: 21, name: 'Lẩu thái nấm chay', price: 150000, quantity: 1, image: '/api/placeholder/400/400' }
            ]
        },
        {
            id: 4,
            counter: 'Quầy D',
            items: [
                { id: 21, name: 'Lẩu thái nấm chay', price: 150000, quantity: 1, image: '/api/placeholder/400/400' }
            ]
        }
    ]);

    // Calculate total
    const totalAmount = cartItems.reduce((total, counter) => {
        return total + counter.items.reduce((counterTotal, item) => {
            return counterTotal + (item.price * item.quantity);
        }, 0);
    }, 0);

    // Toggle edit mode for a counter
    const toggleEdit = (counterId) => {
        if (editingCounter === counterId) {
            setEditingCounter(null);
        } else {
            setEditingCounter(counterId);
        }
    };

    // Toggle counter expansion
    const toggleCounter = (counterId) => {
        if (expandedCounters.includes(counterId)) {
            setExpandedCounters(expandedCounters.filter(id => id !== counterId));
        } else {
            setExpandedCounters([...expandedCounters, counterId]);
        }
    };

    // Adjust item quantity
    const adjustQuantity = (counterId, itemId, amount) => {
        setCartItems(cartItems.map(counter => {
            if (counter.id === counterId) {
                return {
                    ...counter,
                    items: counter.items.map(item => {
                        if (item.id === itemId) {
                            const newQuantity = Math.max(1, item.quantity + amount);
                            return { ...item, quantity: newQuantity };
                        }
                        return item;
                    })
                };
            }
            return counter;
        }));
    };

    // Remove item
    const removeItem = (counterId, itemId) => {
        setCartItems(cartItems.map(counter => {
            if (counter.id === counterId) {
                return {
                    ...counter,
                    items: counter.items.filter(item => item.id !== itemId)
                };
            }
            return counter;
        }).filter(counter => counter.items.length > 0));

        // Close edit mode after delete
        if (editingCounter === counterId) {
            setEditingCounter(null);
        }
    };

    // Format price
    const formatPrice = (price) => {
        return price.toLocaleString() + 'đ';
    };

    // Get total items in cart
    const getTotalItems = () => {
        return cartItems.reduce((total, counter) => {
            return total + counter.items.length;
        }, 0);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col w-full sm:max-w-[800px] mx-auto shadow-2xl">

            {/* Header */}
            <div className="bg-primary p-4 text-white flex items-center justify-center sticky top-0 z-20 relative">
                <FaArrowLeft size={24} className="absolute left-4" />
                <span className="font-medium text-center">Các món đang chọn</span>
            </div>



            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto pb-40"> {/* tăng padding-bottom để tránh footer che nội dung */}
                {cartItems.map(counter => (
                    <div key={counter.id} className="bg-white mb-3">
                        {/* Counter Header */}
                        <div
                            className="flex justify-between items-center p-3 border-b border-gray-100 cursor-pointer"
                            onClick={() => toggleCounter(counter.id)}
                        >
                            <div className="flex items-center">

                                <FaStore className="text-primary w-5 h-5 mr-2" />
                                <span className="font-medium">{counter.counter}</span>
                                <span className="ml-2 text-gray-500 text-sm">
                                    ({counter.items.length} món)
                                </span>
                            </div>
                            <div className="flex items-center">
                                <button
                                    className="text-primary mr-2 text-sm font-medium"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleEdit(counter.id);
                                    }}
                                >
                                    {editingCounter === counter.id ? 'Xong' : 'Sửa'}
                                </button>
                                <FaChevronDown
                                    size={18}
                                    className={`text-gray-500 transition-transform ${expandedCounters.includes(counter.id) ? 'transform rotate-180' : ''}`}
                                />
                            </div>
                        </div>

                        {/* Counter Items Wrapper với hiệu ứng trượt */}
                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedCounters.includes(counter.id) ? 'max-h-[2000px]' : 'max-h-0'
                                }`}
                        >
                            {counter.items.map(item => (
                                <div key={item.id} className="border-b border-gray-100 relative overflow-hidden">
                                    {/* Container for image and item details that slides together */}
                                    <div className={`flex p-3 transition-all duration-300 ${editingCounter === counter.id ? 'transform -translate-x-32' : ''}`}>
                                        {/* Item image */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden mr-3 bg-gray-100 flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>

                                        {/* Item details */}
                                        <div className="flex flex-col flex-1 justify-between">
                                            <div>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-primary font-medium mt-1">{formatPrice(item.price)}</div>
                                            </div>

                                            {/* Quantity controls */}
                                            <div className="flex items-center justify-end mt-1">
                                                <button
                                                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm"
                                                    onClick={() => adjustQuantity(counter.id, item.id, -1)}
                                                >
                                                    <FaMinus size={14} color="white" />
                                                </button>
                                                <span className="mx-3 font-medium">{item.quantity}</span>
                                                <button
                                                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm"
                                                    onClick={() => adjustQuantity(counter.id, item.id, 1)}
                                                >
                                                    <FaPlus size={14} color="white" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Extra buttons when editing - positioned absolutely */}
                                    <div className={`absolute right-0 top-0 bottom-0 flex h-full items-center w-32 transition-opacity ${editingCounter === counter.id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                        <button className="bg-yellow-500 text-white text-xs flex-1 flex items-center justify-center h-full">
                                            <span className="text-xs px-1">Sản phẩm tương tự</span>
                                        </button>
                                        <button
                                            className="bg-primary text-white text-xs flex-1 flex items-center justify-center h-full"
                                            onClick={() => removeItem(counter.id, item.id)}
                                        >
                                            <span>Xóa</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="bg-white p-4 shadow-md z-10 sticky bottom-0 w-full border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Tổng tiền</span>
                    <span className="text-primary font-medium">{formatPrice(totalAmount)}</span>
                </div>
                <button className="w-full bg-primary text-white py-3 rounded-lg font-medium">
                    Xác nhận gửi yêu cầu gọi món
                </button>
            </div>
        </div>

    );
}
import React from 'react';
import { FaArrowLeft, FaMinus, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CartDetails = ({ direction, cart, setCart, onUpdateQuantity }) => {
    const navigate = useNavigate();
    
    const groupedItems = cart.reduce((acc, item) => {
        const tableId = item.tableId || 'Không có bàn';
        if (!acc[tableId]) {
            acc[tableId] = {
                items: [],
                count: 0
            };
        }
        acc[tableId].items.push(item);
        acc[tableId].count += 1;
        return acc;
    }, {});

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleUpdateQuantity = (item, change) => {
        setCart(prevCart => {
            const newCart = [...prevCart];
            const index = newCart.findIndex(i => i.id === item.id);
            if (index !== -1) {
                newCart[index].quantity += change;
                if (newCart[index].quantity <= 0) {
                    newCart.splice(index, 1);
                }
            }
            return newCart;
        });
    };
    
    return (
        <div className="fixed inset-0 bg-white z-50">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="bg-primary text-white p-4 flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4">
                        <FaArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-semibold">Các món đang chọn</h1>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {Object.entries(groupedItems).map(([tableId, group]) => (
                        <div key={tableId} className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-primary">⌘</span>
                                    <h2 className="font-medium">{tableId}</h2>
                                </div>
                                <span className="text-gray-500">({group.count} món)</span>
                            </div>
                            {group.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 border-b">
                                    <img 
                                        src={`http://localhost:5000/${item.image}`}
                                        alt={item.pd_name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.pd_name}</h3>
                                        <p className="text-primary font-medium">{parseInt(item.price).toLocaleString()}đ</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => onUpdateQuantity(item, -1)}
                                            className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center"
                                        >
                                            <FaMinus className="text-white" />
                                        </button>
                                        <span className="w-6 text-center">{item.quantity}</span>
                                        <button 
                                            onClick={() => onUpdateQuantity(item, 1)}
                                            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                                        >
                                            <FaPlus className="text-white" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="border-t p-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-medium">Tổng tiền</span>
                        <span className="text-primary font-bold text-xl">
                            {totalPrice.toLocaleString()}đ
                        </span>
                    </div>
                    <button className="w-full bg-primary text-white py-3 rounded-full font-medium">
                        Xác nhận gửi yêu cầu gọi món
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartDetails;
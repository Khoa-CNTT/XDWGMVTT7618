import React, { useEffect, useState } from 'react'
import MenuItem from '../components/MenuItem'
import PageWrapper from '../components/PageWrapper';
import api from '../server/api';
import CartBar from '../components/Carbar';
import { FaArrowLeft } from 'react-icons/fa';
import { CategoryFilter } from '../components/CategoryFilter';
import { useNavigate } from 'react-router-dom';
import { removeFromCartDetail } from '../server/cartService';

export const Menu = ({ direction }) => {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [userId, setUserId] = useState(localStorage.getItem('userId'));
    //lấy dữ liệu từ BE
    useEffect(() => {
        const fetchData = async () => {
            try {
                const getProduct = await api.get('/s2d/product');
                setMenuItems(getProduct.data);

                const cartId = localStorage.getItem('cartId');
                if (cartId) {
                    const cartResponse = await api.get('/s2d/cartdetail');
                    const cartItems = cartResponse.data.filter(item =>
                        item.cart._id === cartId
                    );
                    setCart(cartItems);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);


    //nút back
    const navigate = useNavigate();
    //Hàm chuyển hướng đến trang menu
    const onNavigateToHome = () => {
        navigate('/home');
    };

    //Hàm lọc 
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Lọc món ăn theo loại và tên
    const filteredMenuItems = menuItems.filter(item =>
        (selectedCategory === 'all' || item.category === selectedCategory) &&
        typeof item.pd_name === 'string' &&
        item.pd_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    //Hàm tìm kiếm
    const handleSearch = (term) => {
        setSearchTerm(term.trim());
    };

    //Hàm thêm món vào giỏ hàng
    const addToCart = (item) => {
        setCart(prev => {
            const exist = prev.find(p => p._id === item._id);
            if (exist) {
                return prev.map(p => p._id === item._id ? { ...p, quantity: p.quantity + 1 } : p);
            } else {
                return [...prev, { ...item, quantity: 1 }];
            }
        });
    };

    //Hàm xóa món trong giỏ hàng
    const removeFromCart = async (item) => {
        try {
            await removeFromCartDetail(item._id);
            setCart(prevCart => {
                const updatedCart = prevCart.map(cartItem => {
                    if (cartItem.products._id === item._id) {
                        const newQuantity = cartItem.quantity - 1;
                        if (newQuantity <= 0) {
                            return null; // Will be filtered out
                        }
                        return {
                            ...cartItem,
                            quantity: newQuantity
                        };
                    }
                    return cartItem;
                }).filter(Boolean); // Remove null items

                return updatedCart;
            });
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    };

    //Hàm lấy số lượng món trong giỏ hàng
    const getItemQuantity = (itemId) => {
        const item = cart.find(cartItem => cartItem._id === itemId);
        return item ? item.quantity : 0;
    };

    // Update state khi cart thay đổi
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalPrice = cart.reduce((sum, item) => {
        const price = item.products?.price || 0;
        const quantity = item.quantity || 0;
        return sum + (price * quantity);
    }, 0);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/s2d/cart/getOrCreateCart`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                });

                if (res.ok) {
                    const cart = await res.json();
                    localStorage.setItem('cartId', cart._id);
                } else {
                    console.error('Lỗi khi lấy giỏ hàng');
                }
            } catch (err) {
                console.error('Lỗi mạng:', err.message);
            }
        };

        fetchCart();
    }, [userId]);  // Chạy lại khi userId thay đổi

    return (
        <PageWrapper direction={direction}>
            <div className='min-h-screen bg-gray-50 flex flex-col w-full sm:max-w-[800px] mx-auto shadow-2xl overflow-hidden'>
                <div className='flex flex-col'>
                    <div className="flex items-center p-4 gap-4 bg-primary">
                        <button
                            onClick={onNavigateToHome}
                            className="text-white hover:text-gray-800">
                            <FaArrowLeft size={20} />
                        </button>
                        <input
                            type="text"
                            placeholder="Bạn đang cần tìm món gì?"
                            className="flex-1 bg-gray-100 p-2 rounded-lg"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                </div>
                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}></CategoryFilter>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 pb-32">
                    {menuItems.length > 0 ? (
                        filteredMenuItems.map((item) => (
                            <MenuItem
                                key={item._id}
                                item={item}
                                onAddToCart={addToCart}
                                onRemoveFromCart={removeFromCart}
                                quantity={getItemQuantity(item._id)}
                            />
                        ))
                    ) : (
                        <p>Loading menu items...</p>
                    )}
                </div>
                {cart.length > 0 && (
                    <CartBar
                        cart={cart}
                        totalItems={totalItems}
                        totalPrice={totalPrice}
                    />
                )}
            </div>
        </PageWrapper>
    )
}
export default Menu

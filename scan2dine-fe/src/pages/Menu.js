import React, { useEffect, useState } from 'react'
import MenuItem from '../components/MenuItem'
import PageWrapper from '../components/PageWrapper';
import api from '../server/api';
import CartBar from '../components/Carbar';
import { FaArrowLeft } from 'react-icons/fa';
import { CategoryFilter } from '../components/CategoryFilter';
import { useNavigate } from 'react-router-dom';


export const Menu = ({ direction }) => {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [menuItems, setMenuItems] = useState([]);


    //lấy dữ liệu từ BE
    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const getProduct = await api.get('/s2d/product');
                setMenuItems(getProduct.data);
            } catch (error) {
                console.error('Lỗi khi tải danh mục sản phẩm:', error);
            }
        };
        fetchMenuItems();
    }, []);

    //nút back
    const navigate = useNavigate();
    //Hàm chuyển hướng đến trang menu
    const onNavigateToHome = () => {
        navigate('/');
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
    const removeFromCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem._id === item._id);
            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(cartItem =>
                    cartItem._id === item._id
                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                        : cartItem
                );
            }
            return prevCart.filter(cartItem => cartItem._id !== item._id);
        });
    };
    //Hàm lấy số lượng món trong giỏ hàng
    const getItemQuantity = (itemId) => {
        const item = cart.find(cartItem => cartItem._id === itemId);
        return item ? item.quantity : 0;
      };
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);



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
                    <CartBar cart={cart} totalItems={totalItems} totalPrice={totalPrice} />
                )}
            </div>
        </PageWrapper>
    )
}
export default Menu

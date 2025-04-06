import React, { useState } from 'react'
import Header from '../components/Header'
import MenuItem from '../components/MenuItem'
import PageWrapper from '../components/PageWrapper';

export const Menu = ({ direction }) => {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const menuItems = [
        { id: 1, name: 'Bánh bao trứng sữa', price: 39000, image: '/img/c1.png' },
        { id: 2, name: 'Bánh bao kim sa', price: 39000, image: '/img/c2.png' },
        { id: 3, name: 'Bánh bao xá xíu', price: 45000, image: '/img/c3.png' },
        { id: 4, name: 'Bánh bao phô mai xá xíu', price: 49000, image: '/img/c4.png' },
        { id: 5, name: 'Há cảo tôm thịt', price: 55000, image: '/img/r1.png' },
        { id: 6, name: 'Há cảo sò điệp', price: 55000, image: '/img/c7.png' },
        { id: 7, name: 'Xíu mai thanh cua', price: 55000, image: '/img/cu1.png' },
        { id: 8, name: 'Chân gà hấp táu xi', price: 55000, image: '/img/cu2.png' },
        { id: 9, name: 'Bánh lá hẹ chiên', price: 55000, image: '/img/cu3.png' },
        { id: 10, name: 'Tầu hủ ky tôm chiên', price: 55000, image: '/img/cu6.png' },
        { id: 11, name: 'Hoành thánh sốt tương', price: 50000, image: '/img/cu5.png' },
        { id: 12, name: 'Chân gà trộn cay Tứ Xuyên', price: 75000, image: '/img/fi1.png' },
    ];

    //Hàm lọc 
    const filteredMenuItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    //Hàm tìm kiếm
    const handleSearch = (term) => {
        setSearchTerm(term.trim());
    };
    //Hàm thêm vào giỏ hàng
    const addToCart = (item, setQuantity = false) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                if (setQuantity) {

                    return prevCart.map(cartItem =>
                        cartItem.id === item.id
                            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                            : cartItem
                    );
                } else {

                    return prevCart.map(cartItem =>
                        cartItem.id === item.id
                            ? { ...cartItem, quantity: cartItem.quantity + 1 }
                            : cartItem
                    );
                }
            }
            return [...prevCart, { ...item, quantity: item.quantity || 1 }];
        });
    };
    //Hàm xóa khỏi giỏ hàng
    const removeFromCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                        : cartItem
                );
            }
            return prevCart.filter(cartItem => cartItem.id !== item.id);
        });
    };
    //Hàm thay đổi số lượng
    const getItemQuantity = (itemId) => {
        const item = cart.find(cartItem => cartItem.id === itemId);
        return item ? item.quantity : 0;
    };

    return (
        <PageWrapper direction={direction}>
            <div className='min-h-screen bg-gray-50 flex flex-col w-full sm:max-w-[800px] mx-auto shadow-2xl overflow-hidden'>
                <Header
                    onSearch={handleSearch} />
                <div className="grid grid-cols-2 gap-3 p-4">
                    {filteredMenuItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            onAddToCart={addToCart}
                            onRemoveFromCart={removeFromCart}
                            quantity={getItemQuantity(item.id)}
                        />
                    ))}
                </div>
            </div>
        </PageWrapper>
    )
}
export default Menu

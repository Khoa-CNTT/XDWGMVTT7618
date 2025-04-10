import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import MenuItem from '../components/MenuItem'
import PageWrapper from '../components/PageWrapper';
import api from '../server/api';

export const Menu = ({ direction }) => {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await api.get('/s2d/product');
                setMenuItems(response.data);
            } catch (error) {
                console.error('Error fetching menu items:', error);
            }
        };

        fetchMenuItems();
    }, []);
    //Hàm lọc 
    const filteredMenuItems = menuItems.filter(item =>
        typeof item.pd_name === 'string' &&
        typeof searchTerm === 'string' &&
        item.pd_name.toLowerCase().includes(searchTerm.toLowerCase())
    );      

    //Hàm tìm kiếm
    const handleSearch = (term) => {
        setSearchTerm(term.trim());
    };
    //Hàm thêm vào giỏ hàng
    const addToCart = (item, setQuantity = false) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem._id === item._id);
            // ... rest of the function ...
        });
    };

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

    const getItemQuantity = (itemId) => {
        const item = cart.find(cartItem => cartItem._id === itemId);
        return item ? item.quantity : 0;
    };

    return (
        <PageWrapper direction={direction}>
            <div className='min-h-screen bg-gray-50 flex flex-col w-full sm:max-w-[800px] mx-auto shadow-2xl overflow-hidden'>
                <Header onSearch={handleSearch} />
                <div className="grid grid-cols-2 gap-4 p-4">
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
            </div>
        </PageWrapper>
    )
}
export default Menu

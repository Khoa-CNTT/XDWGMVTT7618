// Menu.jsx
import React, { useEffect, useState } from 'react';
import MenuItem from '../components/MenuItem';
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
    const [totalItems, setTotalItems] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const navigate = useNavigate();

    //Lấy dữ liệu của người dùng hiện tại
    const customer = JSON.parse(sessionStorage.getItem("customer"));

    //Lấy ID cart của người dùng hiện tại
    const cartId = sessionStorage.getItem(customer.cart);

    //Lấy dữ liệu cart
    const fetchCart = async () => {
        try {

            const response = await api.get(`/s2d/cart/${customer.cart}`);
            console.log(response);
            // const cartDetails = response.data.filter(item => item.cart._id === localStorage.getItem('cartId'));
            // setCart(cartDetails);

            // const total = cartDetails.reduce((acc, item) => ({
            //     items: acc.items + item.quantity,
            //     price: acc.price + (item.products.price * item.quantity)
            // }), { items: 0, price: 0 });

            // setTotalItems(total.items);
            // setTotalPrice(total.price);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    //lấy dữ liệu menu
    const fetchData = async () => {
        try {
            const getProduct = await api.get('/s2d/product');
            setMenuItems(getProduct.data);
            // await fetchCart();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    //Load dữ liệu
    useEffect(() => {
        fetchData();
        fetchCart();
    }, []);

    //Tìm kiếm món ăn
    const filteredMenuItems = menuItems.filter(item =>
        (selectedCategory === 'all' || item.category === selectedCategory) &&
        typeof item.pd_name === 'string' &&
        item.pd_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    //Chức năng thêm vào giỏ hàng
    const addToCart = async (item) => {
        try {
            const res = await api.post(`/s2d/cartdetail`, {
                cart: customer.cart,
                products: item._id,
                quantity: 1 // chỉnh lại khi thêm = menu chi tiết

            });
            await fetchCart();
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            alert("Thêm thất bại");
        }
    };

    //Xóa khỏi giỏ hàng
    const removeFromCart = async (item) => {
        try {
            const res = api.delete(`/s2d/cartdetail`, {
                cart: customer.cart,
                products: item._id,
                quantity: 1
            });
            await fetchCart();
        } catch (error) {

        }
    };


    const getItemQuantity = (itemId) => {
        const cartItem = cart.find(item => item.products._id === itemId);
        return cartItem ? cartItem.quantity : 0;
    };



    return (
        <PageWrapper direction={direction}>
            <div className='min-h-screen bg-gray-50 flex flex-col w-full sm:max-w-[800px] mx-auto shadow-2xl overflow-hidden'>
                <div className='flex flex-col'>
                    <div className="flex items-center p-4 gap-4 bg-primary">
                        <button
                            onClick={() => navigate('/home')}
                            className="text-white hover:text-gray-800">
                            <FaArrowLeft size={20} />
                        </button>
                        <input
                            type="text"
                            placeholder="Bạn đang cần tìm món gì?"
                            className="flex-1 bg-gray-100 p-2 rounded-lg"
                            onChange={(e) => setSearchTerm(e.target.value.trim())}
                        />
                    </div>
                </div>

                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                />

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
    );
};

export default Menu;

import React, { useState, useRef, useEffect } from 'react';
import ProductDetail from './ProductDetail';
import FlyItem from './FlyItem';
import api from '../server/api';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { addToCartDetail, removeFromCartDetail } from '../server/cartService';

export const MenuItem = ({ item, onRemoveFromCart, onAddToCart }) => {
  const [showDetail, setShowDetail] = useState(false);
  const buttonRef = useRef(null);
  const [flyingItems, setFlyingItems] = useState([]);
  const [localQuantity, setLocalQuantity] = useState(0);

  useEffect(() => {
    const fetchCartQuantity = async () => {
      try {
        const cartId = localStorage.getItem('cartId');
        if (cartId) {
          const response = await api.get('/s2d/cartdetail');
          const cartItem = response.data.find(
            detail => detail.products._id === item._id && detail.cart._id === cartId
          );
          if (cartItem) {
            setLocalQuantity(cartItem.quantity);
          }
        }
      } catch (error) {
        console.error('Error fetching cart quantity:', error);
      }
    };
    fetchCartQuantity();
  }, [item._id]);

  const createFlyingEffect = () => {
    const button = buttonRef.current;
    const cartIcon = document.getElementById('cart-icon');

    console.log('Button:', button);
    console.log('Cart Icon:', cartIcon);

    if (button && cartIcon) {
      const buttonRect = button.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      console.log('Button position:', buttonRect);
      console.log('Cart position:', cartRect);

      const startPosition = {
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2,
      };

      const endPosition = {
        x: cartRect.left + cartRect.width / 2,
        y: cartRect.top + cartRect.height / 2,
      };

      const id = Date.now();
      setFlyingItems((prev) => [
        ...prev,
        {
          id,
          imageUrl: `${process.env.REACT_APP_API_URL}${item.image}`,
          startPosition,
          endPosition,
        },
      ]);
    } else {
      console.error('Button or cart icon not found');
    }
  };

  const handleRemoveFlyingItem = (id) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await addToCartDetail(item._id);
      setLocalQuantity(prev => prev + 1);
      createFlyingEffect();
      onAddToCart(item);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleRemoveFromCart = async (e) => {
    e.stopPropagation();
    try {
      await removeFromCartDetail(item._id);
      setLocalQuantity(prev => Math.max(0, prev - 1));
      onRemoveFromCart(item);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  return (
    <>
      <div className="bg-white p-2 relative mt-2 transition duration-300 hover:shadow-lg hover:scale-[1.02] rounded-lg">
        <div className="cursor-pointer p-3" onClick={() => setShowDetail(true)}>
          <img
            src={`${process.env.REACT_APP_API_URL}${item.image}`}
            alt={item.pd_name}
            className="w-[160px] h-[160px] object-cover mx-auto rounded-md"
          />
          <div className="mt-2 flex flex-col justify-center h-12">
            <h3 className="font-medium text-sm capitalize line-clamp-2 leading-snug">
              {item.pd_name}
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 mt-auto">
          <div className="px-3 py-1 rounded-full mr-3 flex-shrink-0">
            <p className="text-primary fnt-medium whitespace-nowrap">
              {parseInt(item.price).toLocaleString()}đ
            </p>
          </div>
          <div className="flex items-center gap-1">
            {localQuantity > 0 && (
              <>
                <button
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-gray-400 flex items-center justify-center"
                  onClick={handleRemoveFromCart}
                >
                  <FaMinus className="text-white w-[60%] h-[60%]" />
                </button>
                <span className="w-3 text-center text-black font-semibold">{localQuantity}</span>
              </>
            )}
            <button
              ref={buttonRef}
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-primary flex items-center justify-center"
              onClick={handleAddToCart}
            >
              <FaPlus className="text-white w-[60%] h-[60%]" />
            </button>
          </div>
        </div>
      </div>

      {flyingItems.map((item) => (
        <FlyItem
          key={item.id}
          id={item.id}
          imageUrl={item.imageUrl}
          startPosition={item.startPosition}
          endPosition={item.endPosition}
          onAnimationEnd={handleRemoveFlyingItem}
        />
      ))}

      {showDetail && (
        <div className="fixed inset-1 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
          <ProductDetail product={item} onClose={() => setShowDetail(false)} onAddToCart={onAddToCart} />
        </div>
      )}
    </>
  );
};

export default MenuItem;
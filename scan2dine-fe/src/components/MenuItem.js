import React, { useState, useRef } from 'react';
import ProductDetail from './ProductDetail';
import FlyItem from './FlyItem';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { useContext } from 'react';

export const MenuItem = ({ item, quantity, onRemoveFromCart, onAddToCart }) => {
  const [showDetail, setShowDetail] = useState(false);
  const buttonRef = useRef(null);
  const [flyingItems, setFlyingItems] = useState([]);

  // Function để tạo hiệu ứng bay
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
        y: buttonRect.top + buttonRect.height / 2
      };

      const endPosition = {
        x: cartRect.left + cartRect.width / 2,
        y: cartRect.top + cartRect.height / 2
      };

      console.log('Start:', startPosition);
      console.log('End:', endPosition);

      const id = Date.now();
      setFlyingItems((prev) => [
        ...prev,
        {
          id,
          imageUrl: 'http://localhost:5000/' + item.image,
          startPosition,
          endPosition,
        },
      ]);
    } else {
      console.error('Button or cart icon not found');
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    createFlyingEffect();
    onAddToCart(item);
  };

  const handleRemoveFlyingItem = (id) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
  };


  return (
    <>
      <div className="bg-white p-2 relative mt-2 transition duration-300 hover:shadow-lg hover:scale-[1.02] rounded-lg">
        <div className="cursor-pointer p-3" onClick={() => setShowDetail(true)}>
        <img
            src={'http://localhost:5000/' + item.image}
            alt={item.pd_name}
            className="w-[160px] h-[160px] object-cover mx-auto rounded-md "
          />
          <div className="mt-2 flex flex-col justify-center h-12">
            <h3 className="font-medium text-sm capitalize line-clamp-2 leading-snug">
              {item.pd_name}
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 mt-auto">
          <div className=" px-3 py-1 rounded-full mr-3 flex-shrink-0">
            <p className="text-primary fnt-medium whitespace-nowrap">{parseInt(item.price).toLocaleString()}đ</p>
          </div>
          <div className="flex items-center gap-1">
            {quantity > 0 && (
              <>
                <button
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-gray-400 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromCart(item);
                  }}
                >
                  <FaMinus className="text-white w-[60%] h-[60%]" />
                </button>
                <span className="w-3 text-center text-black font-semibold">{quantity}</span>
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
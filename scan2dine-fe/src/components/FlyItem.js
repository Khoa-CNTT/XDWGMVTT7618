import { useRef, useEffect } from 'react';

export const FlyItem = ({ id, imageUrl, startPosition, endPosition, onAnimationEnd }) => {
  const itemRef = useRef(null);

  useEffect(() => {
    const itemElement = itemRef.current;
    if (!itemElement) return;

   // Đặt vị trí ban đầu
    itemElement.style.position = 'fixed';
    itemElement.style.top = `${startPosition.y}px`;
    itemElement.style.left = `${startPosition.x}px`;
    itemElement.style.transform = 'translate(-50%, -50%)'; // Căn giữa hình ảnh

    // Tính toán khoảng cách di chuyển
    const deltaX = endPosition.x - startPosition.x;
    const deltaY = endPosition.y - startPosition.y;

    // Tạo keyframes cho hiệu ứng lăn
    const keyframes = `
      @keyframes rollAnimation-${id} {
        0% {
          transform: translate(0, 0) rotate(0deg) scale(1.2);
          opacity: 1;
        }
        100% {
          transform: translate(${deltaX}px, ${deltaY}px) rotate(720deg) scale(0.3);
          opacity: 0;
        }
      }
    `;

    // Thêm keyframes vào document
    const styleSheet = document.createElement('style');
    styleSheet.innerText = keyframes;
    document.head.appendChild(styleSheet);

    // Áp dụng animation
    itemElement.style.animation = `rollAnimation-${id} 800ms linear forwards`;
    // Xóa sau khi animation hoàn tất
    const timeout = setTimeout(() => {
      onAnimationEnd(id);
      document.head.removeChild(styleSheet);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, [id, startPosition, endPosition, onAnimationEnd]);

  return (
    <img
        ref={itemRef}
        src={imageUrl}
        alt="Product"
        className="fixed z-50 w-36 h-36 object-cover rounded-full shadow-lg pointer-events-none"
        style={{
          willChange: 'transform, opacity',
        }}
      />
  );
};

export default FlyItem;
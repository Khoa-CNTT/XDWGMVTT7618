import { useEffect } from 'react';

const Alert = ({ type = 'success', message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // tự ẩn sau 3 giây

        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: 'text-green-800 bg-green-100',
        error: 'text-red-800 bg-red-100',
    };

    return (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-md ${styles[type]}`} role="alert">
            <span className="font-medium">{type === 'success' ? 'Thành công!' : 'Lỗi!'}</span> {message}
        </div>
    );
};

export default Alert;

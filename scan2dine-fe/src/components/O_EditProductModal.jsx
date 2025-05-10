import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';

const O_EditProductModal = ({ isOpen, onClose, product, categories, onSave }) => {
    const [formData, setFormData] = useState({
        pd_name: '',
        price: '',
        description: '',
        category: '',
        image: null,
        imagePreview: null
    });
    // Thêm state để theo dõi lỗi hình ảnh và trạng thái submit
    const [imageError, setImageError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                pd_name: !product.pd_name || product.pd_name === 'undefined' ? '' : product.pd_name,
                price: !product.price || product.price === 'undefined' ? '' : product.price,
                description: !product.description || product.description === 'undefined' ? '' : product.description,
                category:
                    typeof product.category === 'object'
                        ? (product.category?._id ?? '')
                        : (!product.category || product.category === 'undefined' ? '' : product.category),
                image: null,
                imagePreview: product.image && product.image !== 'undefined'
                    ? `${process.env.REACT_APP_API_URL}${product.image}`
                    : null,
            });
            // Reset các state khi product thay đổi
            setImageError('');
            setIsSubmitted(false);
        }
    }, [product]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                image: file,
                imagePreview: URL.createObjectURL(file)
            });
            setImageError(''); // Xóa thông báo lỗi khi đã chọn hình
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true); // Đánh dấu form đã được submit

        // Kiểm tra dữ liệu trước khi gửi
        if (!formData.pd_name || !formData.price || !formData.category) {
            alert("Vui lòng điền đầy đủ tên món, giá và danh mục.");
            return;
        }
        
        // Kiểm tra hình ảnh - nếu không có hình ảnh mới và không có hình ảnh cũ
        if (!formData.image && !formData.imagePreview) {
            setImageError("Vui lòng chọn hình ảnh cho món ăn");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('pd_name', formData.pd_name || '');
        formDataToSend.append('price', formData.price || '');
        formDataToSend.append('description', formData.description || '');
        formDataToSend.append('category', formData.category || '');

        // Chỉ thêm ảnh nếu người dùng chọn ảnh mới
        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }

        if (product?._id) {
            onSave(product._id, formDataToSend);
        } else {
            console.error("❌ Không tìm thấy ID sản phẩm để cập nhật.");
        }
    };

    // Hàm xử lý đóng modal và reset trạng thái
    const handleClose = () => {
        setImageError('');
        setIsSubmitted(false);
        onClose();
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa món ăn</h2>
                        <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                            <FaTimes className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên món ăn
                                        <span className="text-red-500"> (*)</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.pd_name}
                                        onChange={(e) => setFormData({ ...formData, pd_name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giá (VNĐ)
                                        <span className="text-red-500"> (*)</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.price ?? ''}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Danh mục
                                        <span className="text-red-500"> (*)</span>
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>
                                                {category.cate_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hình ảnh món ăn
                                        <span className="text-red-500"> (*)</span>
                                    </label>
                                    <div className={`border-2 border-dashed rounded-lg p-4 text-center ${isSubmitted && !formData.imagePreview ? 'border-red-500' : ''}`}>
                                        {formData.imagePreview ? (
                                            <div className="relative">
                                                <div className="h-48 w-48 mx-auto overflow-hidden flex items-center justify-center">
                                                    <img
                                                        src={formData.imagePreview}
                                                        alt="Preview"
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, image: null, imagePreview: null });
                                                        if (isSubmitted) {
                                                            setImageError('Vui lòng chọn hình ảnh cho món ăn');
                                                        }
                                                    }}
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <FaTimes className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer">
                                                <div className="flex flex-col items-center h-48 w-48 mx-auto justify-center border border-dashed border-gray-300 rounded-lg">
                                                    <FaUpload className="w-12 h-12 text-gray-400" />
                                                    <span className="mt-2 text-sm text-gray-500">Click để thay đổi ảnh</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    {isSubmitted && imageError && (
                                        <p className="text-red-500 text-sm mt-1">{imageError}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mô tả
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        rows="4"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <div className="text-sm text-gray-500">
                                <span className="text-red-500">(*)</span> Bắt buộc
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-red-600"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default O_EditProductModal;
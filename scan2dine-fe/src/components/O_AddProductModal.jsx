import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';

const O_AddProductModal = ({ isOpen, onClose, categories, onSave }) => {
    const initialFormState = {
        pd_name: '',
        price: '',
        description: '',
        category: '',
        image: null,
        imagePreview: null,
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // Đặt category mặc định khi categories được truyền vào
        if (categories && categories.length > 0 && !formData.category) {
            setFormData((prev) => ({ ...prev, category: categories[0]._id }));
        }
    }, [categories]);

    const validate = () => {
        const newErrors = {};
        if (!formData.pd_name.trim()) newErrors.pd_name = 'Vui lòng nhập Tên món ăn';
        if (!formData.price.trim()) newErrors.price = 'Vui lòng nhập Giá';
        if (!formData.category) newErrors.category = 'Vui lòng chọn Danh mục';
        if (!formData.image) newErrors.image = 'Vui lòng chọn hình ảnh';
        return newErrors;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                image: file,
                imagePreview: URL.createObjectURL(file),
            });
            setErrors((prev) => ({ ...prev, image: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);

        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setLoading(true);

        const form = new FormData();
        form.append('pd_name', formData.pd_name);
        form.append('price', formData.price);
        form.append('description', formData.description);
        form.append('category', formData.category);
        form.append('image', formData.image);

        onSave(form);

        setSuccessMessage('Thêm thành công!');
        setFormData(initialFormState);
        setTimeout(() => {
            setSuccessMessage('');
            setLoading(false);
        }, 2000);
    };

    const handleClose = () => {
        setFormData(initialFormState);
        setErrors({});
        setIsSubmitted(false);
        setSuccessMessage('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Thêm món mới</h2>
                        <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                            <FaTimes className="w-6 h-6" />
                        </button>
                    </div>

                    {successMessage && (
                        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-300">
                            <div className="bg-green-500 text-white px-6 py-3 rounded shadow-lg font-semibold min-w-[220px] text-center">
                                {successMessage}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên món ăn <span className="text-primary"> (*)</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={formData.pd_name}
                                        onChange={(e) => setFormData({ ...formData, pd_name: e.target.value })}
                                    />
                                    {isSubmitted && errors.pd_name && (
                                        <p className="text-primary text-sm mt-1">{errors.pd_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giá (VNĐ) <span className="text-primary"> (*)</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                    {isSubmitted && errors.price && (
                                        <p className="text-primary text-sm mt-1">{errors.price}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Danh mục <span className="text-primary"> (*)</span>
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map((category) => (
                                            <option key={category._id} value={category._id}>
                                                {category.cate_name}
                                            </option>
                                        ))}
                                    </select>
                                    {isSubmitted && errors.category && (
                                        <p className="text-primary text-sm mt-1">{errors.category}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hình ảnh món ăn <span className="text-primary"> (*)</span>
                                    </label>
                                    <div className={`border-2 border-dashed rounded-lg p-4 text-center ${isSubmitted && errors.image ? 'border-red-500' : ''}`}>
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
                                                    onClick={() => setFormData({ ...formData, image: null, imagePreview: null })}
                                                    className="absolute top-0 right-0 bg-primary text-white rounded-full p-1"
                                                >
                                                    <FaTimes className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer">
                                                <div className="flex flex-col items-center h-48 w-48 mx-auto justify-center border border-dashed border-gray-300 rounded-lg">
                                                    <FaUpload className="w-12 h-12 text-gray-400" />
                                                    <span className="mt-2 text-sm text-gray-500">Click để tải ảnh lên</span>
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
                                    {isSubmitted && errors.image && (
                                        <p className="text-primary text-sm mt-1">{errors.image}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mô tả
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-2 border rounded-lg"
                                        rows="4"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <div className="text-sm text-gray-500">
                                <span className="text-primary">(*)</span> Bắt buộc
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
                                    className={`px-6 py-2 bg-primary text-white rounded-lg hover:bg-red-600 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Đang thêm...' : 'Thêm'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default O_AddProductModal;

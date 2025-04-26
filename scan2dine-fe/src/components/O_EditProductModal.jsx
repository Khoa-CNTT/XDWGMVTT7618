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

    useEffect(() => {
        if (product) {
            setFormData({
                pd_name: product.pd_name,
                price: product.price,
                description: product.description,
                category: product.category,
                imagePreview: `${process.env.REACT_APP_API_URL}${product.image}`
            });
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
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Create FormData object to handle file upload
        const formDataToSend = new FormData();
        formDataToSend.append('pd_name', formData.pd_name);
        formDataToSend.append('price', formData.price);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('category', formData.category);
        
        // Only append image if a new one was selected
        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }
        
        onSave(product._id, formDataToSend);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa món ăn</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <FaTimes className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên món ăn
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.pd_name}
                                        onChange={(e) => setFormData({...formData, pd_name: e.target.value})}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giá (VNĐ)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Danh mục
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
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
                                    </label>
                                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                        {formData.imagePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={formData.imagePreview}
                                                    alt="Preview"
                                                    className="max-h-48 mx-auto rounded"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({...formData, image: null, imagePreview: null})}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <FaTimes className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer">
                                                <div className="flex flex-col items-center">
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
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mô tả
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        rows="4"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
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
                    </form>
                </div>
            </div>
        </div>
    );
};

export default O_EditProductModal;
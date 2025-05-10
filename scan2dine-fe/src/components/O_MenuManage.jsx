import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import api from '../server/api';
import O_AddProductModal from './O_AddProductModal';
import O_EditProductModal from './O_EditProductModal';
import { registerSocketListeners, cleanupSocketListeners } from '../services/socketListeners';

const O_MenuManage = ({ stallId }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceSort, setPriceSort] = useState('none');
    const [foodstalls, setFoodstalls] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch products with debounce
    const fetchProducts = useCallback(
        debounce(async () => {
            try {
                const response = await api.get('/s2d/product');
                setProducts(response.data || []);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Không thể tải danh sách sản phẩm');
                toast.error('Không thể tải danh sách sản phẩm');
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get('/s2d/category');
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Không thể tải danh mục');
        }
    }, []);

    // Fetch foodstalls
    const fetchFoodstalls = useCallback(async () => {
        try {
            const response = await api.get('/s2d/foodstall');
            setFoodstalls(response.data || []);
        } catch (error) {
            console.error('Error fetching foodstalls:', error);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        localStorage.setItem('ownerCurrentView', 'menu');
        setLoading(true);
        Promise.all([fetchProducts(), fetchCategories(), fetchFoodstalls()]).finally(() => setLoading(false));
    }, [fetchProducts, fetchCategories, fetchFoodstalls]);

    // Socket listeners
    useEffect(() => {
        registerSocketListeners({
            customer: { stallId },
            ProductAdded: () => {
                fetchProducts();
                toast.info('Đã thêm sản phẩm mới, danh sách đã được cập nhật!');
            },
            ProductUpdated: () => {
                fetchProducts();
                toast.info('Đã cập nhật sản phẩm, danh sách đã được cập nhật!');
            },
            ProductDeleted: () => {
                fetchProducts();
                toast.info('Đã xóa sản phẩm, danh sách đã được cập nhật!');
            },
            CategoryAdded: () => {
                fetchCategories();
                toast.info('Đã thêm danh mục mới!');
            },
            CategoryUpdated: () => {
                fetchCategories();
                toast.info('Đã cập nhật danh mục!');
            },
            CategoryDeleted: () => {
                fetchCategories();
                toast.info('Đã xóa danh mục!');
            },
        });

        return () => {
            cleanupSocketListeners();
        };
    }, [stallId, fetchProducts, fetchCategories]);

    // Handle add product
    const handleAddProduct = useCallback(async (formData) => {
        try {
            const form = new FormData();
            form.append('pd_name', formData.pd_name);
            form.append('price', formData.price);
            form.append('description', formData.description);
            form.append('category', formData.category);
            form.append('stall_id', stallId);

            if (formData.image instanceof File) {
                form.append('image', formData.image);
            }

            setLoading(true);
            const response = await api.post('/s2d/product', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.status === 200) {
                await fetchProducts();
                setIsAddModalOpen(false);
                toast.success('Thêm món ăn thành công');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error(error.response?.data?.message || 'Không thể thêm món ăn');
        } finally {
            setLoading(false);
        }
    }, [stallId, fetchProducts]);

    // Handle edit product
    const handleEditProduct = useCallback(async (productId, formData) => {
        try {
            setLoading(true);
            const response = await api.post(`/s2d/product/${productId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.status === 200) {
                await fetchProducts();
                setIsEditModalOpen(false);
                setSelectedProduct(null);
                toast.success('Cập nhật món ăn thành công');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error(error.response?.data?.message || 'Không thể cập nhật món ăn');
        } finally {
            setLoading(false);
        }
    }, [fetchProducts]);

    // Handle delete product
    const handleDeleteProduct = useCallback(async (productId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
            try {
                setLoading(true);
                await api.delete(`/s2d/product/${productId}`);
                await fetchProducts();
                toast.success('Xóa món ăn thành công');
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Không thể xóa món ăn');
            } finally {
                setLoading(false);
            }
        }
    }, [fetchProducts]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const productStallId =
                typeof product.stall_id === 'object' && product.stall_id !== null
                    ? product.stall_id._id
                    : product.stall_id;
            const productCategoryId =
                typeof product.category === 'object' && product.category !== null
                    ? product.category._id
                    : product.category;

            const matchesStall = productStallId === stallId;
            const matchesSearch = product.pd_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || productCategoryId === selectedCategory;
            return matchesStall && matchesSearch && matchesCategory;
        });
    }, [products, stallId, searchTerm, selectedCategory]);

    const sortedProducts = useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            if (priceSort === 'asc') return parseFloat(a.price) - parseFloat(b.price);
            if (priceSort === 'desc') return parseFloat(b.price) - parseFloat(a.price);
            return 0;
        });
    }, [filteredProducts, priceSort]);

    return (
        <div className="flex-1 bg-white flex flex-col">
            <main className="flex-1 p-6">
                <h2 className="text-3xl font-bold text-primary text-center mb-8">DANH SÁCH MÓN ĂN</h2>

                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-4 flex-1">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm món ăn..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-primary"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            </div>

                            <select
                                className="px-4 py-2 rounded-lg border focus:outline-none focus:border-primary"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">Tất cả danh mục</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.cate_name}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="px-4 py-2 rounded-lg border focus:outline-none focus:border-primary"
                                value={priceSort}
                                onChange={(e) => setPriceSort(e.target.value)}
                            >
                                <option value="none">Sắp xếp theo giá</option>
                                <option value="asc">Giá tăng dần</option>
                                <option value="desc">Giá giảm dần</option>
                            </select>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-600 disabled:opacity-50"
                            disabled={loading}
                        >
                            <FaPlus />
                            <span>Thêm món mới</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="text-center p-6 text-gray-500 animate-pulse">Đang tải...</div>
                    ) : error ? (
                        <div className="text-center p-6 text-red-500">{error}</div>
                    ) : sortedProducts.length === 0 ? (
                        <div className="text-center p-6 text-gray-500">Không có sản phẩm nào.</div>
                    ) : (
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        STT
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Ảnh món
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tên món ăn
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Giá
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Mô tả
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Danh mục
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sortedProducts.map((product, index) => {
                                    const category = categories.find((c) => c._id === product.category);

                                    return (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <img
                                                    src={`${process.env.REACT_APP_API_URL}/${product.image}`}
                                                    alt={product.pd_name}
                                                    className="h-16 w-16 object-cover rounded"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentNode.innerHTML = `<div class="h-16 w-16 flex items-center justify-center text-gray-400"><FaUtensils /></div>`;
                                                    }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {product.pd_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {parseInt(product.price).toLocaleString()}đ
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {product.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {category?.cate_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors disabled:opacity-50"
                                                        disabled={loading}
                                                    >
                                                        <FaEdit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                        className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                                                        disabled={loading}
                                                    >
                                                        <FaTrash className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <O_AddProductModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    categories={categories}
                    onSave={handleAddProduct}
                    loading={loading}
                />

                <O_EditProductModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedProduct(null);
                    }}
                    product={selectedProduct}
                    categories={categories}
                    onSave={handleEditProduct}
                    loading={loading}
                />
            </main>
        </div>
    );
};

export default O_MenuManage;
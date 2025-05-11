import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../server/api';
import O_AddProductModal from './O_AddProductModal';
import O_EditProductModal from './O_EditProductModal';
import { toast } from 'react-toastify';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    // Save current view to localStorage
    localStorage.setItem('ownerCurrentView', 'menu');
    fetchProducts();
    fetchCategories();
    fetchFoodstalls();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/s2d/product');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/s2d/category');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh mục');
    }
  };

  const fetchFoodstalls = async () => {
    try {
      const response = await api.get('/s2d/foodstall');
      setFoodstalls(response.data);
    } catch (error) {
      console.error('Error fetching foodstalls:', error);
    }
  };

  const handleAddProduct = async (formData) => {
    try {
      // Ensure formData is a FormData object
      if (!(formData instanceof FormData)) {
        throw new Error('formData is not a FormData object');
      }

      // Append stall_id to the FormData
      formData.append('stall_id', stallId);

      // Log FormData entries for debugging
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await api.post('/s2d/product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        await fetchProducts();
        setIsAddModalOpen(false);
        toast.success('Thêm món ăn thành công');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Không thể thêm món ăn');
    }
  };

  const handleEditProduct = async (productId, formData) => {
    try {
      const response = await api.post(`/s2d/product/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
      try {
        await api.delete(`/s2d/product/${productId}`);
        await fetchProducts();
        toast.success('Xóa món ăn thành công');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Không thể xóa món ăn');
      }
    }
  };

  const filteredProducts = products.filter((product) => {
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

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (priceSort === 'asc') return parseFloat(a.price) - parseFloat(b.price);
    if (priceSort === 'desc') return parseFloat(b.price) - parseFloat(a.price);
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

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
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-600 ml-4"
            >
              <FaPlus />
              <span>Thêm món mới</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ảnh món</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên món ăn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((product, index) => {
                const category = categories.find((c) => c._id === product.category);

                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={`${process.env.REACT_APP_API_URL}${product.image}`}
                        alt={product.pd_name}
                        className="h-16 w-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.pd_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseInt(product.price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} đ
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
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
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
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 px-4">
          <div className="text-sm text-gray-500">
            Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, sortedProducts.length)} trong tổng số{' '}
            {sortedProducts.length} món ăn
          </div>
          <div className="flex space-x-1">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border ${
                currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Trước
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-1 rounded border ${
                  currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Sau
            </button>
          </div>
        </div>

        <O_AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          categories={categories}
          onSave={handleAddProduct}
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
        />
      </main>
    </div>
  );
};

export default O_MenuManage;
const { Category } = require('../model/model');
const { notifyCategoryAdded, notifyCategoryUpdated, notifyCategoryDeleted } = require('../utils/socketUtils');

const categoryController = {
  // Add a category
  addCategory: async (req, res) => {
    try {
      const newCategory = new Category(req.body);
      const savedCategory = await newCategory.save();

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      notifyCategoryAdded(io, savedCategory._id, {
        categoryId: savedCategory._id,
        cate_name: savedCategory.cate_name,
        message: 'Danh mục mới đã được thêm'
      });

      return res.status(200).json(savedCategory);
    } catch (error) {
      console.error('Error in addCategory:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get all categories
  getAllCategory: async (req, res) => {
    try {
      const categories = await Category.find().populate({ path: 'products', select: 'pd_name' });
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Error in getAllCategory:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get a category by ID
  getACategory: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id).populate({ path: 'products' });
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      return res.status(200).json(category);
    } catch (error) {
      console.error('Error in getACategory:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update a category
  updateCategory: async (req, res) => {
    try {
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      notifyCategoryUpdated(io, updatedCategory._id, {
        categoryId: updatedCategory._id,
        cate_name: updatedCategory.cate_name,
        message: 'Danh mục đã được cập nhật'
      });

      return res.status(200).json({
        message: 'Category updated successfully',
        category: updatedCategory
      });
    } catch (error) {
      console.error('Error in updateCategory:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Delete a category
  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      if (category.products.length > 0) {
        return res.status(400).json({ message: 'Không thể xóa danh mục vì vẫn còn sản phẩm liên kết' });
      }

      await Category.findByIdAndDelete(req.params.id);

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      notifyCategoryDeleted(io, category._id, {
        categoryId: category._id,
        cate_name: category.cate_name, // Sửa từ 'name' thành 'cate_name' để khớp với schema
        message: 'Danh mục đã được xóa'
      });

      return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = categoryController;
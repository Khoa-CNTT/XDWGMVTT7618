const { Cart, Product, CartDetail } = require('../model/model');
const { increaseCartQuantity, decreaseCartQuantity } = require('../service/cartdetailService');
const {
  notifyCartDetailAdded,
  notifyCartDetailUpdated,
  notifyCartDetailDeleted,
  notifyCartDetailQuantityDecreased
} = require('../utils/socketUtils');

const cartdetailController = {
  // Add a cart detail
  addCartdetail: async (req, res) => {
    try {
      const { cart, products, quantity } = req.body;

      if (!cart || !products) {
        return res.status(400).json({ message: 'Thiếu cartID hoặc productsId' });
      }

      const upProduttoCartdetail = await increaseCartQuantity(cart, products, quantity || 1);

      const cartDoc = await Cart.findById(cart);
      if (!cartDoc) {
        return res.status(404).json({ message: 'Cart không tìm thấy' });
      }

      await cartDoc.updateOne({
        $addToSet: { cartdetail: upProduttoCartdetail.detail._id }
      });

      const productDoc = await Product.findById(products);
      if (!productDoc) {
        return res.status(404).json({ message: 'Product không tìm thấy' });
      }

      await productDoc.updateOne({
        $addToSet: { cartdetail: upProduttoCartdetail.detail._id }
      });

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      notifyCartDetailAdded(io, cart, {
        cartId: cart,
        detail: upProduttoCartdetail.detail,
        message: upProduttoCartdetail.updated ? 'Tăng số lượng sản phẩm' : 'Thêm sản phẩm mới'
      });

      return res.status(200).json({
        message: upProduttoCartdetail.updated ? 'Tăng số lượng sản phẩm trong giỏ hàng' : 'Thêm sản phẩm vào giỏ hàng',
        detail: upProduttoCartdetail
      });
    } catch (error) {
      console.error('Error in addCartdetail:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get all cart details
  getCartdetail: async (req, res) => {
    try {
      const cartDetails = await CartDetail.find()
        .populate({
          path: 'products',
          select: 'pd_name price image stall_id'
        })
        .populate('cart');

      return res.status(200).json(cartDetails);
    } catch (error) {
      console.error('Error in getCartdetail:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Delete a cart detail by ID
  deleteCartdetail: async (req, res) => {
    try {
      const cartDetail = await CartDetail.findById(req.params.id);
      if (!cartDetail) {
        return res.status(404).json({ message: 'Cart detail not found' });
      }

      await Product.findByIdAndUpdate(cartDetail.products, {
        $pull: { cartdetail: cartDetail._id }
      });

      await Cart.findByIdAndUpdate(cartDetail.cart, {
        $pull: { cartdetail: cartDetail._id }
      });

      await cartDetail.deleteOne();

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      notifyCartDetailDeleted(io, cartDetail.cart, {
        cartId: cartDetail.cart,
        detailId: cartDetail._id,
        message: 'Sản phẩm đã bị xóa khỏi giỏ hàng'
      });

      return res.status(200).json({ message: 'Cart detail deleted successfully' });
    } catch (error) {
      console.error('Error in deleteCartdetail:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update a cart detail
  updateCartdetail: async (req, res) => {
    try {
      const cartDetailId = req.params.id;
      const { quantity } = req.body;

      if (!quantity || quantity < 0) {
        return res.status(400).json({ message: 'Quantity phải là số không âm' });
      }

      const updatedCartDetail = await CartDetail.findByIdAndUpdate(
        cartDetailId,
        { quantity },
        { new: true }
      ).populate({
        path: 'products',
        select: 'pd_name price image stall_id'
      });

      if (!updatedCartDetail) {
        return res.status(404).json({ message: 'Cart detail not found' });
      }

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      notifyCartDetailUpdated(io, updatedCartDetail.cart, {
        cartId: updatedCartDetail.cart,
        detailId: updatedCartDetail._id,
        message: 'Thông tin chi tiết giỏ hàng đã được cập nhật'
      });

      return res.status(200).json(updatedCartDetail);
    } catch (error) {
      console.error('Error in updateCartdetail:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Decrease quantity of a cart detail
  downQuantity: async (req, res) => {
    try {
      const { cart, products, quantity } = req.body;

      if (!cart || !products) {
        return res.status(400).json({ message: 'Thiếu cartID hoặc productsId' });
      }

      const downQuantityResult = await decreaseCartQuantity(cart, products, quantity || 1);

      const io = req.app.get('io');
      if (!io) {
        console.error('Socket.IO is not initialized');
        return res.status(500).json({ message: 'Socket.IO not available' });
      }

      if (downQuantityResult.quantity === 0) {
        await CartDetail.findByIdAndDelete(downQuantityResult._id);
        await Cart.findByIdAndUpdate(cart, { $pull: { cartdetail: downQuantityResult._id } });
        await Product.findByIdAndUpdate(products, { $pull: { cartdetail: downQuantityResult._id } });

        notifyCartDetailDeleted(io, cart, {
          cartId: cart,
          detailId: downQuantityResult._id,
          message: 'Sản phẩm đã bị xóa khỏi giỏ hàng'
        });

        return res.status(200).json({
          message: 'Sản phẩm đã bị xóa khỏi giỏ hàng',
          detail: downQuantityResult
        });
      }

      notifyCartDetailQuantityDecreased(io, cart, {
        cartId: cart,
        detailId: downQuantityResult._id,
        message: 'Số lượng sản phẩm đã giảm'
      });

      return res.status(200).json({
        message: 'Giảm số lượng sản phẩm trong giỏ hàng',
        detail: downQuantityResult
      });
    } catch (error) {
      console.error('Error in downQuantity:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Confirm order
  confirmOrder: async (req, res) => {
    try {
      const { cartId } = req.body;

      if (!cartId) {
        return res.status(400).json({ message: 'Thiếu cartId' });
      }

      const updatedCount = await CartDetail.updateMany(
        { cart: cartId },
        { $set: { status: 'pending' } }
      );

      if (updatedCount.matchedCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy chi tiết giỏ hàng nào cho cartId này' });
      }

      const updatedDetails = await CartDetail.find({ cart: cartId })
        .populate({
          path: 'products',
          select: 'pd_name price image stall_id'
        })
        .populate('cart');

      return res.status(200).json({
        message: 'Xác nhận đơn hàng thành công',
        updatedDetails
      });
    } catch (error) {
      console.error('Error in confirmOrder:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = cartdetailController;
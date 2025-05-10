const { Cart, Product, CartDetail } = require('../model/model');
const { increaseCartQuantity, decreaseCartQuantity } = require('../service/cartdetailService');
const {
  notifyCartDetailAdded,
  notifyCartDetailUpdated,
  notifyCartDetailDeleted,
  notifyCartDetailQuantityDecreased
} = require('../utils/socketUtils');

const cartdetailController = {
  addCartdetail: async (req, res) => {
    try {
      const { cart, products, quantity } = req.body;

      if (!cart || !products) {
        return res.status(400).json({ message: "Thiếu cartID hoặc productsId" });
      }

      const upProduttoCartdetail = await increaseCartQuantity(cart, products, quantity || 1);

      const cartDoc = await Cart.findById(cart);
      if (!cartDoc) return res.status(404).json({ message: 'Cart không tìm thấy.' });

      await cartDoc.updateOne({
        $addToSet: { cartdetail: upProduttoCartdetail.detail._id }
      });

      const productDoc = await Product.findById(products);
      if (!productDoc) return res.status(404).json({ message: 'Product không tìm thấy.' });

      await productDoc.updateOne({
        $addToSet: { cartdetail: upProduttoCartdetail.detail._id }
      });

      const io = req.app.get('io');
      notifyCartDetailAdded(io, cart, {
        cartId: cart,
        detail: upProduttoCartdetail.detail,
        message: upProduttoCartdetail.updated ? "Tăng số lượng sản phẩm" : "Thêm sản phẩm mới",
      });

      res.status(200).json({
        message: upProduttoCartdetail.updated ? "Tăng số lượng sản phẩm trong giỏ hàng" : "Thêm sản phẩm vào giỏ hàng",
        detail: upProduttoCartdetail
      });

    } catch (error) {
      console.error("Error in addCartdetail:", error);
      res.status(500).json({ message: "Server error", error: error.message || error });
    }
  },

  getCartdetail: async (req, res) => {
    try {
      const cartDetails = await CartDetail.find()
        .populate({
          path: 'products',
          select: 'pd_name price image stall_id'
        })
        .populate('cart');

      res.status(200).json(cartDetails);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

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
      notifyCartDetailDeleted(io, cartDetail.cart, {
        cartId: cartDetail.cart,
        detailId: cartDetail._id,
        message: "Sản phẩm đã bị xóa khỏi giỏ hàng",
      });

      res.status(200).json({ message: 'Cart detail deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  updateCartdetail: async (req, res) => {
    try {
      const cartDetailId = req.params.id;
      const { quantity } = req.body;

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
      notifyCartDetailUpdated(io, updatedCartDetail.cart, {
        cartId: updatedCartDetail.cart,
        detailId: updatedCartDetail._id,
        message: "Thông tin chi tiết giỏ hàng đã được cập nhật",
      });

      res.status(200).json(updatedCartDetail);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  downQuantity: async (req, res) => {
    try {
      const { cart, products, quantity } = req.body;

      if (!cart || !products) {
        return res.status(400).json({ message: "Thiếu cartID hoặc productsId" });
      }

      const downQuantityResult = await decreaseCartQuantity(cart, products, quantity || 1);

      const io = req.app.get('io');

      if (downQuantityResult.quantity === 0) {
        await CartDetail.findByIdAndDelete(downQuantityResult._id);
        await Cart.findByIdAndUpdate(cart, { $pull: { cartdetail: downQuantityResult._id } });
        await Product.findByIdAndUpdate(products, { $pull: { cartdetail: downQuantityResult._id } });

        notifyCartDetailDeleted(io, cart, {
          cartId: cart,
          detailId: downQuantityResult._id,
          message: "Sản phẩm đã bị xóa khỏi giỏ hàng",
        });

        return res.status(200).json({
          message: "Sản phẩm đã bị xoá khỏi giỏ hàng",
          detail: downQuantityResult
        });
      }

      notifyCartDetailQuantityDecreased(io, cart, {
        cartId: cart,
        detailId: downQuantityResult._id,
        message: "Số lượng sản phẩm đã giảm",
      });

      res.status(200).json({
        message: "Giảm số lượng sản phẩm trong giỏ hàng",
        detail: downQuantityResult
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  confirmOrder: async (req, res) => {
    try {
      const { cartId } = req.body;

      await CartDetail.updateMany(
        { cart: cartId },
        { $set: { status: 'pending' } }
      );

      const updatedDetails = await CartDetail.find({ cart: cartId })
        .populate({
          path: 'products',
          select: 'pd_name price image stall_id'
        })
        .populate('cart');

      res.status(200).json(updatedDetails);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = cartdetailController;

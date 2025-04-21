const { Cart, Product, CartDetail } = require('../model/model');
const { increaseCartQuantity, decreaseCartQuantity } = require('../service/cartdetailService');

const cartdetailController = {
  addCartdetail: async (req, res) => {
    try {
      const { cart, products, quantity } = req.body;

      const existingCartDetail = await CartDetail.findOne({
        cart: cart,
        products: products
      });

      if (existingCartDetail) {
        const updatedCartDetail = await CartDetail.findByIdAndUpdate(
          existingCartDetail._id,
          { $inc: { quantity: quantity || 1 } },
          { new: true }
        ).populate({
          path: 'products',
          select: 'pd_name price image stall_id' // ✅ Thêm stall_id
        });

        return res.status(200).json(updatedCartDetail);
      }

      const newCartDetail = new CartDetail({
        cart,
        products,
        quantity: quantity || 1
      });

      const savedCartDetail = await newCartDetail.save();

      await Product.findByIdAndUpdate(products, {
        $push: { cartdetail: savedCartDetail._id }
      });

      const populatedCartDetail = await CartDetail.findById(savedCartDetail._id)
        .populate({
          path: 'products',
          select: 'pd_name price image stall_id' // ✅ Thêm stall_id
        });

      res.status(200).json(populatedCartDetail);
    } catch (error) {
      console.error('Error in addCartdetail:', error);
      res.status(500).json({ error: error.message });
    }
  },

  getCartdetail: async (req, res) => {
    try {
      const cartDetails = await CartDetail.find()
        .populate({
          path: 'products',
          select: 'pd_name price image stall_id' // ✅ Thêm stall_id
        })
        .populate('cart');
      res.status(200).json(cartDetails);
    } catch (error) {
      res.status(500).json(error);
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

      await cartDetail.deleteOne();
      res.status(200).json({ message: 'Cart detail deleted successfully' });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  updateCartdetail: async (req, res) => {
    try {
      const cartDetailId = req.params.id;
      const { quantity } = req.body;

      const updatedCartDetail = await CartDetail.findByIdAndUpdate(
        cartDetailId,
        { quantity: quantity },
        { new: true }
      ).populate({
        path: 'products',
        select: 'pd_name price image stall_id' // ✅ Thêm stall_id
      });

      if (!updatedCartDetail) {
        return res.status(404).json({ message: 'Cart detail not found' });
      }

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

      const downQuantity = await decreaseCartQuantity(cart, products, quantity || 1);

      if (downQuantity.quantity === 0) {
        await CartDetail.findByIdAndDelete(downQuantity._id);
        await Cart.findByIdAndUpdate(cart, { $pull: { cartdetail: downQuantity._id } });
        await Product.findByIdAndUpdate(products, { $pull: { cartdetail: downQuantity._id } });

        return res.status(200).json({
          message: "Sản phẩm đã bị xoá khỏi giỏ hàng",
          detail: downQuantity
        });
      }

      res.status(200).json({
        message: "Giảm số lượng sản phẩm trong giỏ hàng",
        detail: downQuantity
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
          select: 'pd_name price image stall_id' // ✅ Thêm stall_id
        })
        .populate('cart');

      res.status(200).json(updatedDetails);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = cartdetailController;
    
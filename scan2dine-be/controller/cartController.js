const { Cart, Customer, Product, CartDetail } = require('../model/model');
const { param } = require('../routes/cartdetail');
const { creatCart } = require('../service/cartService');

const cartController = {
    // add a cart
    addCart: async (req, res) => {
        try {
            const newCart = await creatCart(req.body);
            // req.body.customer: laays id cua customer
            if (req.body.customer) {
                const customer = await Customer.findById(req.body.customer);
                await customer.updateOne({
                    $push: {
                        cart: saveCart._id
                    }
                })
            };
            return res.status(200).json(newCart);
        } catch (error) {
            console.error("Error in:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // get cart
    getCart: async (req, res) => {
        try {
            const cart = await Cart.find().populate({ path: "customer", select: "name" });
            return res.status(200).json(cart);
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    getAcart: async (req, res) => {
        try {
            const cart = await Cart.findById(req.params.id)
                .populate({
                    path: "cartdetail",
                    select: "quantity products",
                    populate: {
                        path: "products",
                        select: "pd_name price "
                    }
                });


            if (!cart) {
                return res.status(404).json({ message: "Cart not found" });
            }

            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    //delete all cartdetail theo id của giỏ hàng
    // deleteCartdetail: async (req, res) => {
    //     try {
    //         const deleteAllcartdetail = await Cart.findById(req.params.id);

    //         if (!deleteAllcartdetail) {
    //             return res.status(404).json({ message: "not found" })
    //         }
    //         if (deleteAllcartdetail) {
    //             await CartDetail.deleteMany({ cart: req.params.id })
    //         }

    //         await Cart.findByIdAndUpdate(deleteAllcartdetail._id, {
    //             $set: {
    //                 cartdetail: []
    //             }
    //         })

    //         return res.status(200).json({
    //             message: "Cart and related deleted successfully",
    //             delete: deleteAllcartdetail
    //         })
    //     } catch (error) {
    //         console.error("Error in addCartdetail:", error);
    //         return res.status(500).json({ message: "Server error", error: error.message || error });
    //     }
    // },
    deleteCartdetail: async (req, res) => {
        try {
            const cart = await Cart.findById(req.params.id);

            if (!cart) {
                return res.status(404).json({ message: "Cart not found" });
            }

            // Lấy danh sách CartDetail liên quan tới cart
            const relatedCartDetails = await CartDetail.find({ cart: cart._id });
            const cartDetailIds = relatedCartDetails.map(cd => cd._id);

            // Xoá các CartDetail liên quan đến cart
            await CartDetail.deleteMany({ cart: cart._id });

            // Gỡ CartDetail khỏi Product
            await Product.updateMany(
                { cartdetail: { $in: cartDetailIds } },
                { $pull: { cartdetail: { $in: cartDetailIds } } }
            );

            // Xoá mảng cartdetail trong Cart nếu có
            await Cart.findByIdAndUpdate(cart._id, {
                $set: { cartdetail: [] }
            });

            return res.status(200).json({
                message: "CartDetails deleted and removed from Product successfully",
                deletedCartDetailIds: cartDetailIds
            });

        } catch (error) {
            console.error("Error in deleteCartdetail:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    }

}

module.exports = cartController;
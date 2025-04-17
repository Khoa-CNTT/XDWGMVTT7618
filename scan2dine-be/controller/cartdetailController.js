const { Cart, Product, CartDetail } = require('../model/model');

const cartdetailCoontroller = {
    // add cartdetial
    addCartdetail: async (req, res) => {
        try {
            const { cart, products } = req.body;

            // 1. Kiểm tra sản phẩm đã có trong cartdetail chưa
            let existingCartDetail = await CartDetail.findOne({
                cart: cart,
                products: products
            });

            if (existingCartDetail) {
                // 2. Nếu có rồi → cập nhật quantity tăng lên 1
                existingCartDetail.quantity += 1;
                await existingCartDetail.save();
                return res.status(200).json(existingCartDetail);
            }

            // 3. Nếu chưa có → tạo mới cartdetail
            const newCartdetail = new CartDetail({ ...req.body, quantity: 1 });
            const saveCartdeail = await newCartdetail.save();

            // 4. Cập nhật cart và product
            if (cart) {
                await Cart.findByIdAndUpdate(cart, {
                    $push: { cartdetail: saveCartdeail._id }
                });
            }

            if (products) {
                await Product.findByIdAndUpdate(products, {
                    $push: { cartdetail: saveCartdeail._id }
                });
            }

            res.status(200).json(saveCartdeail);
        } catch (error) {
            console.error("Error in addCartdetail:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },

    //show cartdetail 
    getCartdetail: async (req, res) => {
        try {
            const cartdetail = await CartDetail.find().populate({ path: 'products', select: 'pd_name' });
            res.status(200).json(cartdetail);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // delete cartdetail
    deleteCartdetail: async (req, res) => {
        try {
            const deleteCartdetail = await CartDetail.findByIdAndDelete(req.params.id);
            if (!deleteCartdetail) {
                res.status(404).json({ message: "not found" })
            }
            // xóa cartdetail khỏi cart
            await Cart.findByIdAndUpdate(deleteCartdetail.id,
                {
                    $pull: {
                        cartdetail: deleteCartdetail._id
                    }
                }
            );

            // xóa cartdetail khỏi product
            await Product.findByIdAndUpdate(deleteCartdetail.id,
                {
                    $pull: {
                        cartdetail: deleteCartdetail._id
                    }
                }
            );
            res.status(200).json({ message: "Delete successfully" });
        } catch (error) {
            console.error("Error in addCartdetail:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },

    // update cartdetail
    updateCartdetail: async (req, res) => {
        try {
            const cartdetailID = await CartDetail.findById(req.params.id);
            if (!cartdetailID) {
                res.status(404).json(error)
            }
            // kta xem co id product k
            if (req.body.products && req.body.products !== cartdetailID.products?.toString()) {
                if (cartdetailID.products) {
                    //xóa id cartdetail trong product 
                    await Product.findByIdAndUpdate(cartdetailID.products,
                        {
                            $pull: {
                                cartdetail: cartdetailID._id
                            }
                        }
                    );
                    // thêm id cartdetail mới vào product 
                    await Product.findByIdAndUpdate(req.body.products,
                        {
                            $push: {
                                cartdetail: cartdetailID._id
                            }
                        }
                    )
                }
            };
            if (req.body.cart && req.body.cart !== cartdetailID.cart?.toString()) {
                // check id cua cart cos k 
                if (cartdetailID.cart) {
                    await Cart.findByIdAndUpdate(cartdetailID.cart,
                        {
                            $pull: {
                                cartdetail: cartdetailID._id
                            }
                        }
                    )
                }
                await Cart.findByIdAndUpdate(req.body.cart,
                    {
                        $push: {
                            cartdetail: cartdetailID._id
                        }
                    }
                )
            };
            const updateCartdetail = await CartDetail.findByIdAndUpdate(cartdetailID,
                // req.body,
                { $set: req.body },
                { new: true }
            )
            res.status(200).json(updateCartdetail);
        } catch (error) {
            console.error("Error in addCartdetail:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }

    }
}


module.exports = cartdetailCoontroller;
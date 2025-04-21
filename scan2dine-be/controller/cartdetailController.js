const {Cart, Product, CartDetail}  = require('../model/model');
const { increaseCartQuantity, decreaseCartQuantity } = require('../service/cartdetailService');

const cartdetailController ={
    addCartdetail: async (req, res) => {
        try {
            const { cart, products, quantity } = req.body;
    
            if (!cart || !products) {
                return res.status(400).json({ message: "Thiếu cartID hoặc productsId" });
            }
    
            const upProduttoCartdetail = await increaseCartQuantity(cart, products, quantity || 1);
    
            // Cập nhật Cart nếu có
            if (cart) {
                const cartID = await Cart.findById(cart);
                if (!cartID) {
                    return res.status(404).json({ message: 'Cart không tìm thấy.' });
                }
    
                await cartID.updateOne({
                    $addToSet: { cartdetail: upProduttoCartdetail.detail._id }
                });
    
                console.log("Cart updated:", cartID);
            }
    
            // Cập nhật Product nếu có
            if (products) {
                const product = await Product.findById(products);
                if (!product) {
                    return res.status(404).json({ message: 'Product không tìm thấy.' });
                }
    
                await product.updateOne({
                    $addToSet: { cartdetail: upProduttoCartdetail.detail._id }
                });
    
                console.log("Product updated:", product);
            }
    
            res.status(200).json({
                message: upProduttoCartdetail.updated ? "Tăng số lượng sản phẩm trong giỏ hàng" : "Thêm sản phẩm vào giỏ hàng",
                detail: upProduttoCartdetail
            });
    
        } catch (error) {
            console.error("Error in addCartdetail:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    
    //show cartdetail 
    getCartdetail:async(req,res)=>{
        try {
            const cartdetail = await CartDetail.find().select("pd_name price category image stall").populate({
                path: "products",
                populate: {
                    path: "stall",
                    select: "stall_name" // chỉ lấy tên quầy hàng
                }
            });
            res.status(200).json(cartdetail);
        } catch (error) {
            res.status(500).json(error);
        }   
    },

    // delete cartdetail
    deleteCartdetai: async (req,res)=>{
        try {
            const deleteCartdetail = await CartDetail.findByIdAndDelete(req.params.id);
            if(!deleteCartdetail){
                res.status(404).json({message: "not found"})
            }
            // xóa cartdetail khỏi cart
            await Cart.findByIdAndUpdate(deleteCartdetail.id, 
                {$pull:{
                    cartdetail: deleteCartdetail._id
                }}
            );

            // xóa cartdetail khỏi product
            await Product.findByIdAndUpdate(deleteCartdetail.id,
                {$pull: {
                    cartdetail: deleteCartdetail._id
                }}
            );
            res.status(200).json({ message: "Delete successfully" });
        } catch (error) {
            console.error("Error in addCartdetail:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },

    // update cartdetail
    updateCartdetail: async(req,res)=>{
        try {
            const cartdetailID = await CartDetail.findById(req.params.id);
            if(!cartdetailID){
                        res.status(404).json(error)
                    }
            // kta xem co id product k
            if(req.body.products && req.body.products !== cartdetailID.products?.toString()){
                if(cartdetailID.products){
                    //xóa id cartdetail trong product 
                    await Product.findByIdAndUpdate(cartdetailID.products, 
                        {$pull: { 
                            cartdetail: cartdetailID._id
                        }}
                    );
                    // thêm id cartdetail mới vào product 
                    await Product.findByIdAndUpdate(req.body.products, 
                        {
                            $push:{
                                cartdetail: cartdetailID._id
                            }
                        }
                    )
                }
            };
            if(req.body.cart && req.body.cart !== cartdetailID.cart?.toString()){
                // check id cua cart cos k 
                if(cartdetailID.cart){
                    await Cart.findByIdAndUpdate(cartdetailID.cart, 
                        {$pull:{
                            cartdetail: cartdetailID._id
                        }}
                    )
                }
                await Cart.findByIdAndUpdate(req.body.cart, 
                    {
                        $push:{
                            cartdetail: cartdetailID._id
                        }
                    }
                )
            };
            const updateCartdetail = await CartDetail.findByIdAndUpdate(cartdetailID,
                // req.body,
                {$set:req.body},
                {new:true}
            )
            res.status(200).json(updateCartdetail);
        } catch (error) {
            console.error("Error in addCartdetail:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }        

    },
    downQuantity: async (req, res) => {
        try {
            const { cart, products, quantity } = req.body;
    
            if (!cart || !products) {
                return res.status(400).json({ message: "Thiếu cartID hoặc productsId" });
            }
    
            const downQuantity = await decreaseCartQuantity(cart, products, quantity || 1);
    
            // Nếu số lượng về 0 thì xoá luôn CartDetail và xoá liên kết
            if (downQuantity.quantity === 0) {
                await CartDetail.findByIdAndDelete(downQuantity._id);
                await Cart.findByIdAndUpdate(cart, { $pull: { cartdetail: downQuantity._id } });
                await Product.findByIdAndUpdate(products, { $pull: { cartdetail: downQuantity._id } });
    
                return res.status(200).json({
                    message: "Sản phẩm đã bị xoá khỏi giỏ hàng",
                    detail: downQuantity
                });
            }
    
            // Nếu vẫn còn quantity > 0
            res.status(200).json({
                message: "Giảm số lượng sản phẩm trong giỏ hàng",
                detail: downQuantity
            });
    
        } catch (error) {
            console.error("Error in downQuantity:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    }
}


module.exports = cartdetailController;
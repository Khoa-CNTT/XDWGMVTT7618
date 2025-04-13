const {Cart, Product, CartDetail}  = require('../model/model');

const cartdetailCoontroller ={
    // add cartdetial
    addCartdetail: async (req,res) => {
        try {
            const newCartdetail = CartDetail(req.body);
            const saveCartdeail = await newCartdetail.save();
            // tìm cart theo id của client gửi
            if(req.body.cart){
                const cart = await Cart.findById(req.body.cart);
                await cart.updateOne({$push:{
                    cartdetail: saveCartdeail._id
                }})
            }
            if(req.body.products){
                const product = await Product.findById(req.body.products);
                await product.updateOne({$push:{
                    cartdetail: saveCartdeail._id
                }})
            }
            res.status(200).json(saveCartdeail);
        } catch (error) {
            rconsole.error("Error in addCartdetail:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },

    

    //show cartdetail 
    getCartdetail:async(req,res)=>{
        try {
            const cartdetail = await CartDetail.find();
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

    }
}


module.exports = cartdetailCoontroller;
const {Cart, Customer, Product} = require('../model/model');

const cartController = {
    // add a cart
    addCart:  async (req,res) => {
        try {
            const newCart = new Cart(req.body);
            const saveCart = await newCart.save();
            // req.body.customer: laays id cua customer
            if (req.body.customer){ 
                const customer = await Customer.findById(req.body.customer);
                await customer.updateOne({$push: {
                    cart: saveCart._id
                }})
            };
            res.status(200).json(saveCart);
        } catch (error) {
            res.status(500).json(error);
        }
    },
    // get cart
    getCart: async(req,res) =>{
        try {
            const cart = await Cart.find().populate({path:"customer", select:"name"});
            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // delete cart
}

module.exports = cartController;
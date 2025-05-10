const {Cart, Customer} = require('../model/model');
const { notifyCartCreated } = require('../utils/socketUtils');

const creatCart = async ( customerID = null , io=null)=>{
    try {
        const newCart = new Cart();
        if( customerID ){
            newCart.customer = customerID;
        }
        const saveCart = newCart.save();
        if (io) {
        notifyCartCreated(io, saveCart._id, {
            cartId: saveCart._id,
            customerId: customerID || null,
            message: 'Giỏ hàng mới đã được tạo',
        });
    }
        return saveCart;
    } catch (error) {
        throw error;
    }
}


module.exports ={ creatCart}
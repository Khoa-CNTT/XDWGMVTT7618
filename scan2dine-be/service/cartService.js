const {Cart, Customer} = require('../model/model');

const creatCart = async ( customerID = null )=>{
    try {
        const newCart = new Cart();
        if( customerID ){
            newCart.customer = customerID;
        }
        const saveCart = newCart.save();
        return saveCart;
    } catch (error) {
        throw error;
    }
}


module.exports ={ creatCart}
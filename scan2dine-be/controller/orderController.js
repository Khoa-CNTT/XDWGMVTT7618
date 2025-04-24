const {Order, Customer, Table, Orderdetail} = require('../model/model');
const orderController = {
    // ADD ORDER
    addOrder: async (req, res) => {
        try {
            const newOrder = new Order(req.body);
            const saveOrder = await newOrder.save();

            // Update customer
            if (req.body.customer) {
                await Customer.findByIdAndUpdate(req.body.customer, {
                    $push: { order: saveOrder._id }
                });
            }

            // Update table
            if (req.body.table) {
                await Table.findByIdAndUpdate(req.body.table, {
                    $push: { order: saveOrder._id }
                });
            }

            res.status(200).json(saveOrder);
        } catch (error) {
            console.error("Error in addOrder:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // GET OERDER
    getOrder: async(req,res) =>{
        try {
            const getOrder = await Order.find().populate({path: 'customer', select: 'name'});

            res.status(200).json(getOrder);
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    }, 
    getAorder: async (req, res) => {
        try {
            const getAorder = await Order.findById(req.params.id)
                .populate({
                    path: "orderdetail",
                    select: "quantity products",
                    populate: {
                        path: "products",
                        select: "pd_name price stall",
                        populate: {
                            path: "stall",
                            select: "stall_name"
                        }
                    }
                });

            if (!getAorder) {
                return res.status(404).json('not found');
            };
            res.status(200).json(getAorder);
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            return res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // UPDATE ORDER
    updateOrder: async(req,res) =>{
        try {
            const orderID = Order.findById(req.params.id);
            if(!orderID){
                res.status(404).json('not found')
            }
            // kiểm tra id order có trong customer không
            if(req.body.customer && req.body.customer !==  orderID.customer?.toString()){
                if(orderID.customer){
                    // xoá order cũ khỏi customer
                    await Customer.findByIdAndUpdate(orderID.customer, 
                        {$pull: {
                            order: orderID._id
                        }}
                    )
                }
                // thêm order mới vào customer
                await Customer.findByIdAndUpdate(req.body.customer,{
                    $push:{
                        order: orderID._id
                    }
                })
            };
            // kiểm tra id order có trong table không
            if(req.body.table && req.body.table!== orderID.table?.toString()){
                if(orderID.table){
                    // xoá order cũ khỏi table
                    await Table.findByIdAndUpdate(orderID.table, {
                        $pull: {
                            order: orderID._id
                        }
                    })
                }  
            }
            // thêm order mới vào table
            await Table.findByIdAndUpdate(req.body.table, {
                $push:{
                    order: orderID._id
                }
            });
            const updateOrder = await Order.findByIdAndUpdate(req.params.id,{
                $set: req.body
            },{new: true});
            res.status(200).json({message: "Update order successfully", updateOrder});
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }  
    }, 
    // DELETE ORDER
    deleteOrder: async(req,res) =>{
        try {
            const deleteOrder = await Order.findByIdAndDelete(req.params.id);

            if(!deleteOrder){
                res.status(404).json('not found');
            }
            await Customer.findByIdAndUpdate(deleteOrder.customer,{
                $pull: {
                    order: deleteOrder._id
                }
            });;
            await Table.findOneAndUpdate(deleteOrder.table, {
                $pull:{
                    order: deleteOrder._id
                }
            });
            
            res.status(200).json({message: "Delete order successfully", deleteOrder});
        } catch (error) {
            console.error("Error in DELETEREVIEW:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
            } 
    }
}

module.exports = orderController;
const {Order, Table} = require('../models/model');

const tableController = {
    // add table
    addTable:async(req,res)=>{
        try {
            const newTable = new tableController(req.body);
            const saveTable = await newTable.save();
            res.status(200).json(saveTable);
        } catch (error) {
            console.error("Error in addCartdetail:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // get all table
    getTable: async(req,res)=>{
        try {
            const getTable = await Table.find().populate({path:'order', select: 'cutomer orderdetail'}); 
            res.status(200).json(getTable);
        } catch (error) {
            console.error("Error in addCartdetail:", error);
            res.status(500).json({ message: "Server error", error: error.message || error });
        }
    },
    // delete table
    deleteTable: async(req,res)=>{
        try {
            const table = await Table.findByIdAndDelete(req.params.id);
            if(!table) {
                return res.status(404).json("Table not found");
            }
            res.status(200).json({message: "Table has been deleted successfully", delete: deleteTable});
        } catch (error) {
            res.status(500).json("Error deleting table: " + error.message);
        }   
    },  
}

module.exports = tableController;
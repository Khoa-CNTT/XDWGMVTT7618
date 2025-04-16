const { model } = require('mongoose');
const { Table, User } = require('../model/model')
const tableController = {
    getTable: async (req, res) => {
        try {
            const table = await Table.find();
            res.status(200).json(table);
        } catch (error) {
            res.status(500).json(error)
        }

    },
}
module.exports = tableController;
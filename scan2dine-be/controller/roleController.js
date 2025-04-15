const { Role } = require('../model/model');
const { default: mongoose } = require("mongoose");

const roleController = {
    // add role
    AddRole: async (req, res) => {
        try {
            const { rl_name} = req.body;
            const role = new Role({ rl_name });
            await role.save();
            res.status(201).json({ message: 'Role created', role });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // get all role
    getRole: async (req, res) => {
        try {
            const roles = await Role.find();
            res.json(roles);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    },
    // update role
    updateRole: async (req, res) => {
      try {
          const { rl_name } = req.body;
          const role = await Role.findByIdAndUpdate(
            req.params.id,
            { rl_name },
            { new: true, runValidators: true }
          );
          if (!role) return res.status(404).json({ message: 'Role not found' });
          res.json({ message: 'Role updated', role });
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
  },
    // delete role
    deleteRole : async (req, res) => {
        try {
            const role = await Role.findByIdAndDelete(req.params.id);
            if (!role) return res.status(404).json({ message: 'Không tìm thấy role để xóa' });
            res.json({ message: 'Đã xóa role', role });
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
};
module.exports = roleController;
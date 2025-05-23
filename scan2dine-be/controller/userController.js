const { User, Role, Foodstall } = require('../model/model');
const { deleteFoodstallById } = require('./foodstallController');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userController = {
    // get user
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find()
                .populate({ path: 'role_id', select: 'role_name' })
                .populate({ path: 'stall_id', select: 'stall_name' });

            if (!users || users.length === 0) {
                return res.status(404).json({ message: 'No users found' });
            }

            res.status(200).json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // get user
    getAllUserName: async (req, res) => {
        try {
            // const users = await User.find().select('username');
            const users = await User.find();
            if (!users || users.length === 0) {
                return res.status(404).json({ message: 'No users found' });
            }

            const userNames = users.map(user => user.username);
            res.status(200).json(userNames);
            // res.status(200).json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // update user
    updateUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { full_name, username, email, password, role_id } = req.body;

            // 1. Tìm user hiện tại
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const oldRoleId = user.role_id;

            // 2. Cập nhật thông tin user
            user.full_name = full_name || user.full_name;
            user.username = username || user.username;
            user.email = email || user.email;
            user.password = password || user.password;
            user.role_id = role_id || user.role_id;

            await user.save();

            // 3. Nếu role_id thay đổi thì cập nhật trong bảng Role
            if (role_id && role_id.toString() !== oldRoleId?.toString()) {
                // Gỡ khỏi role cũ
                await Role.findByIdAndUpdate(oldRoleId, {
                    $pull: { user: userId }
                });

                // Thêm vào role mới
                await Role.findByIdAndUpdate(role_id, {
                    $push: { user: userId }
                });
            }

            res.status(200).json({ message: 'User updated successfully', user });
        } catch (error) {
            console.error('Lỗi khi cập nhật user:', error);
            res.status(500).json({ error: error.message });
        }
    },
    // delete user
    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;

            // Tìm user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Xoá user khỏi Role
            await Role.findByIdAndUpdate(user.role_id, {
                $pull: { user: userId }
            });

            // Kiểm tra nếu user là chủ quầy (Foodstall)
            const foodstall = await Foodstall.findOne({ user: userId });
            if (foodstall) {
                const stallId = foodstall._id;

                // Gọi hàm logic xóa foodstall và sản phẩm liên quan
                const foodstallDeletionResult = await deleteFoodstallById(stallId);
                if (foodstallDeletionResult.error) {
                    return res.status(500).json({ error: foodstallDeletionResult.error });
                }
            }

            // TODO: Nếu có review thì mở dòng sau để xóa review của user
            // await Review.deleteMany({ user: userId });

            // Cuối cùng xoá user
            await User.findByIdAndDelete(userId);

            res.status(200).json({ message: 'User and related data deleted successfully' });
        } catch (error) {
            console.error('Lỗi khi xoá user:', error);
            res.status(500).json({ error: error.message });
        }
    }
    ,

    // add user
    addUser: async (req, res) => {
        try {
            const { full_name, username, email, password, role_id } = req.body;

            const user = new User({ full_name, username, email, password, role_id });
            await user.save();
            await Role.findByIdAndUpdate(role_id, {
                $push: { user: user._id }
            });

            res.status(201).json({ message: 'User created successfully', user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // đăng kí
    register: async (req, res) => {
        try {
            const { full_name, username, email, password, role_id } = req.body;

            console.log("Received data:", req.body);

            if (!mongoose.Types.ObjectId.isValid(role_id)) {
                return res.status(400).json({ message: "Invalid role_id" });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email đã được sử dụng' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ full_name, username, email, password: hashedPassword, role_id });
            await newUser.save();

            await Role.findByIdAndUpdate(role_id, {
                $push: { user: newUser._id }
            });

            // Kiểm tra nếu role là "2" (chủ quầy) thì tạo quầy mới
            const role = await Role.findById(role_id);
            if (role && role.role_name === "2") {
                const newStall = new Foodstall({
                    stall_name: "Trống", // ✅ tên quầy là "Trống"
                    user: newUser._id,
                    location: ""
                });
                await newStall.save();

                newUser.stall_id = newStall._id;
                await newUser.save();
            }

            res.status(201).json({ message: 'Đăng ký thành công', user: newUser });
        } catch (error) {
            console.error('Lỗi trong hàm register:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // đăng nhập 
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            const user = await User.findOne({ username }).populate('role_id');
            if (!user) {
                return res.status(404).json({ message: 'Tên đăng nhập không tồn tại' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Mật khẩu không đúng' });
            }

            // Chuyển user sang object thường và xoá password
            const userObj = user.toObject();
            delete userObj.password;

            res.status(200).json({
                message: 'Đăng nhập thành công',
                user: userObj,
                role_name: user.role_id?.role_name || null
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
module.exports = userController;

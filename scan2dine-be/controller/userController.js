const { User, Role, Foodstall } = require('../model/model');
const { deleteFoodstall } = require('./foodstallController');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userController = {
    // get user
    getAllUser: async (req, res) => {
        try {
            const user = await User.find().populate({path: "role_id", select: "role_name"});
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // add user
    addUser: async (req, res) => {
        try {
            const { full_name, email, password, role_id } = req.body;

            const user = new User({ full_name, email, password, role_id });
            await user.save();
            await Role.findByIdAndUpdate(role_id, {
                $push: { user: user._id }
            });

            res.status(201).json({ message: 'User created successfully', user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // update user
    updateUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { full_name, email, password, role_id } = req.body;

            // 1. Tìm user hiện tại
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const oldRoleId = user.role_id;

            // 2. Cập nhật thông tin user
            user.full_name = full_name || user.full_name;
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
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Xoá user khỏi Role
            await Role.findByIdAndUpdate(user.role_id, {
                $pull: { user: userId }
            });

            // Kiểm tra nếu user là chủ quầy (Foodstall)
            const foodstall = await Foodstall.findOne({ user: userId });
            if (foodstall) {
                const stallId = foodstall._id;

                // Gọi hàm để xoá quầy và sản phẩm liên quan
                const foodstallDeletionResult = await deleteFoodstall(stallId);
                if (foodstallDeletionResult.error) {
                    return res.status(500).json({ error: foodstallDeletionResult.error });
                }
            }

            // Xoá liên kết Review nếu có (khi nào có thì mở hàm)
            // await Review.deleteMany({ user: userId });

            // Cuối cùng xoá user
            await User.findByIdAndDelete(userId);

            res.status(200).json({ message: 'User and related data deleted successfully' });
        } catch (error) {
            console.error('Lỗi khi xoá user:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // đăng kí
    register: async (req, res) => {
        try {
            const { full_name, email, password, role_id } = req.body;

            console.log("Received data:", req.body);

            // Kiểm tra nếu role_id có phải là ObjectId hợp lệ không
            if (!mongoose.Types.ObjectId.isValid(role_id)) {
                return res.status(400).json({ message: "Invalid role_id" });
            }

            // Kiểm tra email đã tồn tại chưa
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email đã được sử dụng' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ full_name, email, password: hashedPassword, role_id });
            await newUser.save();

            // Gán user vào role
            await Role.findByIdAndUpdate(role_id, {
                $push: { user: newUser._id }
            });

            res.status(201).json({ message: 'Đăng ký thành công', user: newUser });
        } catch (error) {
            console.error('Lỗi trong hàm register:', error);
            res.status(500).json({ error: error.message });
        }
    },
    // đăng nhập 
    login: async (req, res) => {
        try {
            const { full_name, password } = req.body;

            // Tìm user theo full_name
            // const user = await User.findOne({ full_name });
            const user = await User.findOne({ full_name }).populate('role_id');
            if (!user) {
                return res.status(404).json({ message: 'Tên đăng nhập không tồn tại' });
            }

            // So sánh mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Mật khẩu không đúng' });
            }

            // Nếu đúng, trả về user 
            res.status(200).json({
                message: 'Đăng nhập thành công',
                user,
                role_name: user.role_id?.role_name || null
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
}
module.exports = userController;

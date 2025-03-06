const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const test = (req, res) => { 
    res.json({msg: "User Controller Works"});
};

const register = async (req, res) => {
    try {
        const { name, email, password, userName } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const newUser = new User({
            name, email, password: passwordHash, userName
        });
        await newUser.save();
        res.json({ msg: 'Register Success' });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

const login = async (req, res) => {    
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User does not exist' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect password or user id' });
        }
        const token = jwt.sign({ id: user._id }, process.env.Jwt_secret, { expiresIn: '7d' });
        user.token = token;
        await user.save();
        res.json({ msg: 'Login Success', token });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

const logout = async (req, res) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
        return res.status(401).json({ message: 'Access denied, no token provided' });
    }

    try {
        const user = await User.findOneAndUpdate(
            { token },
            { $unset: { token: '' } },
            { new: true }
        );
        if (!user) {
            return res.status(401).json({ message: 'Invalid token or user not found' });
        }
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const loggedUser = async (req, res) => {
    res.send({ "user": req.user });
};

const changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
        if (password !== password_confirmation) {
            res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" });
        } else {
            const salt = await bcrypt.genSalt(10);
            const newHashPassword = await bcrypt.hash(password, salt);
            await User.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } });
            res.send({ "status": "success", "message": "Password changed successfully" });
        }
    } else {
        res.send({ "status": "failed", "message": "All Fields are Required" });
    }
};

const sendUserPasswordResetEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.', success: false });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User does not exist.', success: false });
        }

        const secret = user._id + process.env.Jwt_secret;
        const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' });
        const link = `http://localhost:3000/users/reset/${user._id}/${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h3>Hello ${user.name},</h3>
                <p>You requested a password reset. Please click the link below to reset your password:</p>
                <a href="${link}">Reset Password</a>
                <p>This link will expire in 15 minutes. If you didn't request this, please ignore this email.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset link sent to your email.', success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', success: false });
    }
};

const userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await User.findById(id);
    const new_secret = user._id + process.env.Jwt_secret;
    try {
        jwt.verify(token, new_secret);
        if (password && password_confirmation) {
            if (password !== password_confirmation) {
                res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" });
            } else {
                const salt = await bcrypt.genSalt(10);
                const newHashPassword = await bcrypt.hash(password, salt);
                await User.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } });
                res.send({ "status": "success", "message": "Password Reset Successfully" });
            }
        } else {
            res.send({ "status": "failed", "message": "All Fields are Required" });
        }
    } catch (error) {
        res.send({ "status": "failed", "message": "Invalid Token" });
    }
};

module.exports = { register, login, logout, test, sendUserPasswordResetEmail, userPasswordReset, changeUserPassword, loggedUser };

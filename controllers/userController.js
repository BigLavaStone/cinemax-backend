

//Signup a new user

import { generateToken, generateResetPwdToken, sendEmail } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "missing details" });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: "Account already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        });

        const token = generateToken(newUser._id);

        res.json({
            success: true, userData: newUser, token, message: "Account created successfully"
        })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//login existing user

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" });
        }



        const token = generateToken(userData._id);

        res.json({ success: true, userData, token, message: "Login successful" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });

    }
}

//controller to check if user is authenticated
export const checkAuth = async (req, res) => {
    res.json({ success: true, user: req.user })
}

// controller to update user profile details
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        let updatedUser;

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true });
        }
        else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true });
        }

        res.json({ success: true, user: updatedUser })

    } catch (error) {
        console.log(error.message);

        res.json({ success: false, message: error.message });

    }
}


export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.json({ success: false, message: "Account with this email does not exist" });
        }
        const resetToken = generateResetPwdToken(user._id);

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const result = await sendEmail(user.email, resetUrl);
        if (result.success) {
            return res.json({ success: true, message: "Password reset link sent to your email" });
        } else {
            return res.json({ success: false, message: result.msg });
        }

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


export const resetPassword = async (req, res) => {
    const token = req.params.token;
    const { newPassword } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET2);
        const userId = decoded.userId;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await User.findByIdAndUpdate(userId, { password: hashedPassword });
        res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log("Access denied: Token expired");
            res.json({ success: false, message: "Access denied: Token expired" });
        } else {
            console.log(error.message);
            res.json({ success: false, message: error.message });
        }
    }
}


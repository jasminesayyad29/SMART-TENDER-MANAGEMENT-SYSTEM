
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
const express = require('express');
const router = express.Router();


// Signup Route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const user = await User.create({ name, email, password: hashedPassword, role });
        res.status(200).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Registration failed. Please try again later.",
        });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    console.log(req.body.role)
    try {
        const { email, password ,role} = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password and role",
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found, Please register first",
            });
        }
        if( user.role != role )
        {
            return res.status(401).json({
                success: false,
                message: "Incorrect Role",
            });
            
        }
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(403).json({
                success: false,
                message: "Incorrect password",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Login failed. Please try again later.",
        });
    }
});

module.exports = router;

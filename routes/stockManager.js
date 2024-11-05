const { User } = require('../models/user');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

// Function to generate a random password
function generateRandomPassword(length = 12) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

router.post('/add', async (req, res) => {
    try {
        const { name, email, location } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Generate a random password
        const randomPassword = generateRandomPassword();

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        const newStockManager = new User({
            name,
            email,
            password: hashedPassword,
            isStockManager: true,
            location,
            role:"stockManager",
        });

        await newStockManager.save();

        // Send email with login credentials
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Your District Operation Manager Account Credentials',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #4a4a4a;">Welcome to Smart Grocery</h2>
                    <p>Dear ${name},</p>
                    <p>Your District Operation Manager account has been created successfully. Here are your login credentials:</p>
                    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Password:</strong> ${randomPassword}</p>
                    </div>
                    <p>For security reasons, we strongly recommend changing your password after your first login.</p>
                    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                    <p>Best regards,<br>Smart Grocery</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'District Operation Manager added successfully and email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding District Operation Manager', error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const stockManagers = await User.find({role:'stockManager'}).select('-password');
        res.status(200).json(stockManagers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Stock Managers', error: error.message });
    }
});

router.put('/status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        console.log("Isactive:",req.body);

        const updatedStockManager = await User.findByIdAndUpdate(
            id,
            { 
                isActive,
                isStockManager: isActive // Set isStockManager based on isActive status
            },
            { new: true }
        ).select('-password');

        if (!updatedStockManager) {
            return res.status(404).json({ message: 'District Operation Manager not found' });
        }

        res.status(200).json(updatedStockManager);
    } catch (error) {
        res.status(500).json({ message: 'Error updating District Operation Manager status', error: error.message });
    }
});





module.exports = router;

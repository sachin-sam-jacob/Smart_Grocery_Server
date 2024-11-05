const express = require('express');
const  { User } = require('../models/user');
const router = express.Router();
require('dotenv').config();
const nodemailer = require('nodemailer');

router.get('/', async (req, res) => {
    try {
        // Fetch all users where isBlocked is true
        const blockedUsers = await User.find({ isBlocked: true });

        if (!blockedUsers === 0) {
            return res.status(404).json({ error: true, msg: "No blocked users found" });
        }

        // Send users array in the response
        res.json({ error: false, users: blockedUsers });
    } catch (error) {
        console.error("Error fetching blocked users:", error);
        res.status(500).json({ error: true, msg: "An error occurred while fetching blocked users" });
    }
});

// Unblock user route
router.put('/unblock/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Find the user by ID and update the `isBlocked` field to `false`
        const updatedUser = await User.findByIdAndUpdate(userId, { isBlocked: false, reason: null }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: true, msg: 'User not found' });
        }

        // Send an email to the user when unblocked
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL, // Your email
                pass: process.env.PASSWORD, // Your email password
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: updatedUser.email, // Send email to the user's email address
            subject: 'Account Unblocked Notification - Smart Grocery',
            text: `Dear ${updatedUser.name},

We are pleased to inform you that your account on Smart Grocery has been successfully unblocked. 

You can now log in to your account and continue using our services without any restrictions. We value your presence in our community and appreciate your understanding during the time your account was blocked.

If you have any questions or need assistance, please do not hesitate to reach out to our support team at support@smartgrocery.com.

Thank you for choosing Smart Grocery!

Best regards,  
Smart Grocery Team  
support@smartgrocery.com  
www.smartgrocery.com`
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.json({ error: false, msg: 'User has been unblocked and notified via email', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, msg: 'An error occurred while unblocking the user' });
    }
});

module.exports = router;

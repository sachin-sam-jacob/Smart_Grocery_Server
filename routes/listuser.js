// routes/userRoutes.js
const express = require('express');
const  { User } = require('../models/user');
const { HomeBanner } = require('../models/homeBanner');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();
// 1. Fetch all users
router.get(`/`, async (req, res) => {
    try {
        const users = await User.find();
        if (!users) {
            res.status(500).json({ success: false })
        }
        return res.status(200).json(users);

    } catch (error) {
        res.status(500).json({ success: false })
    }

});

// // 2. View details of a specific user
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error while fetching user details." });
    }
});

// // 3. Block or unblock a user
// router.put('/users/:id/block', async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Toggle the isBlocked status
//         user.isBlocked = !user.isBlocked;
//         await user.save();
        
//         const status = user.isBlocked ? "blocked" : "unblocked";
//         res.status(200).json({ message: `User has been ${status}` });
//     } catch (err) {
//         res.status(500).json({ message: "Server error while updating user status." });
//     }
// });

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.PASSWORD // Your email password or app password
    }
});

// Function to send email notification
const sendEmail = (email, reason,name) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Account Blocked Notification - Smart Grocery',
        text: `Dear ${name},

We regret to inform you that your account on Smart Grocery has been temporarily blocked due to the following reason:

Reason: ${reason}

At Smart Grocery, we strive to provide a safe and secure environment for all our users. Unfortunately, certain activities associated with your account were found to be in violation of our terms and conditions.

Please note that during this period, you will not be able to access your account. If you believe this action was taken in error or if you would like to discuss the situation further, feel free to reach out to our support team at [support@smartgrocery.com].

We appreciate your understanding and cooperation.

Best regards,
Smart Grocery Team
[support@smartgrocery.com]
[www.smartgrocery.com]

`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error("Error sending email: ", error);
        }
        console.log('Email sent: ' + info.response);
    });
};

router.put('/:id/block', async (req, res) => {
    try {
        const userId = req.params.id;
        const { isBlocked, reason } = req.body;

        // Find the user by ID and update block status and reason
        const updatedUser = await User.findByIdAndUpdate(userId, {
            isBlocked: isBlocked,
            reason: isBlocked ? reason : null // Store reason only if blocked
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: true, msg: "User not found" });
        }

        // If user is blocked, send email notification
        if (isBlocked) {
            sendEmail(updatedUser.email, reason,updatedUser.name);
        }

        res.json({ error: false, msg: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully!`, user: updatedUser });
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ error: true, msg: "An error occurred while updating the user status." });
    }
});


module.exports = router;

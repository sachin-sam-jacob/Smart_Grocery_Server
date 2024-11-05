const express = require('express');
const router = express.Router();
const {User} = require('../models/user'); 
const nodemailer = require('nodemailer');
require('dotenv').config(); // Make sure you have dotenv to use environment variables

router.post('/', async (req, res) => {
    const { email } = req.body;
    console.log(email);

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send({ error: true, msg: 'Email id not registered' });
    }

    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetCode = resetCode;
    user.resetCodeExpiration = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Send email with nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL, 
            pass: process.env.PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Password Reset Code',
        text: `Your password reset code is ${resetCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send({ error: true, msg: 'Error sending email' });
        } else {
            return res.status(200).send({ error: false, msg: 'Verification code sent to your email.' });
        }
    });
});


module.exports = router;



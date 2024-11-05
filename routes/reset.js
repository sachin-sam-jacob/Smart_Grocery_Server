const express = require('express');
const router = express.Router();
const {User} = require('../models/user'); 
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ error: true, msg: 'Email not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.resetCode = undefined;
        user.resetCodeExpiration = undefined;
        await user.save();

        res.status(200).send({ error: false, msg: 'Password has been reset' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: true, msg: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const {User} = require('../models/user'); 

router.post('/', async (req, res) => {
    const { email, code } = req.body;

    const user = await User.findOne({ email, resetCode: code, resetCodeExpiration: { $gt: Date.now() } });
    if (!user) {
        return res.status(400).send({ error: true, msg: 'Invalid or expired code' });
    }

    res.status(200).send({ error: false, msg: 'Code verified' });
});

module.exports = router;
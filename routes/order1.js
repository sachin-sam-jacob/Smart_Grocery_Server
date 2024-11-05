const { Orders } = require('../models/orders');
const express = require('express');
const router = express.Router();
const {Product} = require('../models/products')


router.get('/:id', async (req, res) => {
    try {
        const order = await Orders.findById(req.params.id).populate('products.productId'); // Ensure to populate product details

        if (!order) {
            return res.status(404).json({ message: 'The order with the given ID was not found.' });
        }
        return res.status(200).send(order);
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while fetching the order.', error });
    }
});

module.exports = router;
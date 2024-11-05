const { Product } = require('../models/products.js');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const query = req.query.q;
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
        const rating = parseFloat(req.query.rating) || 0;

        if (!query) {
            return res.status(400).json({ msg: 'Query is required' });
        }

        const searchQuery = {
            $and: [
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { brand: { $regex: query, $options: 'i' } },
                        { catName: { $regex: query, $options: 'i' } }
                    ]
                },
                { price: { $gte: minPrice, $lte: maxPrice } },
                { rating: { $gte: rating } }
            ]
        };

        const items = await Product.find(searchQuery);

        console.log('Search query:', searchQuery);
        console.log('Results count:', items.length);

        res.json(items);
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;

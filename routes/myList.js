const { MyList } = require('../models/myList');
const express = require('express');
const router = express.Router();

// Get all items in the wishlist
router.get(`/`, async (req, res) => {
    try {
        const myList = await MyList.find(req.query);

        if (!myList) {
            return res.status(500).json({ success: false, message: 'No items found' });
        }

        return res.status(200).json(myList);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add item to the wishlist
router.post('/add', async (req, res) => {
    try {
        const { productId, userId, productTitle, image, rating, price } = req.body;
        const itemExists = await MyList.findOne({ productId, userId });

        if (itemExists) {
            return res.status(409).json({ success: false, message: "Product already added to My List" });
        }

        const list = new MyList({
            productTitle,
            image,
            rating,
            price,
            productId,
            userId,
        });

        const savedItem = await list.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete item from the wishlist
router.delete('/:id', async (req, res) => {
    try {
        const item = await MyList.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "The item with the given ID was not found!" });
        }

        const deletedItem = await MyList.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ success: false, message: 'Item not found!' });
        }

        res.status(200).json({ success: true, message: 'Item Removed from Wishlist!' });
    } catch (error) {
        console.error("Error deleting item from wishlist:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get a specific item in the wishlist by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await MyList.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'The item with the given ID was not found.' });
        }
        return res.status(200).json(item);
    } catch (error) {
        console.error("Error fetching item:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;

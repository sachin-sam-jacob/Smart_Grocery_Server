const { ProductReviews } = require('../models/productReviews');
const express = require('express');
const router = express.Router();


router.get(`/`, async (req, res) => {

    let  reviews=[];

    try {

        if(req.query.productId!==undefined && req.query.productId!==null && req.query.productId!=="" ){
            reviews = await ProductReviews.find({ productId: req.query.productId });
        }else{
            reviews = await ProductReviews.find();
        }


        if (!reviews) {
            res.status(500).json({ success: false })
        }

        return res.status(200).json(reviews);

    } catch (error) {
        res.status(500).json({ success: false })
    }


});

router.get('/get/count', async (req, res) => {
    try {
        
        const count = await ProductReviews.countDocuments(); // Adjust this line based on your model
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching product review count:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.get('/:id', async (req, res) => {

    const review = await ProductReviews.findById(req.params.id);

    if (!review) {
        res.status(500).json({ message: 'The review with the given ID was not found.' })
    }
    return res.status(200).send(review);
})




router.post('/add', async (req, res) => {
    
    let review = new ProductReviews({
        customerId: req.body.customerId,
        customerName: req.body.customerName,
        review:req.body.review,
        customerRating: req.body.customerRating,
        productId: req.body.productId
    });



    if (!review) {
        res.status(500).json({
            error: err,
            success: false
        })
    }


    review = await review.save();


    res.status(201).json(review);

});


router.put('/:id', async (req, res) => {
    try {
        const updatedReview = await ProductReviews.findByIdAndUpdate(
            req.params.id,
            {
                review: req.body.review,
                customerRating: req.body.customerRating
            },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json(updatedReview);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;

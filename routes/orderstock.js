const { Orders } = require('../models/orders');
const express = require('express');
const router = express.Router();
const products=require('../models/products');
const mongoose = require('mongoose');
const { CancelledOrder } = require('../models/cancelledOrders');
const { Product } = require('../models/products');
const District = require('../models/pincode');

router.get(`/`, async (req, res) => {
    try {
        const { district } = req.query;
        
        if (!district) {
            return res.status(400).json({ success: false, message: "District is required" });
        }

        // Find the district and its pincodes
        const districtData = await District.findOne({ name: district });
        
        if (!districtData) {
            return res.status(404).json({ success: false, message: "District not found" });
        }

        const districtPincodes = districtData.pincodes.map(p => p.code);

        // Find orders with matching pincodes
        const ordersList = await Orders.find({ pincode: { $in: districtPincodes } });

        if (!ordersList) {
            return res.status(500).json({ success: false });
        }

        return res.status(200).json(ordersList);

    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const order = await Orders.findById(req.params.id)
            .populate({
                path: 'products.productId',
                select: 'productTitle image price' // Specify the fields you want to retrieve
            });
            

        if (!order) {
            return res.status(404).json({ message: 'The order with the given ID was not found.' });
        }
        return res.status(200).send(order);
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred while fetching the order.', error });
    }
});

router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Orders.countDocuments()

    if(!orderCount) {
        res.status(500).json({success: false})
    } else{
        res.send({
            orderCount: orderCount
        });
    }
   
})



router.post('/create', async (req, res) => {

    let order = new Orders({
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        pincode: req.body.pincode,
        amount: req.body.amount,
        paymentId: req.body.paymentId,
        email: req.body.email,
        userid: req.body.userid,
        products: req.body.products,
    });



    if (!order) {
        res.status(500).json({
            error: err,
            success: false
        })
    }


    order = await order.save();


    res.status(201).json(order);

});


router.delete('/:id', async (req, res) => {

    const deletedOrder = await Orders.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
        res.status(404).json({
            message: 'Order not found!',
            success: false
        })
    }

    res.status(200).json({
        success: true,
        message: 'Order Deleted!'
    })
});


router.put('/:id', async (req, res) => {

    const order = await Orders.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            pincode: req.body.pincode,
            amount: req.body.amount,
            paymentId: req.body.paymentId,
            email: req.body.email,
            userid: req.body.userid,
            products: req.body.products,
            status:req.body.status
        },
        { new: true }
    )



    if (!order) {
        return res.status(500).json({
            message: 'Order cannot be updated!',
            success: false
        })
    }

    res.send(order);

})

router.post('/:id/cancel', async (req, res) => {
    console.log("Entered to the database");
    try {
        const order = await Orders.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order cannot be cancelled' });
        }

        // Update product stock
        for (const item of order.products) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { countInStock: item.quantity } }
            );
        }

        // Create cancelled order record
        const cancelledOrder = new CancelledOrder({
            orderId: order._id,
            userId: order.userid,
            reason: req.body.reason
        });
        await cancelledOrder.save();

        // Update order status
        order.status = 'cancelled';
        await order.save();

        // Here you would typically initiate a refund process
        // This is a placeholder for the actual refund logic
        console.log(`Refund initiated for order ${order._id}`);
        
        res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'An error occurred while cancelling the order', error: error.message });
    }
});

module.exports = router;

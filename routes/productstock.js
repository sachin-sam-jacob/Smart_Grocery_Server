const { Category } = require('../models/category.js');
const { Product } = require('../models/products.js');
const { RecentlyViewd } = require('../models/recentlyViewd.js');
const { ImageUpload } = require('../models/imageUpload.js');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require("fs");
const mongoose = require("mongoose");

const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true
});


var imagesArr = [];



const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
        //imagesArr.push(`${Date.now()}_${file.originalname}`)
        //console.log(file.originalname)

    },
})


const upload = multer({ storage: storage })

router.post(`/upload`, upload.array("images"), async (req, res) => {
    imagesArr = [];

    
    try {
        for (let i = 0; i < req .files?.length; i++) {

            const options = {
                use_filename: true,
                unique_filename: false,
                overwrite: false,
            };

            const img = await cloudinary.uploader.upload(req.files[i].path, options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${req.files[i].filename}`);
                });
        }

        let imagesUploaded = new ImageUpload({
            images: imagesArr,
        });

        imagesUploaded = await imagesUploaded.save();

        return res.status(200).json(imagesArr);

    } catch (error) {
        console.log(error);
    }


});


router.get(`/`, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 8;
        const location = req.query.location;
        const category = req.query.category;

        if (!location) {
            return res.status(400).json({ success: false, message: "Location is required" });
        }

        let query = { location: location };

        if (category && category !== 'all') {
            query.category = category;
        }

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / perPage);

        if (page > totalPages) {
            return res.status(404).json({ message: "Page not found" });
        }

        const productList = await Product.find(query)
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        return res.status(200).json({
            "products": productList,
            "totalPages": totalPages,
            "page": page,
            "totalProducts": totalProducts
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

router.get('/filterByPrice', async (req, res) => {
    const { minPrice, maxPrice, subCatId, category, location } = req.query;

    try {
        const query = {
            price: { $gte: Number(minPrice), $lte: Number(maxPrice) }
        };
        if (subCatId) {
            query.subCatId = subCatId;
        } else if (category) {
            query.category = category;
        }

        const products = await Product.find(query).exec();

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


router.get(`/listing`, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    let query = {};
    
    // Build the query based on filters
    if (req.query.location && req.query.location !== "All") {
        query.location = req.query.location;
    }
    if (req.query.catId) {
        query.catId = req.query.catId;
    }
    if (req.query.subCatId) {
        query.subCatId = req.query.subCatId;
    }
    if (req.query.minPrice && req.query.maxPrice) {
        query.price = { 
            $gte: parseFloat(req.query.minPrice), 
            $lte: parseFloat(req.query.maxPrice) 
        };
    }
    if (req.query.rating) {
        query.rating = { $gte: parseFloat(req.query.rating) };
    }

    try {
        const totalProducts = await Product.countDocuments(query);
        const productList = await Product.find(query)
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .lean()
            .exec();

        return res.status(200).json({
            products: productList,
            totalPages: Math.ceil(totalProducts / perPage),
            page: page,
            totalProducts: totalProducts
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Add this route for fetching a single product


router.get(`/get/count/:district`, async (req, res) => {
    try {
        const district = req.params.district;
        
        if (!district) {
            return res.status(400).json({ success: false, message: "District is required" });
        }

        const productsCount = await Product.countDocuments({ location: district });

        if (productsCount === undefined) {
            return res.status(500).json({ success: false, message: "Error counting products" });
        } 
        else {
            res.status(200).json({
                success: true,
                productsCount: productsCount
            });
        }
    } catch (error) {
        console.error("Error getting product count:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});




router.get(`/featured`, async (req, res) => {
    let productList="";
    if(req.query.location!==undefined && req.query.location!==null && req.query.location!=="All"){
        productList = await Product.find({ isFeatured: true, location:req.query.location });
    }
    else{
        productList = await Product.find({ isFeatured: true});
    }
   
    if (!productList) {
        res.status(500).json({ success: false })
    }

    return res.status(200).json(productList);
});


router.get(`/recentlyViewd`, async (req, res) => {
    let productList = [];
    productList = await RecentlyViewd.find(req.query).populate("category");

    if (!productList) {
        res.status(500).json({ success: false })
    }

    return res.status(200).json(productList);
});


router.post(`/recentlyViewd`, async (req, res) => {


    let findProduct = await RecentlyViewd.find({prodId:req.body.id});
  
    var product;

    if(findProduct.length===0){
        product = new RecentlyViewd({
            prodId:req.body.id,
            name: req.body.name,
            description: req.body.description,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            oldPrice: req.body.oldPrice,
            subCatId: req.body.subCatId,
            catName: req.body.catName,
            subCat: req.body.subCat,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            isFeatured: req.body.isFeatured,
            discount: req.body.discount,
            productRam: req.body.productRam,
            size: req.body.size,
            productWeight: req.body.productWeight,
    
        });

        product = await product.save();

        if (!product) {
            res.status(500).json({
                error: err,
                success: false
            })
        }
    
        res.status(201).json(product);
    }
 
});

router.post(`/create`, async (req, res) => {
    console.log(req.body.category)
    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(404).send("invalid Category!");
    }

    const images_Array = [];
    const uploadedImages = await ImageUpload.find();

    const images_Arr = uploadedImages?.map((item) => {
        item.images?.map((image) => {
            images_Array.push(image);
            console.log(image);
        })


    })


    product = new Product({
        name: req.body.name,
        description: req.body.description,
        images: images_Array,
        brand: req.body.brand,
        price: req.body.price,
        oldPrice: req.body.oldPrice,
        subCatId: req.body.subCatId,
        catId: req.body.catId,
        catName: req.body.catName,
        subCat: req.body.subCat,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        isFeatured: req.body.isFeatured,
        discount: req.body.discount,
        productRam: req.body.productRam,
        size: req.body.size,
        productWeight: req.body.productWeight,
        location: req.body.location!=="" ? req.body.location : "All",

    });


    product = await product.save();

    if (!product) {
        res.status(500).json({
            error: err,
            success: false
        })
    }

    imagesArr = [];

    res.status(201).json(product);
});


router.get('/:id', async (req, res) => {
    productEditId = req.params.id;
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
        res.status(500).json({ message: 'The product with the given ID was not found.' })
    }
    return res.status(200).send(product);
})


router.delete('/deleteImage', async (req, res) => {
    const imgUrl = req.query.img;

    // console.log(imgUrl)

    const urlArr = imgUrl.split('/');
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split('.')[0];


    const response = await cloudinary.uploader.destroy(imageName, (error, result) => {

    })

    if (response) {
        res.status(200).send(response);
    }

});


router.delete('/:id', async (req, res) => {

    const product = await Product.findById(req.params.id);
    const images = product.images;

    for (img of images) {
        const imgUrl = img;
        const urlArr = imgUrl.split('/');
        const image = urlArr[urlArr.length - 1];

        const imageName = image.split('.')[0];

        if (imageName) {
            cloudinary.uploader.destroy(imageName, (error, result) => {
                // console.log(error, result);
            })
        }

        //  console.log(imageName)
    }


    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
        res.status(404).json({
            message: 'Product not found!',
            success: false
        })
    }

    res.status(200).json({
        success: true,
        message: 'Product Deleted!'
    })
})


router.put('/:id', async (req, res) => {

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            subCat: req.body.subCat,
            description: req.body.description,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            oldPrice: req.body.oldPrice,
            catId: req.body.catId,
            subCatId: req.body.subCatId,
            catName: req.body.catName,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
            productRam: req.body.productRam,
            size: req.body.size,
            productWeight: req.body.productWeight,
            location: req.body.location,
        },
        { new: true }
    );


    if (!product) {
        res.status(404).json({
            message: 'the product can not be updated!',
            status: false
        })
    }

    imagesArr = [];

    res.status(200).json({
        message: 'the product is updated!',
        status: true
    });

    //res.send(product);

})
router.post('/updateStock', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        await Product.findByIdAndUpdate(
            productId,
            { $inc: { countInStock: -quantity } }
        );
        res.status(200).json({ message: 'Stock updated successfully' });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'Error updating stock', error: error.message });
    }
});


router.post('/updateStockadmin', async (req, res) => {
    try {

        const { productId } = req.body;
        console.log("Received request to set stock to 0 for product ID:", req.body.productId);
        // Set the stock to 0 instead of deleting the product
        await Product.findByIdAndUpdate(
            productId,
            { countInStock: 0 } // Directly set countInStock to 0
        );
        res.status(200).json({ message: 'Product stock set to 0 successfully' });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'Error updating stock', error: error.message });
    }
});

module.exports = router;

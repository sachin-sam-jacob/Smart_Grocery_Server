const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());
app.use(express.json());


//Routes
const userRoutes = require('./routes/user.js');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const imageUploadRoutes = require('./helper/imageUpload.js');
const productWeightRoutes = require('./routes/productWeight.js');
const productRAMSRoutes = require('./routes/productRAMS.js');
const productSIZESRoutes = require('./routes/productSize.js');
const productReviews = require('./routes/productReviews.js');
const cartSchema = require('./routes/cart.js');
const myListSchema = require('./routes/myList.js');
const ordersSchema = require('./routes/orders.js');
const homeBannerSchema = require('./routes/homeBanner.js');
const searchRoutes = require('./routes/search.js');
const forgotpass = require('./routes/Forgotpassword.js');
const resetPassword = require('./routes/reset.js');
const verifycode = require('./routes/verifycode.js');
const listusers = require('./routes/listuser.js');
const blockedUsers = require('./routes/blocked.js');
const orders1 = require('./routes/order1.js');
const StockManager=require('./routes/stockManager.js');
const Pincode=require('./routes/pincode.js');
const Productsstock=require('./routes/productstock.js');
const OrderStock=require('./routes/orderstock.js');

app.use("/api/verifycode",verifycode);
app.use("/api/resetpassword", resetPassword);
app.use("/api/user",userRoutes);
app.use("/uploads",express.static("uploads"));
app.use(`/api/category`, categoryRoutes);
app.use(`/api/products`, productRoutes);
app.use(`/api/imageUpload`, imageUploadRoutes);
app.use(`/api/productWeight`, productWeightRoutes);
app.use(`/api/productRAMS`, productRAMSRoutes);
app.use(`/api/productSIZE`, productSIZESRoutes);
app.use(`/api/productReviews`, productReviews);
app.use(`/api/cart`, cartSchema);
app.use(`/api/my-list`, myListSchema);
app.use(`/api/orders`, ordersSchema);
app.use(`/api/homeBanner`, homeBannerSchema);
app.use(`/api/search`, searchRoutes);
app.use('/api/forgotpassword', forgotpass);
app.use(`/api/listusers`,listusers);
app.use(`/api/blocked`, blockedUsers);
app.use(`/api/orders1`, orders1);
app.use(`/api/stockManagers`,StockManager);
app.use(`/api/pincodes`,Pincode);
app.use(`/api/product`,Productsstock);
app.use(`/api/order`,OrderStock);
//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Database Connection is ready...');
        //Server
        app.listen(process.env.PORT, () => {
            console.log(`server is running http://localhost:${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log(err);
    })
     // Make sure you have dotenv to use environment variables

    // app.post('/forgot', async (req, res) => {
    //     const { email } = req.body;
    //     console.log(email);
    //     try {
    //         const user = await User.findOne({ email: email });
    //         if (!user) {
    //             return res.status(400).json({ message: 'Email ID not registered.' });
    //         }
    //         else{
    //         const code = Math.floor(1000 + Math.random() * 9000).toString();
    //         user.resetCode = code;
    //         user.resetCodeExpiration = Date.now() + 3600000; // Code valid for 1 hour
    //         await user.save();
    
    //         // Setup email transport
    //         const transporter = nodemailer.createTransport({
    //             service: 'gmail',
    //             auth: {
    //                 user: process.env.EMAIL_USER, // Use environment variables
    //                 pass: process.env.EMAIL_PASS, // Use environment variables
    //             },
    //         });
    
    //         // Send email
    //         await transporter.sendMail({
    //             from: process.env.EMAIL_USER,
    //             to: email,
    //             subject: 'Password Reset Code',
    //             text: `Your password reset code is: ${code}`,
    //         });
    
    //         res.status(200).json({ message: 'Reset code sent to your email.' });
    //     }
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ message: 'An error occurred. Please try again.' });
    //     }
    // });
    
    
    
    
    
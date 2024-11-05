const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String
        // unique:true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    reason: {
        type: String,
        default: ''
    },
    resetCode: {
        type: String,
        default: ''
    },
    resetCodeExpiration: {
        type: Date,
        default: Date.now
    },
    isStockManager:{
        type:Boolean,
        default:false,
    },
    location:{
        type:String,
        default:''
    },
    role: {
        type: String,
        default: 'customer'
      }
});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;

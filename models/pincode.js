// models/District.js
const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    pincodes: [{
      code: {
        type: String,
        required: true,
      },
      place: {
        type: String,
        required: true,
      }
    }],
  }, { timestamps: true });

module.exports = mongoose.model('District', districtSchema);
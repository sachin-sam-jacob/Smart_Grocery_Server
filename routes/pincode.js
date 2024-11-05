// routes/pincode.js
const express = require('express');
const router = express.Router();
const District = require('../models/pincode');

// Add new pincode
router.post('/add', async (req, res) => {
    console.log("entered",req.body);
  try {
    const { pincode, place, district } = req.body;

    let districtDoc = await District.findOne({ name: district });

    if (!districtDoc) {
      districtDoc = new District({
        name: district,
        pincodes: [{ code: pincode, place:place }],
      });
    } 
    else 
    {
      if (districtDoc.pincodes.some(p => p.code === pincode)) {
        return res.status(400).json({ message: 'Pincode already exists for this district' });
      }
      districtDoc.pincodes.push({ code: pincode, place });
    }

    await districtDoc.save();
    res.status(201).json({ message: 'Pincode and Place added successfully', district: districtDoc });
  } catch (error) {
    res.status(500).json({ message: 'Error adding pincode and place', error: error.message });
  }
});

// Get pincodes for a specific district
router.get('/list/:district', async (req, res) => {
    console.log("entered",req.params);
  try {
    const { district } = req.params;
    const districtDoc = await District.findOne({ name: district });
    if (!districtDoc) {
      return res.status(404).json({ message: 'No pincodes found for this district' });
    }
    res.json(districtDoc);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pincodes', error: error.message });
  }
});

router.delete('/:district/:pincode', async (req, res) => {
    try {
      const { district, pincode } = req.params;
      
      const districtDoc = await District.findOne({ name: district });
      
      if (!districtDoc) {
        return res.status(404).json({ message: 'District not found' });
      }
      
      const pincodeIndex = districtDoc.pincodes.findIndex(p => p.code === pincode);
      
      if (pincodeIndex === -1) {
        return res.status(404).json({ message: 'Pincode not found in this district' });
      }
      
      districtDoc.pincodes.splice(pincodeIndex, 1);
      await districtDoc.save();
      
      res.json({ message: 'Pincode deleted successfully', district: districtDoc });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting pincode', error: error.message });
    }
  });

router.post('/:district/:oldPincode', async (req, res) => {
    console.log("Entered the base", req.body);
    console.log(req.params);
    try {
        const { district, oldPincode } = req.params;
        const { newPincode, newPlace } = req.body;

        const districtDoc = await District.findOne({ name: district });

        if (!districtDoc) {
            return res.status(404).json({ message: 'District not found' });
        }

        const pincodeIndex = districtDoc.pincodes.findIndex(p => p.code === oldPincode);

        if (pincodeIndex === -1) {
            return res.status(404).json({ message: 'Pincode not found in this district' });
        }

        // Check if the new pincode already exists (if it's different from the old one)
        if (newPincode !== oldPincode && districtDoc.pincodes.some(p => p.code === newPincode)) {
            return res.status(400).json({ message: 'New pincode already exists in this district' });
        }

        // Update the pincode
        districtDoc.pincodes[pincodeIndex] = {
            code: newPincode,
            place: newPlace
        };

        await districtDoc.save();

        res.json({ message: 'Pincode updated successfully', district: districtDoc });
    } catch (error) {
        res.status(500).json({ message: 'Error updating pincode', error: error.message });
    }
});

// Add this new route
router.get('/check/:pincode', async (req, res) => {
    try {
      console.log("Entered")
        const { pincode } = req.params;
        
        // Input validation
        if (!pincode || pincode.length !== 6) {
            return res.json({
                error: true,
                msg: 'Please enter a valid 6-digit pincode'
            });
        }

        const district = await District.findOne({
            'pincodes.code': pincode
        });

        if (district) {
            const pincodeDetails = district.pincodes.find(p => p.code === pincode);
            return res.json({
                error: false,
                found: true,
                district: district.name,
                place: pincodeDetails.place,
                msg: 'Delivery available to this location'
            });
        } else {
            return res.json({
                error: false,
                found: false,
                msg: 'This pincode is not serviceable'
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        return res.json({
            error: true,
            msg: 'Error checking pincode'
        });
    }
});

module.exports = router;

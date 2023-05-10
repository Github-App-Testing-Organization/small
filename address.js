const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const Address = require('../../models/address');
const auth = require('../../middleware/auth');
const tlib = require('../../config/tlib');

// add address api
router.post('/add', auth, async (req, res) => {
  try {
    const user = req.user;

    const address = new Address({
      ...req.body,
      user: user._id
    });
    const addressDoc = await address.save();

    let parsedAddress = {
      address: addressDoc.address,
      city: addressDoc.city,
      state: addressDoc.state,
      zip: addressDoc.zipCode,
    }

    tlib.referencer().dataCreated("address").value(JSON.stringify(parsedAddress)).log();
    res.status(200).json({
      success: true,
      message: `Address has been added successfully!`,
      address: addressDoc
    });

  } catch (error) {
    console.log(error)

    res.status(400).json({
      error: error
    });
  }
});

// fetch all addresses api
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    for (address of addresses) {
      let parsedAddress = {
        address: address.address,
        city: address.city,
        state: address.state,
        zip: address.zipCode,
      }
      tlib.dataUsed("address", "Used to either populate the list addresses a user can be used as part of ship to, or used for the user admin dashboard")
        .value(JSON.stringify(parsedAddress))
        .log();

    }
    res.status(200).json({
      addresses
    });

  } catch (error) {
    res.status(400).json({
      error: error
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const addressId = req.params.id;
    const addressDoc = await Address.findOne({ _id: addressId });

    if (!addressDoc) {
      res.status(404).json({
        message: `Cannot find Address with the id: ${addressId}.`
      });
    }

    let parsedAddress = {
      address: addressDoc.address,
      city: addressDoc.city,
      state: addressDoc.state,
      zip: addressDoc.zipCode,
    }

    tlib.dataUsed("address", "Address fetched as part of looking at an order")
        .value(JSON.stringify(parsedAddress))
        .log();

    res.status(200).json({
      address: addressDoc
    });

  } catch (error) {
    res.status(400).json({
      error: error
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const addressId = req.params.id;
    const update = req.body;
    const query = { _id: addressId };

    await Address.findOneAndUpdate(query, update, {
      new: true
    });

    let parsedAddress = {
      address: update.address,
      city: update.city,
      state: update.state,
      zip: update.zipCode,
    }

    tlib.referencer().dataCreated("address").value(JSON.stringify(parsedAddress)).log();


    res.status(200).json({
      success: true,
      message: 'Address has been updated successfully!'
    });

  } catch (error) {

    res.status(400).json({
      error: error
    });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const address = await Address.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: `Address has been deleted successfully!`,
      address
    });
  } catch (error) {
    console.log(error)

    res.status(400).json({
      error: error
    });
  }
});

module.exports = router;

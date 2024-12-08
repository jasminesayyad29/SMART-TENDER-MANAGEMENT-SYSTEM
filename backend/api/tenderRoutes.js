const express = require('express');
const Tender = require('../models/Tender');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {login , signup} = require("../controllers/Auth") ;
const jwt= require("jsonwebtoken") ;
const mongoose = require("mongoose");

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// Create a new tender
router.post('/', upload.single('document'), async (req, res) => {
  try {
    const {
      email,
      title,
      eligibility,
      description,
      type,
      status,
      startDate,
      endDate,
      materials,
      quantity,
      TenderPropAmount,
      Totalquotation,
    } = req.body;

    const document = req.file ? req.file.path : ''; // Get the uploaded document path

    // Parse the JSON strings received from the front-end
    const parsedMaterials = JSON.parse(materials);
    const parsedQuantities = JSON.parse(quantity);
    const parsedTenderPropAmount = JSON.parse(TenderPropAmount);

    // Create the tender object
    const newTender = new Tender({
      email,
      title,
      eligibility,
      description,
      type,
      status,
      startDate,
      endDate,
      document, // Save the document path
      materials: parsedMaterials, // Use parsed materials
      quantity: parsedQuantities, // Use parsed quantities
      TenderPropAmount: parsedTenderPropAmount, // Use parsed TenderPropAmount
      Totalquotation, // TotalQuotation remains a string/number
    });

    await newTender.save();
    res.status(201).json(newTender); // Respond with the newly created tender
  } catch (error) {
    console.error('Error creating tender:', error);
    res.status(500).json({ message: 'Error creating tender', error });
  }
});

// Fetch all tenders
router.get('/', async (req, res) => {
  try {
    const tenders = await Tender.find(); // Fetch all tenders
    res.status(200).json(tenders); // Respond with the list of tenders
  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ message: 'Error fetching tenders', error });
  }
});



// Delete a tender by ID
const {auth , isBidder, isAdmin} = require("../middlewares/auth") ;

router.delete('/', async (req, res) => {
  try {
    const { id } = req.body; // Get the ID from the request body

    // Find and delete the tender by ID
    const tender = await Tender.findByIdAndDelete(id);

    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    res.status(200).json({ message: 'Tender deleted successfully' }); // Respond with success message
  } catch (error) {
    console.error('Error while deleting tender:', error);
    res.status(500).json({ message: 'Error deleting tender', error });
  }
});


// Fetch tenders by email
router.get('/:email', async (req, res) => {
  try {
      const { email } = req.params; // Extract email from request parameters
      const tenders = await Tender.find({ email }); // Use find to search by email
      if (!tenders || tenders.length === 0) {
          return res.status(404).json({ message: 'No tenders found for this email' });
      }
      res.json(tenders); // Respond with the list of tenders
  } catch (error) {
      console.error('Error fetching tenders by email:', error);
      res.status(500).json({ message: 'Error fetching tenders', error });
  }
});

// Update an existing tender
router.put('/:id', upload.single('document'), async (req, res) => {
  try {
    const {
      email,
      title,
      eligibility,
      description,
      type,
      status,
      startDate,
      endDate,
      materials,
      quantity,
      TenderPropAmount,
      Totalquotation,
    } = req.body;

    const document = req.file ? req.file.path : ''; // Get the uploaded document path (if any)

    // Parse the JSON strings received from the front-end
    const parsedMaterials = JSON.parse(materials);
    const parsedQuantities = JSON.parse(quantity);
    const parsedTenderPropAmount = JSON.parse(TenderPropAmount);

    // Find the tender by its ID and update it
    const updatedTender = await Tender.findByIdAndUpdate(
      req.params.id, // ID from the URL parameter
      {
        email,
        title,
        eligibility,
        description,
        type,
        status,
        startDate,
        endDate,
        document, // Update the document path
        materials: parsedMaterials, // Update materials
        quantity: parsedQuantities, // Update quantities
        TenderPropAmount: parsedTenderPropAmount, // Update TenderPropAmount
        Totalquotation, // Update TotalQuotation
      },
      { new: true } // Return the updated document
    );

    if (!updatedTender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    res.status(200).json(updatedTender); // Respond with the updated tender
  } catch (error) {
    console.error('Error updating tender:', error);
    res.status(500).json({ message: 'Error updating tender', error });
  }
});


// Fetch tender by tenderId (since tenderId is unique)
router.get('/id/:id', async (req, res) => {
  try {
    const tenderId = req.params.id; // Extract tenderId from request parameters
    console.log("tenderId:", tenderId);
    console.log("type of id:", typeof(tenderId));

    // Convert the tenderId string to an ObjectId
    const tenderObjectId = new mongoose.Types.ObjectId(tenderId);

    // Use findOne to search for a single tender by tenderId
    const tender = await Tender.findOne({ _id: tenderObjectId }); // _id is the default field for ObjectId in MongoDB

    console.log(tender); // Log the found tender

    if (!tender) {
      return res.status(404).json({ message: 'No tender found for this tenderId' });
    }

    res.json(tender); // Respond with the tender
  } catch (error) {
    console.error('Error fetching tender by tenderId:', error);
    res.status(500).json({ message: 'Error fetching tender', error });
  }
});




module.exports = router; // Export the router

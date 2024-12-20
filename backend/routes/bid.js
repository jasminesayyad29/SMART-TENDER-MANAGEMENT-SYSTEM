
const express = require('express');
const multer = require('multer');
const Bid = require('../models/Bid');
const BidEvaluation = require('../models/BidEvaluation'); // Import the new BidEvaluation model
const mongoose = require('mongoose');
const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 'uploads/' directory must exist
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});
const upload = multer({ storage });

// 1. POST route to submit a bid (bidder submission)
router.post('/bids', upload.single('file'), async (req, res) => {
    try {
        const {
            tenderId,
            bidderName,
            companyName,
            companyRegNumber,
            email,
            phoneNumber,
            bidAmount,
            description,
            additionalNotes,
            expiryDate,
            BidderPropAmount // Can be a JSON string or an array
        } = req.body;

        // Log all incoming fields
        console.log('Received Data:', {
            tenderId,
            bidderName,
            companyName,
            companyRegNumber,
            email,
            phoneNumber,
            bidAmount,
            description,
            additionalNotes,
            expiryDate,
            BidderPropAmount,
            file: req.file ? req.file.path : null,
        });

        // Check for missing fields
        const missingFields = [];
        if (!tenderId) missingFields.push('tenderId');
        if (!bidderName) missingFields.push('bidderName');
        if (!companyName) missingFields.push('companyName');
        if (!email) missingFields.push('email');
        if (!phoneNumber) missingFields.push('phoneNumber');
        if (!bidAmount) missingFields.push('bidAmount');
        if (!description) missingFields.push('description');
        if (!BidderPropAmount) missingFields.push('BidderPropAmount');

        if (missingFields.length > 0) {
            return res
                .status(400)
                .json({ message: `Missing required fields: ${missingFields.join(', ')}` });
        }

        // Handle BidderPropAmount parsing
        let parsedBidderPropAmount;
        if (typeof BidderPropAmount === 'string') {
            try {
                parsedBidderPropAmount = JSON.parse(BidderPropAmount);
            } catch (err) {
                return res.status(400).json({ message: 'Invalid BidderPropAmount format' });
            }
        } else if (Array.isArray(BidderPropAmount)) {
            parsedBidderPropAmount = BidderPropAmount;
        } else {
            return res.status(400).json({ message: 'BidderPropAmount must be a JSON string or an array' });
        }

        // Validate that the parsed BidderPropAmount is an array of numbers
        if (!Array.isArray(parsedBidderPropAmount) || parsedBidderPropAmount.some(isNaN)) {
            return res.status(400).json({ message: 'BidderPropAmount must be an array of numbers' });
        }

        // Create new bid instance with required and additional fields
        const bid = new Bid({
            tenderId,
            bidderName,
            companyName,
            companyRegNumber,
            email,
            phoneNumber,
            bidAmount,
            description,
            additionalNotes,
            expiryDate,
            filePath: req.file ? req.file.path : null,
            BidderPropAmount: parsedBidderPropAmount,
        });

        // Save bid to the database
        await bid.save();
        res.status(201).json({ message: 'Bid submitted successfully', bid });

    } catch (error) {
        console.error('Error submitting bid:', error);
        res.status(500).json({ message: 'Failed to submit bid', error: error.message });
    }
});



// 2. GET route to fetch all bids (admin evaluation dashboard)
router.get('/bids/:bidderId', async (req, res) => {
    let bidderId  = req.params.bidderId; 
    bidderId = bidderId.trim();
    try {
        const bid = await Bid.find({ _id: bidderId });
        if (!bid) {
          return res.status(404).json({ message: 'Bid not found' });
        }
        res.status(200).json(bid);
      } catch (error) {
        console.error('Error fetching bid:', error);
        res.status(500).json({ message: 'Failed to fetch bid', error: error.message });
    }
});

router.get('/bids', async (req, res) => {
    try {
        const bid = await Bid.find();
        res.status(200).json(bid);
      } catch (error) {
        console.error('Error fetching bid:', error);
        res.status(500).json({ message: 'Failed to fetch bid', error: error.message });
    }
});

// 3. POST route to add a new evaluation for a bid
router.post('/bids/:id/evaluation', async (req, res) => {
    const { id } = req.params;
    const { evaluationScore = null, comments = '', evaluationStatus = '' } = req.body;

    try {
        // Check if the bid exists
        const bid = await Bid.findById(id);
        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }

        // Create and save the evaluation with all defaults as empty values
        const evaluation = new BidEvaluation({
            bidId: id,
            comments,
            evaluationScore,
            evaluationStatus,
        });

        await evaluation.save();
        res.status(201).json({
            message: 'Bid evaluation created successfully',
            evaluation,
        });
    } catch (error) {
        console.error('Error creating evaluation:', error);
        res.status(500).json({
            message: 'Failed to create evaluation',
            error: error.message,
        });
    }
});


//get the evaluated bids 

// GET route to fetch the evaluation for a specific bid by bidId
router.get('/bids/:id/evaluation', async (req, res) => {
    const { id } = req.params;

    try {
        const evaluation = await BidEvaluation.findOne({ bidId: id });

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found for this bid' });
        }

        res.status(200).json(evaluation);
    } catch (error) {
        console.error('Error fetching evaluation:', error);
        res.status(500).json({ message: 'Failed to fetch evaluation', error: error.message });
    }
});


// Update evaluation status for a bid
router.put('/bids/:bidId/evaluation', async (req, res) => {
    const { bidId } = req.params;
    const { evaluationStatus } = req.body;  // Accept only evaluationStatus

    try {
        // Find the BidEvaluation by bidId and update only the evaluationStatus
        const updatedEvaluation = await BidEvaluation.findOneAndUpdate(
            { bidId },  // Find by bidId
            { evaluationStatus },  // Only update evaluationStatus
            { new: true }  // Return the updated document
        );

        if (!updatedEvaluation) {
            return res.status(404).json({ message: 'Bid not found' });
        }

        res.status(200).json({ message: 'Evaluation status updated successfully', updatedEvaluation });
    } catch (error) {
        console.error('Error updating evaluation status:', error);
        res.status(500).json({ message: 'Failed to update evaluation status', error: error.message });
    }
});


// 2. GET route to fetch a bid by ObjectId (for admin evaluation dashboard)
router.get('/bids/id/:bidderId', async (req, res) => {
    const bidderId = req.params.bidderId.trim();
    try {
        const bid = await Bid.findById(bidderId); // Find by _id
        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }
        res.status(200).json(bid);
    } catch (error) {
        console.error('Error fetching bid:', error);
        res.status(500).json({ message: 'Failed to fetch bid', error: error.message });
    }
});

// 2b. GET route to fetch bids by email (for specific user bids)
router.get('/bids/email/:email', async (req, res) => {
    try {
        const email = req.params.email.trim();
        const bids = await Bid.find({ email: email }); // Find by email field
        if (!bids || bids.length === 0) {
            return res.status(404).json({ message: 'No bids found for this email' });
        }
        res.status(200).json(bids);
    } catch (error) {
        console.error('Error fetching bids by email:', error);
        res.status(500).json({ message: 'Error fetching bids', error });
    }
});

router.put('/bids/:id', async (req, res) => {
    try {
        const { ratings, comments } = req.body;
        const updatedBid = await Bid.findByIdAndUpdate(
            req.params.id,
            { $set: { ratings, comments } },
            { new: true }
        );

        if (!updatedBid) {
            return res.status(404).send('Bid not found');
        }

        res.status(200).json(updatedBid);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update bid');
    }
});

// 2c. GET route to fetch bids by tenderId (for fetching bids based on a specific tender)
router.get('/bids/tender/:tenderId', async (req, res) => {
    try {
        const tenderId = req.params.tenderId.trim();
        console.log( typeof(req.params.tenderId) );
        console.log("typeof" , typeof(tenderId));

        const tenderObjectId = new mongoose.Types.ObjectId(tenderId);
        const bids = await Bid.find({ tenderId: tenderObjectId });
        console.log("backend running okk");
        if (!bids || bids.length === 0) {
            return res.status(404).json({ message: 'No bids found for this tender' });
        }
        res.status(200).json(bids);
    } catch (error) {
        console.error('Error fetching bids by tenderId:', error);
        res.status(500).json({ message: 'Failed to fetch bids by tenderId', error: error.message });
    }
});

module.exports = router;

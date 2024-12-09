const mongoose = require('mongoose');

// Ensure the 'Bid' model is not redefined if already compiled
const Bid = mongoose.models.Bid || require('./Bid');  // Import the existing 'Bid' model if already compiled

const bidEvaluationSchema = new mongoose.Schema({
    bidId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Bid', // This links to the 'Bid' model
        required: true 
    },
    comments: { type: String, default:''}, // Single comment field for simplicity
    evaluationScore:{
        type: Number
    },
    evaluationStatus:{
        type: String
    },
    createdAt: { type: Date, default: Date.now }
});

// Check if the 'BidEvaluation' model is already compiled
const BidEvaluation = mongoose.models.BidEvaluation || mongoose.model('BidEvaluation', bidEvaluationSchema);

module.exports = BidEvaluation;

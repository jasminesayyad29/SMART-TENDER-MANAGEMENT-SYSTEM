// src/models/Tender.js
const { required } = require('joi');

// src/models/Tender.js
const mongoose = require('mongoose');

// Define the schema for Tender
const tenderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true  // Title is required
  },
  eligibility: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true  // Description is required
  },
  type: {
    type: String,
    required: true  // Type is required
  },
  status: {
    type: String,
    default: 'Active'  // Default status is Active
  },
  document: {
    type: String  // This will store the path to the uploaded document
  },
  startDate: {
    type: Date,
    required: true  // Start date is required
  },
  endDate: {
    type: Date,
    required: true  // End date is required
  },
  materials: {
    type: [String],  // Array of strings
    required: true
  },
  quantity: {
    type: [Number],  // Array of numbers
    required: true
  },
  TenderPropAmount: {
    type: [Number],  // Array of numbers
    required: true
  },
  Totalquotation: {
    type: String,
    required: true
  }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// Create a model from the schema
const Tender = mongoose.model('Tender', tenderSchema);

// Export the model
module.exports = Tender;

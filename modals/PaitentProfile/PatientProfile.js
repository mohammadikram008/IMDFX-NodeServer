// Import necessary modules
const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({

  image: { type: String, required: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  email: { type: String, required: true, unique: true },
  mobile: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String },
  // Add more fields as needed
});

// Create the User model
const PatientProfile = mongoose.model('PatientProfile', userSchema);

// Export the User model
module.exports = {PatientProfile};

const mongoose = require('mongoose');

const Prescription = new mongoose.Schema({
    userId: { type: String, required: true },
    doc_id: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: String, required: true },
    days: { type: String, required: true },
    morning: { type: Boolean, default: false },
    afternoon: { type: Boolean, default: false },
    evening: { type: Boolean, default: false },
    night: { type: Boolean, default: false },
    // date:{ type: String, required: false }

});

const Prescriptions = mongoose.model('Prescription', Prescription);

module.exports = { Prescriptions };
const mongoose = require('mongoose')

const bookappointment = new mongoose.Schema({
    doc_id: { type: String, required: false },
    userId: { type: String, required: false },
    bookingType: { type: String, required: false },
    gender: { type: String, required: false },
    patientAge: { type: String, required: false },
    expiryYear: { type: String, required: false },
    expiryMonth: { type: String, required: false },
    cvv: { type: String, required: false },
    cardNumber: { type: String, required: false },
    cardName: { type: String, required: false },
    cardType: { type: String, required: false },
    selectedDate: { type: String, required: false },
    selectedTimeSlot: { type: String, required: false },
    bookingDate: { type: String, required: false },
})
const BookingAppointment = mongoose.model("BOOKINGAPPOINTMENT", bookappointment);
module.exports = { BookingAppointment };

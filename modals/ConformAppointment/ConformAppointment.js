const mongoose = require('mongoose')

const Conformappointment = new mongoose.Schema({
    docId: { type: String, required: true },
    userId: { type: String, required: true },
   
})
const ConformAppointment = mongoose.model("CONFORMAPPOINTMENT", Conformappointment);
module.exports = { ConformAppointment };

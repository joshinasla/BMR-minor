var mongoose = require('mongoose');

const DoctorSchema = mongoose.Schema({
    id: String,
    doctorName: String,
    NMCNumber: String,
    qualification: String,
    speciality: String
    
})

module.exports = mongoose.model('Doctor', DoctorSchema);
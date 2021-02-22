var mongoose = require('mongoose');

const DoctorSchema = mongoose.Schema({
    id: String,
    doctorName: String,
    description: String
    
})

module.exports = mongoose.model('Doctor', DoctorSchema);
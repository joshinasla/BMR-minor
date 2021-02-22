const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
	// type: {
    //     type: String,
	// 	// enum: ['DEBIT', 'CREDIT'],
	// 	// default: 'DEBIT'
	// 	enum: ['DOCTOR','PATIENTS']
	// },
	// id:{
	// 	type: String,
	// 	required: true,
	// },
	doctorName: {
		type: String,
		required: true,
	},
	patientName: {
		type: String,
		required: true,
	},
	hospitalName: {
	 	type: String,
	 	required: false,
    },
    // address: {
    //     type: String,
    //     required: true,
    // },
    // telephone: {
    //     type: String,
    //     default: false
    // },
	height: {
		type: String,
		required: true,
	},
	weight: {
		type:String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	}
	// d_id:{
	// 	type:String,
	// 	required:true,
	// }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

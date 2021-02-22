const User = require('../models/User');

exports.createMr = async (req, _res, next) => {
	try {
		const { patientName, hospitalName,height,weight, description } = req.body;

		req.user = await User.create({
			type: 'Mr',
			doctorName: process.env.MSPID,
			patientName: patientName,
			hospitalName: hospitalName,
			height: height,
			weight: weight,
			description: description
		});

		req.blockchainFunc = 'CreateReport';

		return next();
	} catch (error) {
		console.log("error in report controller")
		return next(error);
	}
};

// exports.getMrById = async (req, _res, next) => {
// 	try {
// 		const { id } = req.query;

// 		req.user = await User.findById(id);

// 		req.blockchainFunc = 'ReadReport';

// 		return next();
// 	} catch (error) {
// 		return next(error);
// 	}
// };

// exports.getMrs = async (req, _res, next) => {
// 	try {
// 		req.user = await User.find({});

// 		req.blockchainFunc = 'GetAllReports';

// 		return next();
// 	} catch (error) {
// 		return next(error);
// 	}
// };

// exports.getUsersByType = async (req, _res, next) => {
// 	try {
// 		req.user = await User.find({ Type: req.params.type });

// 		req.blockchainFunc = 'ReadReportFromUser';

// 		req.query.id = req.params.type;

// 		return next();
// 	} catch (error) {
// 		return next(error);
// 	}
// };
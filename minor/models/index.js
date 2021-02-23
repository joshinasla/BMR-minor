const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.login = require("./login.model");
db.role = require("./role.model");

db.ROLES = ["patient", "admin", "doctor"];

module.exports = db;
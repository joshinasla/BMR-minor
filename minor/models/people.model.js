const mongoose= require('mongoose');

const People = mongoose.model(
    "People",
    new mongoose.Schema({
        username: String,
        email: String,
        password: String,
        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"Role"
            }
        ]
    })
)

module.exports = People;
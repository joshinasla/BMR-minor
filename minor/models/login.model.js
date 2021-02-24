const mongoose= require('mongoose');

const Login = mongoose.model(
    "Login",
    new mongoose.Schema({
        email: { type: String, required: true, unique: true, match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/},  
        password: {type: String, required : true},
        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"Role"
            }
        ]
    })
)

module.exports = Login;
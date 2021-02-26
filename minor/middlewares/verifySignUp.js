const User = require('../models/User');

checkDuplicateUsernameOrEmail = (req,res, next) => {
    console.log("body",JSON.stringify(req.body))
    //Email
    User.findOne({
        email: req.body.email
    }).exec((err,login) => {
        if(err){
            res.status(500).send({message:err});
            return;
        }
        if (login) {
            res.status(400).send({ message: "Failed! Email is already in use!" });
            return;
        }
        next();
    })    
}

const verifySignUp = {
    checkDuplicateUsernameOrEmail
};
  
module.exports = verifySignUp;
const config = require("../config/auth.config");
const db = require("../models");
const Login = db.login;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { user } = require("./responseController");


exports.signup = (req, res) => {
  const login = new Login({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  login.save((err, login) => {
    if (err) {
      res.render('404');
      return;
    }

    // if (req.body.roles) {
    //   Role.find(
    //     {
    //       name: { $in: req.body.roles }
    //     },
    //     (err, roles) => {
    //       if (err) {
    //         res.status(500).send({ message: err });
    //         return;
    //       }

    //       login.roles = roles.map(role => role._id);
    //       login.save(err => {
    //         if (err) {
    //           res.status(500).send({ message: err });
    //           return;
    //         }

    //         res.render('home');
    //       });
    //     }
    //   );
    // } else {
    //   Role.findOne({ name: "patient" }, (err, role) => {
    //     if (err) {
    //       res.status(500).send({ message: err });
    //       return;
    //     }

    //     login.roles = [role._id];
    //     login.save(err => {
    //       if (err) {
    //         res.status(500).send({ message: err });
    //         return;
    //       }

          res.send({ message: "User was registered successfully!" });
        });
      
    
  
};

exports.signin = (req, res) => {
    console.log(req.body.username);
  Login.findOne({
    
    username: req.body.username
  })
    .populate("roles", "-__v")
    .exec((err, login) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!login) {
        return res.render('404');
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        login.password
      );

      if (!passwordIsValid) {
        // return res.status(401).send({
        //   accessToken: null,
        //   message: "Invalid Password!"
        // });
        return res.render('404');
      }

      var token = jwt.sign({ id: login.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < login.roles.length; i++) {
        authorities.push("ROLE_" + login.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: login._id,
        username: login.username,
        email: user.email,
        roles: authorities,
        accessToken: token
      });
      res.render('home');
      
    });
};
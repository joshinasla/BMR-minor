const config = require("../config/auth.config");
const db = require("../models");
const People = db.people;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


exports.signup = (req, res) => {
  const people = new People({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  people.save((err, people) => {
    if (err) {
      res.render('404');
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          people.roles = roles.map(role => role._id);
          people.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.render('home');
          });
        }
      );
    } else {
      Role.findOne({ name: "patient" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        people.roles = [role._id];
        people.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
    console.log(req.body.username);
  People.findOne({
    
    username: req.body.username
  })
    .populate("roles", "-__v")
    .exec((err, people) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!people) {
        return res.render('404');
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        people.password
      );

      if (!passwordIsValid) {
        // return res.status(401).send({
        //   accessToken: null,
        //   message: "Invalid Password!"
        // });
        return res.render('404');
      }

      var token = jwt.sign({ id: people.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < people.roles.length; i++) {
        authorities.push("ROLE_" + people.roles[i].name.toUpperCase());
      }
      res.render('home');
      
    });
};
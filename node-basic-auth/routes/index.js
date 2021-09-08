const router = require("express").Router();
const User = require('../models/User.model');
const bcrypt = require('bcrypt');

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/signup", (req, res, next) => {
  res.render("signup");
});

router.post('/signup', (req, res, next) => {
  console.log(req.body);
  const { username, password } = req.body;
  // validation
  // is the password 4+ chars
  if (password.length < 4) {
    // if not show the signup form again with a message
    res.render('signup', { message: 'Your password needs to be 4 chars min' });
    return;
  }
  // is the username empty
  if (username.length === 0) {
    res.render('signup', { message: 'Username cannot be empty' });
    return;
  }
  // validation passed
  // we now check if the username already exists
  User.findOne({ username: username })
    .then(userFromDB => {
      // if user exists 
      if (userFromDB !== null) {
        // we render signup again
        res.render('signup', { message: 'Username is already taken' });
      } else {
        // if we reach this line the username can be used
        // password as the value for the password field
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(password, salt);
        console.log(hash);
        // we create a document for that user in the db with the hashed 
        User.create({ username: username, password: hash })
          .then(createdUser => {
            console.log(createdUser);
            res.redirect('/');
          })
          .catch(err => {
            next(err);
          })
      }
    })
});


module.exports = router;

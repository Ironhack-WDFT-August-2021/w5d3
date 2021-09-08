const router = require("express").Router();


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

// create a middleware to check if the user is logged in
const loginCheck = () => {
  return (req, res, next) => {
    // is there a logged in user?
    if (req.session.user) {
      // if yes -> proceed as requested
      next();
    } else {
      // if there is no logged in user -> redirect to login
      res.redirect('/login');
    }
  }
}

// this route is now protected -> can only be accessed by a logged in user
router.get('/profile', loginCheck(), (req, res, next) => {
  // we can access a cookie
  console.log('this is the cookie: ', req.cookies);
  // this is how we can set a cookie 
  res.cookie('myCookie', 'hello world');
  // this is how you can delete a cookie
  res.clearCookie('myCookie');
  // we retrieve the logged in user from the session
  const loggedInUser = req.session.user;
  console.log(loggedInUser);
  // and pass the user object into the view
  res.render('profile', { user: loggedInUser });
});


module.exports = router;
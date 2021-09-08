// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// session configuration

const session = require('express-session');
const MongoStore = require('connect-mongo');
const DB_URL = process.env.MONGO;

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		// for how long is the user logged in -> this would be one day 	
		cookie: { maxAge: 1000 * 60 * 60 * 24 },
		resave: true,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: DB_URL
		})
	})
)
// end of session configuration

// passport config

const User = require('./models/User.model');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser((id, done) => {
	User.findById(id)
		.then(userFromDB => {
			done(null, userFromDB);
		})
		.catch(err => {
			done(err);
		})
})


// register the local strategy (login with username and password)

passport.use(
	new LocalStrategy((username, password, done) => {
		// this logic will be executed when we log in
		User.findOne({ username: username })
			.then(userFromDB => {
				if (userFromDB === null) {
					// there is no user with this username
					done(null, false, { message: 'Wrong Credentials' });
				} else {
					done(null, userFromDB);
				}
			})
	})
)

app.use(passport.initialize());
app.use(passport.session());

// end of passport config

// passport github strategy

const GitHubStrategy = require('passport-github').Strategy;

passport.use(new GitHubStrategy({
	clientID: process.env.GITHUB_CLIENT_ID,
	clientSecret: process.env.GITHUB_CLIENT_SECRET,
	callbackURL: "http://127.0.0.1:3000/auth/github/callback"
},
	// function (accessToken, refreshToken, profile, cb) {
	// 	User.findOrCreate({ githubId: profile.id }, function (err, user) {
	// 		return cb(err, user);
	// 	});
	// }
	(accessToken, refreshToken, profile, done) => {
		// authentication on github passed and we need to check if we have 
		// a user with that github id already in the database - if not we create it
		console.log(profile);
		User.findOne({ githubId: profile.id })
			.then(userFromDB => {
				if (userFromDB !== null) {
					// pass the user to passport so it can be serialized and it's id 
					// is put into the session
					done(null, userFromDB);
				} else {
					// we create that user
					User.create({
						githubId: profile.id,
						username: profile.username,
						avatar: profile._json.avatar_url
					})
						.then(createdUser => {
							done(null, createdUser);
						})
				}
			})
			.catch(err => {
				done(err);
			})
	}
));

// end passport github strategy

// default value for title local
const projectName = "passport";
const capitalized = (string) => string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)} created with IronLauncher`;

// 👇 Start handling routes here
const index = require("./routes/index");
app.use("/", index);

const auth = require("./routes/auth");
app.use("/", auth);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;

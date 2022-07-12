const express = require('express');
const app = express();
const sql = require('mysql');
const passport = require('passport');
const cookieSession = require('cookie-session');

require('./passport');

app.use(cookieSession({
	name: 'google-auth-session',
	keys: ['key1', 'key2']
}));

app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");

// database connectivity
const connection = sql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'chat-app',
});

connection.connect((err) => {
    if (err) {
        console.log("Error", err);
        throw err;
    }

    console.log("Application connected with MySQL");
});

app.get('/', (req, res) => {
	res.render('login');
});

// Auth
app.get('/auth' , passport.authenticate('google', { scope:
	[ 'email', 'profile' ]
}));

// Auth Callback
app.get( '/auth/callback',
	passport.authenticate( 'google', {
		successRedirect: '/auth/callback/success',
		failureRedirect: '/auth/callback/failure'
}));

const createAuthUser = function (req, res) {
	let data = {email: req.email, name: req.displayName, image: req.picture};
	let fetchOperation = "select * from user where email = ?";

	let fetchQuery = connection.query(fetchOperation, req.email, (err, result) => {
		if (err) throw err;

		if (result.length == 0) {
			let query = "INSERT INTO user SET ?";
			
			let queryResult = connection.query(query, data, (err, result) => {
				if (err) throw err;
					console.log("Data inserted into database");
			}); 
		}
	});
};

// Success
app.get('/auth/callback/success' , (req , res) => {
	if(!req.user)
		res.redirect('/auth/callback/failure');

	createAuthUser(req.user);
	res.render('homepage', {user: req.user.displayName});
});

// failure
app.get('/auth/callback/failure' , (req , res) => {
	res.send("Error");
})

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

app.listen(4000 , () => {
	console.log("Server Running on port 4000");
});

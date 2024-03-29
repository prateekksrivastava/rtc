import express, { Request, Response } from 'express';
import sql from 'mysql';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';
import passport from 'passport';
import { Socket } from 'socket.io';

require('./passport');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
app.use(express.static("public"));

const users = {};

io.on('connection', function(socket: Socket){
	console.log('Client connected');
	
	socket.on('new-user-joined', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

	socket.on('chat', message => {
		socket.broadcast.emit('receive', {message: message, name: users[socket.id]})
	});

	socket.on('disconnect', message => {

		socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
});
 
dotenv.config();
const port = process.env.PORT;

app.use(cookieSession({
	name: 'google-auth-session',
	keys: ['key1', 'key2']
}));

app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");

// database connectivity
const connection = sql.createConnection({
	host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
});

connection.connect((err) => {
    if (err) {
        console.log("Error ", err);
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
app.get('/auth/callback',
	passport.authenticate('google', {
		successRedirect: '/homepage',
		failureRedirect: '/error'
	}
));

const createAuthUser = function (req:any) {
	let data = {email: req.email, name: req.displayName, image: req.picture};
	let fetchOperation = "select * from user where email = ?";

	let fetchQuery = connection.query(fetchOperation, req.email, (err, result) => {
		if (err) throw err;

		if (result.length == 0) {
			let query = "INSERT INTO user SET ?";
			
			let queryResult = connection.query(query, data, (err, result) => {
				if (err) throw err;
					console.log("Data inserted into database");

					return result;
			}); 
		}

		return result;
	});
};

// Success
app.get('/homepage' , (req:any , res) => {
	if(!req.user)
		res.redirect('/error');

	createAuthUser(req.user);
	res.render('homepage', {user: req.user});
});

// failure
app.get('/error' , (req , res) => {
	res.send("Error:");
})

// Logout
app.get('/logout', function(req:any, res){
	req.logout();
	res.redirect('/');
});

// Listen port
http.listen(port , () => {
	console.log(`Server Running on port ${port}`);
});
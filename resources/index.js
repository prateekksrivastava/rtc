"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql_1 = __importDefault(require("mysql"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_1 = __importDefault(require("passport"));
require('./passport');
const app = (0, express_1.default)();
const http = require('http').Server(app);
const io = require('socket.io')(http);
io.on('connection', function (socket) {
    console.log('Client connected');
    socket.on('chat', function (data) {
        //Send message to everyone
        io.sockets.emit('chat-message', data);
    });
});
dotenv_1.default.config();
const port = process.env.PORT;
app.use((0, cookie_session_1.default)({
    name: 'google-auth-session',
    keys: ['key1', 'key2']
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.set("view engine", "ejs");
// database connectivity
const connection = mysql_1.default.createConnection({
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
app.get('/auth', passport_1.default.authenticate('google', { scope: ['email', 'profile']
}));
// Auth Callback
app.get('/auth/callback', passport_1.default.authenticate('google', {
    successRedirect: '/homepage',
    failureRedirect: '/error'
}));
const createAuthUser = function (req) {
    let data = { email: req.email, name: req.displayName, image: req.picture };
    let fetchOperation = "select * from user where email = ?";
    let fetchQuery = connection.query(fetchOperation, req.email, (err, result) => {
        if (err)
            throw err;
        if (result.length == 0) {
            let query = "INSERT INTO user SET ?";
            let queryResult = connection.query(query, data, (err, result) => {
                if (err)
                    throw err;
                console.log("Data inserted into database");
                return result;
            });
        }
        return result;
    });
};
// Success
app.get('/homepage', (req, res) => {
    if (!req.user)
        res.redirect('/error');
    createAuthUser(req.user);
    res.render('homepage', { user: req.user });
});
// failure
app.get('/error', (req, res) => {
    res.send("Error:");
});
// Logout
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});
// Listen port
http.listen(port, () => {
    console.log(`Server Running on port ${port}`);
});

var io = require('socket.io');
var jwt = require('jsonwebtoken');
var auth = require('./lib/auth');
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser')

var app = express();
app.use(bodyParser.json());

//io.on('connection', function (socket) {
//	new Connection(socket);
//});

// other requires

// Add headers
app.use(function (req, res, next) {

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
});

app.post('/login', function (req, res) {

    var token = auth.signIn(req.body);

	// we are sending the profile in the token
//	var token = jwt.sign(profile, jwtSecret, { expiresInMinutes: 60*5 });

	res.json({token: token});
    //res.json({nope: 'nope'});
});

var server = http.createServer(app);

var socket = io.listen(server);

auth.secure(socket);

server.listen(3000, function () {
	console.log('listening on port 3000');
});

require('./lib/fixtures');
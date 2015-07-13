var saltshaker = require('./saltshaker');
var CryptoJS = require('crypto-js');

var globalSecret = saltshaker(64);

function Token(username) {
	this.username = username;
	this.expiry = new Date().getTime() + 24 * 3600 * 1000; // One day from now
	this.digest = digest(this);
}

function digest(token) {
	var hash = CryptoJS.SHA256(globalSecret + token.username + '' + token.expiry);
	return hash.toString(CryptoJS.enc.Base64);
}

exports.create = function create(username) {
	return new Token(username);
}

exports.verify = function verify(token) {
	return token.digest === digest(token);
}
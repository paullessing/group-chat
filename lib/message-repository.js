var _ = require('underscore');

function Message(userId, text, roomId, timestamp) {
	this.id = ++id;
	this.userId = userId;
	this.text = text;
	this.roomId = roomId;
	this.timestamp = timestamp;
}

var rooms = {};
var id = 0;

/**
 * Unit tests only
 */
exports._reset = function() {
	rooms = {};
}

var insert = exports.insert = function(userId, text, roomId) {
	if (!text) {
		throw new Error('Message must contain text!');
	}
	
	var message = new Message(userId, text, roomId, new Date());
	if (!rooms[roomId]) {
		rooms[roomId] = [];
	}
	rooms[roomId].push(message);
	return message;
}

var getByRoomId = exports.getByRoomId = function(roomId) {
	if (rooms[roomId]) {
		var result = [];
		rooms[roomId].forEach(function(message) {
			result.push(message);
		});
		return result;
	} else {
		return [];
	}
}
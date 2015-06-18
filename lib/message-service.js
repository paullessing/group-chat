var _ = require('underscore');
var messageRepository = require('./message-repository');
var userRepository = require('./user-repository');

var insertMessage = exports.insertMessage = function(userId, text, roomId) {
	var message = messageRepository.insert(userId, text, roomId);
	var username = userRepository.get(userId).username;
	return _.extend({ username: username }, message); // Defensive copy
	return message;
};

var getMessagesInRoom = exports.getMessagesInRoom = function(roomId) {
	var messagesInRoom = messageRepository.getByRoomId(roomId);
	var usernames = {};
	var messages = [];
	messagesInRoom.forEach(function(message) {
		var username = usernames[message.userId];
		if (!username) {
			username = usernames[message.userId] = userRepository.get(message.userId).username;
		}
		messages.push(_.extend({ username: username }, message));
	});
	return messages;
};
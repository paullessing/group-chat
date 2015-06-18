var mockery = require('mockery');
var assert = require('assert');
var sinon = require('sinon');
var _ = require('underscore');

describe('MessageService', function() {
	var messageService;
	
	var userRepository = {
		get: sinon.stub(),
	};
	var messageRepository = {
		insert: sinon.stub(),
		getByRoomId: sinon.stub(),
	};
	var userId = 17;
	var username = '#username#';
	var user = {
		id: userId,
		username: username
	};
	var messageText = 'Lorem ipsum';
	var roomId = 31;
	var message;
	
	before(function() {
		mockery.enable();
		mockery.registerMock('./user-repository', userRepository);
		mockery.registerMock('./message-repository', messageRepository);
		mockery.registerAllowable('underscore');
		messageService = require('../lib/message-service');
	});
	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
	beforeEach(function() {
		userRepository.get.reset();
		messageRepository.insert.reset();
		messageRepository.getByRoomId.reset();
		message = {
			userId: userId,
			roomId: roomId,
			text: messageText
		};
	});
	
	describe('#insertMessage()', function() {
		it('should insert a message using the messageRepository', function() {
			userRepository.get.withArgs(userId).returns(user);
			messageRepository.insert.withArgs(userId, messageText, roomId).returns(message);
			
			messageService.insertMessage(userId, messageText, roomId);
			
			assert.ok(messageRepository.insert.calledOnce);
			assert.ok(messageRepository.insert.calledWithExactly(userId, messageText, roomId));
		});
		it('should enhance the returned message with the username', function() {
			userRepository.get.withArgs(userId).returns(user);
			messageRepository.insert.withArgs(userId, messageText, roomId).returns(message);
			
			var result = messageService.insertMessage(userId, messageText, roomId);
			
			assert.deepEqual(_.extend({username: username}, message), result);
		});
	});
	
	describe('#getMessagesInRoom()', function() {
		it('should return an empty list when the repository returns empty', function() {
			messageRepository.getByRoomId.withArgs(roomId).returns([]);
			
			var result = messageService.getMessagesInRoom(roomId);
			
			assert.deepEqual([], result);
		});
		it('should enhance a message with the user ID', function() {
			messageRepository.getByRoomId.withArgs(roomId).returns([message]);
			userRepository.get.withArgs(userId).returns(user);
			
			var result = messageService.getMessagesInRoom(roomId);
			
			assert.deepEqual([_.extend({ username: username }, message)], result);
		});
		it('should only call the userRepository once per user', function() {
			messageRepository.getByRoomId.withArgs(roomId).returns([message, message]);
			userRepository.get.withArgs(userId).returns(user);
			
			var result = messageService.getMessagesInRoom(roomId);

			assert.ok(userRepository.get.calledOnce);
			assert.ok(userRepository.get.calledWithExactly(userId));
		});
		it('should enhance each user\'s message with their username', function() {
			var userId2 = userId + 1;
			var username2 = 'user2';
			var user2 = {
				userId: userId2,
				username: username2
			}
			var message2 = { userId: userId2, text: 'foo', roomId: roomId };
			messageRepository.getByRoomId.withArgs(roomId).returns([message, message2]);
			userRepository.get.withArgs(userId).returns(user);
			userRepository.get.withArgs(userId2).returns(user2);
			
			var result = messageService.getMessagesInRoom(roomId);
			
			assert.deepEqual([_.extend({ username: username }, message), _.extend({ username: username2 }, message2)], result);
		});
	})
})
var messageRepository = require('../lib/message-repository');
var assert = require('assert');
var sinon = require('sinon');

describe('MessageRepository', function(){
	var clock;
	beforeEach(function() {
		messageRepository._reset();
	});
    before(function () {
        clock = sinon.useFakeTimers(0);
    });
	after(function () {
	    clock.restore();
	});
	
	
	describe('#insert()', function() {
		it('should create a new message with the correct information', function() {
			var userId = 17;
			var roomId = 13;
			var text = 'Lorem ipsum dolor sit amet';
			
			var message = messageRepository.insert(userId, text, roomId);
			
			assert.strictEqual(userId, message.userId);
			assert.strictEqual(roomId, message.roomId);
			assert.strictEqual(text, message.text);
		});
		it('should throw an exception if an empty string is passed for text', function() {
			assert.throws(function() {
				messageRepository.insert(1, null, 1);
			});
			assert.throws(function() {
				messageRepository.insert(1, '', 1);
			});
			assert.throws(function() {
				messageRepository.insert(1, undefined, 1);
			});
		});
		it('should create unique IDs for different messages', function() {
			var message1 = messageRepository.insert(1, 'message1', 1);
			var message2 = messageRepository.insert(1, 'message2', 1);
			
			assert.notEqual(message1.id, message2.id);
		});
		it('should use the current time for message timestamps', function() {
			var time = 113;
			clock.tick(time);
			
			var message = messageRepository.insert(1, 'message', 2);
			assert.equal(time, message.timestamp.getTime());
		});
	});
	
	describe('#getByRoomId()', function() {
		it('should return empty when no messages have been created', function() {
			assert.deepEqual([], messageRepository.getByRoomId(1));
		});
		it('should return a message for a room if it has been created', function() {
			var roomId = 7;
			var message = messageRepository.insert(1, 'foo', roomId);
			
			var result = messageRepository.getByRoomId(roomId);
			
			assert.deepEqual([message], result);
		});
		it('should not return a message from another room', function() {
			var roomId = 7;
			var message = messageRepository.insert(1, 'foo', roomId);
			
			var result = messageRepository.getByRoomId(roomId + 1);
			
			assert.deepEqual([], result);
		});
		it('should return messages in the order they were created', function() {
			var roomId = 7;
			var message1 = messageRepository.insert(1, 'message1', roomId);
			var message2 = messageRepository.insert(1, 'message2', roomId);
			var message3 = messageRepository.insert(1, 'message3', roomId);
			
			var result = messageRepository.getByRoomId(roomId);
			
			assert.deepEqual([message1, message2, message3], result);
		});
	});
});
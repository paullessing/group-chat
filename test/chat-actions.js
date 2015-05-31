var mockery = require('mockery');
var assert = require('assert');
var sinon = require('sinon');

var chatActions;

describe('ChatActions', function() {
	var userService = {
		signIn: sinon.stub(),
	};
	var roomRepository = {
		get: sinon.stub(),
		getAll: sinon.stub(),
	};
	var userRoomRepository = {
		join: sinon.stub(),
		getUsers: sinon.stub(),
	};
	var userRepository = {
		get: sinon.stub(),
	};
	var connection = {};
	var user = {
		id: 0,
		username: 'myUsername'
	};
	var room = {
		id: 0,
		name: 'room',
		description: ''
	};
	
	before(function() {
		mockery.enable();
		mockery.registerMock('./user-service', userService);
		mockery.registerMock('./user-repository', userRepository);
		mockery.registerMock('./room-repository', roomRepository);
		mockery.registerMock('./user-room-repository', userRoomRepository);
		
		mockery.registerAllowable('../lib/chat-actions');
		chatActions = require('../lib/chat-actions');
	});
	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
	beforeEach(function() {
		userService.signIn.reset();
		userRepository.get.reset();
		roomRepository.get.reset();
		roomRepository.getAll.reset();
		userRoomRepository.join.reset();
		userRoomRepository.getUsers.reset();
	});
	
	describe('#user.$signin()', function() {
		it('should call userService#signIn with the correct username', function() {
			var username = 'username';
			chatActions.user.$signin(connection, { username: username });
			assert(userService.signIn.calledOnce);
			assert(userService.signIn.calledWith(username));
		});
		it('should return the user userService#signIn returns', function() {
			var username = 'username';
			userService.signIn.withArgs(username).returns(user);
			var result = chatActions.user.$signin(connection, { username: username });
			
			assert.strictEqual(user, result);
		});
	});

	describe('#server.listRooms()', function() {
		it('should return all rooms from roomRepository', function() {
			var rooms = [];
			roomRepository.getAll.returns(rooms);

			assert.strictEqual(rooms, chatActions.server.listRooms(connection));
		});
	});

	describe('#room.join()', function() {
		it('should throw an exception when the room doesn\'t exist', function() {
			var roomId = 17;
			roomRepository.get.withArgs(roomId).returns(null);
			
			assert.throws(function() {
				chatActions.room.join(connectionWithUser(5), { roomId: roomId });
			});
		});
		it('should call the UserRoomRepository to join the room', function() {
			var userId = 5;
			var roomId = 17;
			roomRepository.get.withArgs(roomId).returns(room);
			
			chatActions.room.join(connectionWithUser(userId), { roomId: roomId });
			assert.ok(userRoomRepository.join.calledOnce);
			assert.ok(userRoomRepository.join.calledWithExactly(userId, roomId));
		});
	});

	describe('#room.listUsers()', function() {
		it('should throw an exception when the room doesn\'t exist', function() {
			var roomId = 17;
			roomRepository.get.withArgs(roomId).returns(null);
			
			assert.throws(function() {
				chatActions.room.listUsers(connection, { roomId: roomId });
			});
		});
		it('should fetch userIds and map them to users', function() {
			var user1 = { id: 1 };
			var user2 = { id: 2 };
			var userIds = [15, 17];
			var roomId = 19;

			roomRepository.get.withArgs(roomId).returns(room);
			userRoomRepository.getUsers.withArgs(roomId).returns(userIds);
			userRepository.get.withArgs(15).returns(user1);
			userRepository.get.withArgs(17).returns(user2);
			
			var result = chatActions.room.listUsers(connection, { roomId: roomId });
			assert.deepEqual([user1, user2], result);
		});
	});
	
	function connectionWithUser(id) {
		return {
			userData: { id: id }
		};
	}
});
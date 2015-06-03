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
		create: sinon.stub(),
	};
	var userRoomRepository = {
		join: sinon.stub(),
		getUsers: sinon.stub(),
	};
	var userRepository = {
		get: sinon.stub(),
	};
	var connection = {
		socket: {
			emit: sinon.stub(),
			server: {
				emit: sinon.stub(),
			}
		},
		userData: {
			id: 31
		}
	};
	var user = {
		id: 0,
		username: 'myUsername'
	};
	var room = {
		id: 29,
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
		roomRepository.create.reset();
		userRoomRepository.join.reset();
		userRoomRepository.getUsers.reset();
		connection.socket.emit.reset();
		connection.socket.server.emit.reset();
	});
	
	describe('#user.$signin()', function() {
		it('should call userService#signIn with the correct username, and set the id as connection userData', function() {
			var username = 'username';
			userService.signIn.withArgs(username).returns(user);
			chatActions.user.$signin(connection, { username: username });
			assert.equal(user.id, connection.userData.id);
		});
	});

	describe('#server.listRooms()', function() {
		it('should emit all rooms from roomRepository', function() {
			var rooms = [];
			roomRepository.getAll.returns(rooms);

			chatActions.server.listRooms(connection);
			assert.ok(connection.socket.emit.calledOnce);
			assert.strictEqual(rooms, connection.socket.emit.firstCall.args[1]);
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
			
			chatActions.room.listUsers(connection, { roomId: roomId });
			assert.ok(connection.socket.emit.calledOnce);
			assert.deepEqual([user1, user2], connection.socket.emit.firstCall.args[1]);
		});
	});
	
	describe('#room.create()', function() {
		it('should throw an error when no room name is passed', function() {
			assert.throws(function() {
				chatActions.room.create(connection, {});
			});
			assert.throws(function() {
				chatActions.room.create(connection, { roomName: null });
			});
			assert.throws(function() {
				chatActions.room.create(connection, { roomName: '' });
			});
		});
		it('should create a room with the details passed', function() {
			var roomDescription = 'description';
			var roomName = 'room-name';
			roomRepository.create.withArgs(roomName, roomDescription).returns(room);
		
			chatActions.room.create(connection, { roomName: roomName, roomDescription: roomDescription });
			assert.ok(roomRepository.create.calledOnce);
			assert.ok(roomRepository.create.calledWithExactly(roomName, roomDescription));
		});
		it('should make the creating user join the new room', function() {
			var roomDescription = 'description';
			var roomName = 'room-name';
			roomRepository.create.withArgs(roomName, roomDescription).returns(room);
		
			chatActions.room.create(connection, { roomName: roomName, roomDescription: roomDescription });
			
			assert.ok(userRoomRepository.join.calledOnce);
			assert.ok(userRoomRepository.join.calledWithExactly(connection.userData.id, room.id));
		});
		it('should notify the user of the new room', function() {
			var roomDescription = 'description';
			var roomName = 'room-name';
			roomRepository.create.withArgs(roomName, roomDescription).returns(room);
		
			chatActions.room.create(connection, { roomName: roomName, roomDescription: roomDescription });
			
			assert.ok(connection.socket.emit.calledOnce);
			assert.ok(connection.socket.emit.calledWithExactly('room/create', room));
		});
		it('should notify everyone of all the current rooms', function() {
			var roomDescription = 'description';
			var roomName = 'room-name';
			roomRepository.create.withArgs(roomName, roomDescription).returns(room);
			var rooms = [room];
			roomRepository.getAll.returns(rooms);
		
			chatActions.room.create(connection, { roomName: roomName, roomDescription: roomDescription });
			
			assert.ok(connection.socket.server.emit.calledOnce);
			assert.ok(connection.socket.server.emit.calledWithExactly('server/listRooms', rooms));
			assert.strictEqual(rooms, connection.socket.server.emit.firstCall.args[1]);
		});
	});
	
	function connectionWithUser(id) {
		return {
			userData: { id: id }
		};
	}
});
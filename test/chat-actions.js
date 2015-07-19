var mockery = require('mockery');
var assert = require('assert');
var sinon = require('sinon');

var chatActions;

describe('ChatActions', function() {
	var roomRepository = {
		get: sinon.stub(),
		getAll: sinon.stub(),
		create: sinon.stub()
	};
	var userRoomRepository = {
		join: sinon.stub(),
		getUsers: sinon.stub(),
		getRooms: sinon.stub()
	};
	var userRepository = {
		get: sinon.stub()
	};
	var messageService = {
		insertMessage: sinon.stub(),
	};
	var user = {
		id: 17,
		username: 'myUsername'
	};
	var connection = {
		socket: {
			emit: sinon.stub(),
			broadcast: {
				emit: sinon.stub()
			},
			server: {
				emit: sinon.stub()
			},
			decoded_token: {
				id: user.id
			}
		}
	};
	var room = {
		id: 29,
		name: 'room',
		description: ''
	};
	var message = {
		id: 29,
		text: 'room',
		userId: 1,
		roomId: 3
	};
	
	before(function() {
		mockery.enable();
		mockery.registerMock('./user-repository', userRepository);
		mockery.registerMock('./room-repository', roomRepository);
		mockery.registerMock('./message-service', messageService);
		mockery.registerMock('./user-room-repository', userRoomRepository);
		
		mockery.registerAllowable('../lib/chat-actions');
		chatActions = require('../lib/chat-actions');
	});
	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
	beforeEach(function() {
		userRepository.get.reset();
		roomRepository.get.reset();
		roomRepository.getAll.reset();
		roomRepository.create.reset();
		messageService.insertMessage.reset();
		userRoomRepository.join.reset();
		userRoomRepository.getUsers.reset();
		userRoomRepository.getRooms.reset();
		connection.socket.emit.reset();
		connection.socket.server.emit.reset();
		connection.socket.broadcast.emit.reset();
	});

	describe('#server.listRooms()', function() {
		it('should emit all rooms from roomRepository', function() {
			var rooms = [room];
			roomRepository.getAll.returns(rooms);

			chatActions.server.listRooms(connection);
			assert.ok(connection.socket.emit.calledOnce);
			assert.ok(connection.socket.emit.calledWith('server/listRooms'));
			assert.deepEqual(rooms, connection.socket.emit.firstCall.args[1].rooms);
		});
		it('should show no joined rooms if the user has joined none', function() {
			var rooms = [room];
			var joined = [];
			roomRepository.getAll.returns(rooms);
			userRoomRepository.getRooms.withArgs(user.id).returns(joined);

			chatActions.server.listRooms(connection);
			assert.ok(connection.socket.emit.calledOnce);
			assert.deepEqual(joined, connection.socket.emit.firstCall.args[1].joined);
		});
		it('should return all the rooms the user has joined', function() {
			var rooms = [room];
			var joined = [1, 2, 17, 28, 5];
			roomRepository.getAll.returns(rooms);
			userRoomRepository.getRooms.withArgs(user.id).returns(joined);

			chatActions.server.listRooms(connection);
			assert.ok(connection.socket.emit.calledOnce);
			assert.deepEqual(joined, connection.socket.emit.firstCall.args[1].joined);
		});
	});

	describe('#message.new()', function() {
		it('should throw an exception when the room doesn\'t exist', function() {
			var roomId = 17;
			roomDoesNotExist(roomId);
			
			assert.throws(function() {
				chatActions.message.new(connection, { message: 'message', roomId: roomId });
			});
		});
		it('should insert a message and broadcast it', function() {
			var roomId = 17;
			var messageText = 'Lorem ipsum';
			roomExists(roomId);
			var message = {};
			messageService.insertMessage.withArgs(user.id, messageText, roomId).returns(message);
			
			chatActions.message.new(connection, { message: messageText, roomId: roomId });

			assert.ok(connection.socket.server.emit.calledOnce);
			assert.ok(connection.socket.server.emit.calledWith('message/new'));
			assert.strictEqual(message, connection.socket.server.emit.firstCall.args[1]);
		});
	});

	describe('#room.join()', function() {
		it('should throw an exception when the room doesn\'t exist', function() {
			var roomId = 17;
			roomDoesNotExist(roomId);
			
			assert.throws(function() {
				chatActions.room.join(connection, { roomId: roomId });
			});
		});
		it('should call the UserRoomRepository to join the room', function() {
			var roomId = 17;
			roomExists(roomId);

			chatActions.room.join(connection, { roomId: roomId });
			assert.ok(userRoomRepository.join.calledOnce);
			assert.ok(userRoomRepository.join.calledWithExactly(user.id, roomId));
		});
		it('should return a list of all rooms to the user', function() {
			var roomId = 17;
			roomExists(roomId);

			expectAndVerifyServerRoomList(function() {
				chatActions.room.join(connection, { roomId: roomId });
			});
		});
	});

	describe('#room.listUsers()', function() {
		it('should throw an exception when the room doesn\'t exist', function() {
			var roomId = 17;
			roomDoesNotExist(roomId);
			
			assert.throws(function() {
				chatActions.room.listUsers(connection, { roomId: roomId });
			});
		});
		it('should fetch userIds and map them to users', function() {
			var user1 = { id: 1 };
			var user2 = { id: 2 };
			var userIds = [15, 17];
			var roomId = 19;

			roomExists(roomId);
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
			assert.ok(userRoomRepository.join.calledWithExactly(user.id, room.id));
		});
		it('should notify the user of the new room', function() {
			var roomDescription = 'description';
			var roomName = 'room-name';
			roomRepository.create.withArgs(roomName, roomDescription).returns(room);

			chatActions.room.create(connection, { roomName: roomName, roomDescription: roomDescription });

			assert.ok(connection.socket.emit.firstCall.calledWithExactly('room/create', room));
		});
		it('should notify everyone of the new room', function() {
			var roomDescription = 'description';
			var roomName = 'room-name';
			roomRepository.create.withArgs(roomName, roomDescription).returns(room);

			var expect = expectServerRoomList();

			chatActions.room.create(connection, { roomName: roomName, roomDescription: roomDescription });

			assert.ok(connection.socket.emit.calledWith('server/listRooms'));
			assert.deepEqual(expect, connection.socket.emit.secondCall.args[1]);
		});
	});

	function roomDoesNotExist(roomId) {
		roomRepository.get.withArgs(roomId).returns(null);
	}
	function roomExists(roomId) {
		roomRepository.get.withArgs(roomId).returns(room);
	}

	function expectServerRoomList() {
		var rooms = [room];
		var joined = [1, 2, 17, 28, 5];
		roomRepository.getAll.returns(rooms);
		userRoomRepository.getRooms.withArgs(user.id).returns(joined);

		return { rooms: rooms, joined: joined };
	}

	function expectAndVerifyServerRoomList(actionCall) {
		var expect = expectServerRoomList();

		actionCall();

		assert.ok(connection.socket.emit.calledOnce);
		assert.ok(connection.socket.emit.calledWith('server/listRooms'));
		assert.deepEqual(expect, connection.socket.emit.firstCall.args[1]);
	}
});
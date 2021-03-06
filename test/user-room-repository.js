var repository = require('../lib/user-room-repository');

var assert = require("assert");
describe('UserRoomRepository', function(){
	beforeEach(function() {
		repository._reset();
	});
	
	describe('#join()', function() {
		it('should return true when a user joins a new room', function() {
			assert.ok(repository.join(1, 1));
		});
		it('should return true when a user who is a member of other rooms joins a new one', function() {
			var userId = 1;
			repository.join(userId, 1);
			
			assert.ok(repository.join(userId, 2));
		});
		it('should return false when a user tries to join a room they are already a member of', function() {
			var userId = 1;
			var roomId = 7;
			repository.join(userId, roomId);
			
			assert.ok(!repository.join(userId, roomId));
		});
	});

	describe('#getAllRooms()', function() {
		it('should return an empty array when no rooms have been set up', function() {
			assert.deepEqual([], repository.getAllRooms());
		});
		it('should return a room if a user is in it', function() {
			var room = 7;
			repository.join(1, room);
			assert.deepEqual([room], repository.getAllRooms());
		});
		it('should only return a room once even if multiple users are in it', function() {
			var room = 7;
			repository.join(1, room);
			repository.join(2, room);
			assert.deepEqual([room], repository.getAllRooms());
		});
		it('should return all the rooms containing users', function() {
			var room1 = 7;
			var room2 = 8;
			repository.join(1, room1);
			repository.join(2, room2);
			assert.deepEqual([room1, room2], repository.getAllRooms());
		});
		it('should return all the rooms only once even if they contain multiple users', function() {
			var room1 = 7;
			var room2 = 8;
			repository.join(1, room1);
			repository.join(2, room2);
			repository.join(3, room1);
			repository.join(4, room2);
			assert.deepEqual([room1, room2], repository.getAllRooms());
		});
	});
	
	describe('#getRooms()', function() {
		it('should return empty for a user who has joined no rooms', function() {
			assert.deepEqual([], repository.getRooms(1));
		});
		it('should return a room for a user who has joined it', function() {
			var userId = 1;
			var roomId = 2;
			repository.join(userId, roomId);
			
			assert.deepEqual([roomId], repository.getRooms(userId));
		});
		it('should return all rooms for a user who has joined them', function() {
			var userId = 1;
			var room1 = 7;
			var room2 = 8;
			repository.join(userId, room1);
			repository.join(userId, room2);
			
			assert.deepEqual([room1, room2], repository.getRooms(userId));
		});
		it('should not return rooms other users have joined', function() {
			var user1 = 1;
			var user2 = 2;
			var room1 = 7;
			var room2 = 8;
			repository.join(user1, room1);
			repository.join(user2, room2);
			
			assert.deepEqual([room1], repository.getRooms(user1));
		});
	});
	
	describe('#getUsers()', function() {
		it('should return empty when there are no users', function() {
			assert.deepEqual([], repository.getUsers(1));
		});
		it('should return empty when all users are in other rooms', function() {
			var roomId = 1;
			repository.join(1, 2);
			repository.join(1, 3);
			repository.join(2, 2);
			assert.deepEqual([], repository.getUsers(roomId));
		});
		it('should return a user who is in the room', function() {
			var userId = 1;
			var roomId = 17;
			repository.join(userId, roomId);
			assert.deepEqual([userId], repository.getUsers(roomId));
		});
		it('should return all user who are in the room', function() {
			var userId1 = 1;
			var userId2 = 7;
			var roomId = 17;
			repository.join(userId1, roomId);
			repository.join(userId2, roomId);
			assert.deepEqual([userId1, userId2], repository.getUsers(roomId));
		});
		it('should only return users who are in the room, and not users in other rooms', function() {
			var userId1 = 1;
			var userId2 = 7;
			var roomId1 = 17;
			var roomId2 = 18;
			repository.join(userId1, roomId1);
			repository.join(userId2, roomId2);
			assert.deepEqual([userId1], repository.getUsers(roomId1));
		});
	});
});

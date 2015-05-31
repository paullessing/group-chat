var userRepository = require('../lib/user-repository');
var assert = require("assert");

describe('UserRepository', function(){
	beforeEach(function() {
		userRepository._reset();
	});
	
	describe('#create()', function() {
		it('should return a new user with the correct name', function() {
			var username = 'username';
			var user = userRepository.create(username);
			assert.ok(user !== null);
			assert.equal(username, user.username);
		});
		it('should return unique user IDs for different users', function() {
			var user1 = userRepository.create('user1');
			var user2 = userRepository.create('user2');
			assert.notEqual(user1.id, user2.id);
		});
		it('should return the same object when a user already exists', function() {
			var username = 'username';
			var user1 = userRepository.create(username);
			var user2 = userRepository.create(username);
			assert.deepEqual(user1, user2);
		});
		it('should return the same object when a user with the same name but different capitalisation already exists', function() {
			var username = 'userName';
			var otherUsername = 'Username';
			var user1 = userRepository.create(username);
			var user2 = userRepository.create(otherUsername);
			assert.deepEqual(user1, user2);
		});
	});
	
	describe('#get()', function() {
		it('should return null when called with a zero ID', function() {
			assert.strictEqual(null, userRepository.get(0));
		});
		it('should return a user when a user with that ID exists', function() {
			var user = userRepository.create('username');
			var id = user.id;
			
			var result = userRepository.get(id);
			
			assert.deepEqual(user, result);
		});
		it('should return null when the ID is larger than the maximum ID', function() {
			userRepository.create('user1');
			userRepository.create('user2');
			var lastUser = userRepository.create('user3');
			assert.strictEqual(null, userRepository.get(lastUser.id + 1));
		});
	});
	
	describe('#findByName()', function() {
		it('should return null when username is empty, null or undefined', function() {
			assert.strictEqual(null, userRepository.findByName());
			assert.strictEqual(null, userRepository.findByName(null));
			assert.strictEqual(null, userRepository.findByName(''));
		});
		it('should return a user when a user with that username exists', function() {
			var username = 'username';
			userRepository.create('otherUser1');
			userRepository.create('otherUser2');
			var user = userRepository.create(username);
			userRepository.create('otherUser3');
			userRepository.create('otherUser4');
			
			var result = userRepository.findByName(username);
			
			assert.deepEqual(user, result);
		});
		it('should consider users with same names but different capitalisation identical', function() {
			var username = 'userName';
			var user = userRepository.create(username);
			
			var result = userRepository.findByName('Username');
			
			assert.deepEqual(user, result);
		});
	});
});
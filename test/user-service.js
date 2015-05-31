var mockery = require('mockery');
var assert = require('assert');
var sinon = require('sinon');

var userService;

describe('UserService', function() {
	var userRepository = {
		create: sinon.stub(),
		findByName: sinon.stub()
	};
	var user = {
		id: 0,
		username: 'myUsername'
	};
	
	before(function() {
		mockery.enable();
		mockery.registerMock('./user-repository', userRepository);
		mockery.registerAllowable('../lib/user-service');
		userService = require('../lib/user-service');
	});
	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});

	beforeEach(function() {
		userRepository.create.reset();
		userRepository.findByName.reset();
	});
	
	describe('#signIn()', function() {
		it('should return the user from the repository if it exists', function() {
			var username = 'username';
			userRepository.findByName.withArgs(username).returns(user);
			
			var result = userService.signIn(username, {});
			
			assert.strictEqual(user, result);
		});
		it('should create a new user and return it if it doesn\'t exist', function() {
			var username = 'username';
			userRepository.findByName.withArgs(username).returns(null);
			userRepository.create.withArgs(username).returns(user);

			var result = userService.signIn(username);
			
			assert.strictEqual(user, result);
		});
	});
});
var mockery = require('mockery');
var assert = require('assert');
var sinon = require('sinon');

var chatActions;

describe('ChatActions', function() {
	var userService = {
		signIn: sinon.stub()
	};
	var connection = {};
	var user = {
		id: 0,
		username: 'myUsername'
	};
	
	before(function() {
		mockery.enable();
		mockery.registerMock('./user-service', userService);
		mockery.registerAllowable('../lib/chat-actions');
		chatActions = require('../lib/chat-actions');
	});
	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
	beforeEach(function() {
		userService.signIn.reset();
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
});
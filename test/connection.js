var mockery = require('mockery');
var assert = require('assert');
var sinon = require('sinon');

var Connection;

describe('Connection', function() {
	var chatActions = {};
	var socket = {
		on: sinon.stub()
	};
	var noop = function() {};
	var data = {};
	
	before(function() {
		mockery.enable();
		mockery.registerMock('./chat-actions', chatActions);
		mockery.registerAllowable('../lib/connection');
		Connection = require('../lib/connection');
	});
	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
	beforeEach(function() {
		for (var member in chatActions) {
			if (chatActions.hasOwnProperty(member)) {
				delete chatActions[member];
			}
		}
		socket.on.reset();
	});
	
	describe('#__construct()', function() {
		it('should set the socket passed', function() {
			var connection = new Connection(socket);
			assert.strictEqual(socket, connection.socket);
		});
		it('should initialise with empty userData', function() {
			var connection = new Connection(socket);
			assert.strictEqual(null, connection.userData);
		})
		it('should create a callback on socket with for each member of chatActions', function() {
			chatActions.firstNamespace = {
				firstAction: noop,
				secondAction: noop,
			};
			chatActions.secondNamespace = {
				thirdAction: noop,
				fourthAction: noop,
			};
			
			new Connection(socket);
			
			assert.equal(4, socket.on.callCount);
			assert.ok(socket.on.calledWith('firstNamespace/firstAction'));
			assert.ok(socket.on.calledWith('firstNamespace/secondAction'));
			assert.ok(socket.on.calledWith('secondNamespace/thirdAction'));
			assert.ok(socket.on.calledWith('secondNamespace/fourthAction'));
		});
		it('should create a callback on socket removing the $ prefix', function() {
			chatActions.namespace = {
				$member: noop,
			};
			
			new Connection(socket);

			assert.ok(socket.on.calledOnce, 'socket.on called once');
			assert.ok(socket.on.calledWith('namespace/member'), 'socket.on called with the right parameters');
		});
		it('should call through to unsecured methods when socket emits event even if the user is not signed in', function() {
			var method = sinon.stub();
			chatActions.unsecured = {
				$doIt: method
			};
			var connection = new Connection(socket);
			var callback = socket.on.firstCall.args[1];
			callback(data);
			
			assert.ok(method.calledOnce);
			assert.ok(method.calledWithExactly(connection, data));
		});
		it('should not call through to secured methods, and throw an error, when emits event when the user is not signed in', function() {
			var method = sinon.stub();
			chatActions.secured = {
				doIt: method
			};
			var connection = new Connection(socket);
			var callback = socket.on.firstCall.args[1];
			
			assert.throws(function() {
				callback(data);
			});
			assert.ok(!method.called);
		});
		it('should call through to secured methods when socket emits event when the user is signed in', function() {
			var method = sinon.stub();
			chatActions.secured = {
				doIt: method
			};
			var connection = new Connection(socket);
			connection.userData = {}; // User is considered signed in when userData is set
			var callback = socket.on.firstCall.args[1];
			
			callback(data);
			assert.ok(method.calledOnce);
			assert.ok(method.calledWithExactly(connection, data));
		});
	});
});
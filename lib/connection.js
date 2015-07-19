var actions = require('./chat-actions');

function Connection(socket) {
	this.socket = socket;
	this.userData = null;
	
	attachListeners(this);
}

function attachListeners(connection) {
	for (namespace in actions) {
		if (!actions.hasOwnProperty(namespace)) {
			continue;
		}
		var namespaceObject = actions[namespace];
		for (action in namespaceObject) {
			if (!namespaceObject.hasOwnProperty(action)) {
				continue;
			}
			(function() { // Wrap to preserve scope
				var actionObject = namespaceObject[action];
				connection.socket.on(namespace + '/' + action, function(data) {
					try {
						actionObject.call(null, connection, data);
					} catch (e) {
						connection.socket.emit('system/error', e.message);
					}
				});
			})();
		}
	}
}

module.exports = Connection;
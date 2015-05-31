function User(id, username) {
	this.id = id;
	this.username = username;
}

function UserRepository() {
	var self = this;
	var users = [];
	
	this.create = function(username) {
		var user = self.findByName(username);
		if (!user) {
			user = new User(users.length + 1, username);
			users.push(user);
		}
		return user;
	};
	
	this.get = function(id) {
		if (id <= users.length && id >= 1 && users[id - 1]) {
			return users[id - 1];
		}
		return null;
	};
	
	this.findByName = function(username) {
		if (!username) {
			return null;
		}
		var normalUsername = username.toLowerCase();
		for (var i = 0; i < users.length; i++) {
			if (users[i].username.toLowerCase() === normalUsername) {
				return users[i];
			}
		}
		return null;
	};
}

module.exports = UserRepository;
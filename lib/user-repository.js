function User(id, username) {
	this.id = id;
	this.username = username;
}

function UserRepository() {
	this.users = [];
}

UserRepository.prototype.create = function(username) {
	var user = this.findByName(username);
	if (!user) {
		user = new User(this.users.length + 1, username);
		this.users.push(user);
	}
	return user;
};

UserRepository.prototype.get = function(id) {
	if (id <= this.users.length && id >= 1 && this.users[id - 1]) {
		return this.users[id - 1];
	}
	return null;
};

UserRepository.prototype.findByName = function(username) {
	if (!username) {
		return null;
	}
	var normalUsername = username.toLowerCase();
	for (var i = 0; i < this.users.length; i++) {
		if (this.users[i].username.toLowerCase() === normalUsername) {
			return this.users[i];
		}
	}
	return null;
};

module.exports = UserRepository;
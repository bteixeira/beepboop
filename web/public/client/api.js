window.P = window.P || {};

P.API = {
	getBatch: function (callback) {
		$.get('/api/getNextSet', function (data) {
			data = data.map(function (it) {
				return new P.models.guessItem(it);
			});
			callback(data);
		});
	},
	makeGuess: function (id, guess, callback) {
		$.post('/api/makeGuess', {id: id, guess: guess}, function (data) {
			P.user.updateStats(data.stats);
			callback(data.correct);
		});
	},
	buyImage: function (id, callback) {
		$.post('/api/buyImage', {id: id}, function (data) {
			P.user.updateStats(data.stats);
			callback(data);
		});
	}
};

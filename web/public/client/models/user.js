window.P = window.P || {};

P.models = P.models || {};

P.models.user = Backbone.Model.extend({
	updateStats: function (stats) {
		this.set('credits', stats.credits);
		this.set('score', stats.score);
		this.set('guesses', stats.guesses);
		this.set('hits', stats.hits);
	}
});

P.user = new P.models.user({
	name: $('h1.name').text(),
	credits: parseFloat($('.credits-data').first().text())
});

P.user.on('change:credits', function (user, credits) {
	$('.credits-data').text(credits);
	if (credits >= 10) {
		$('#game-summary-items .game-summary-item button').removeAttr('disabled');
	} else {
		$('#game-summary-items .game-summary-item button').attr('disabled', '');
	}
});

P.user.on('change:score', function (user, credits) {
	$('.score-data').text(credits);
});
P.user.on('change:guesses change:hits', function (user) {
	$('.percent-data').text((user.get('hits') / user.get('guesses') * 100).toFixed(1) + '%');
});

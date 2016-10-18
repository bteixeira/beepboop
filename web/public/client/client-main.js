$(function () {

	var cmpQueue = P.comps.guessQueue('#guess-items');

	$('#btn-start').on('click', function () {

		P.overlay.show();
		P.API.getBatch(function (batch) {
			batch.forEach(function (item) {
				var guessItem = P.comps.guessItem(item);
				cmpQueue.addItem(guessItem);
			});

			$('body').removeClass('show-dashboard').toggleClass('show-game', true);
			P.overlay.hide();
		});

	});

	$('#btn-fake').on('click', function () {
		cmpQueue.getTopItem().makeGuess('fake');
	});

	$('#btn-real').on('click', function () {
		cmpQueue.getTopItem().makeGuess('real');
	});

});
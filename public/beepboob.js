/**
 * Created by bruno on 02.01.16.
 */
$(function () {

	var $container = $('<div class="container"></div>');
	$('body').append($container);

	$container.text('Loading');

	var i = 1;
	var id = setInterval(function () {
		i++;
		$container.text('Loading' + new Array(i).join('.'))
	}, 500);

	$.get('http://localhost:9009', function (response) {

		clearInterval(id);

		$container.text('Choose:');
		$container.append('<pre>' + response + '</pre>');
	});

});

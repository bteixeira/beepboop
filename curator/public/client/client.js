$(function () {
    $.get('/api/getNextSet', function (data) {
        data.forEach(function (image) {

            function makeGuess(guess) {
                $.post('/api/makeGuess', {user: 'Kintaro', id: image.id, guess: guess}, function (data) {
                    console.log(data);
                    $buttons.find('button').attr('disabled', true);
                    $div.append(
                        '<div class="result">Your answer is <span class="' +
                            (data.correct ? 'correct' : 'wrong') + '">' +
                            (data.correct ? 'Correct' : 'Wrong') + '</span>! They are ' +
                            (data.correct ? guess : (guess === 'fake' ? 'real' : 'fake')) +
                        '</div>'
                    );
                });
            }

            var $img = $('<img src="data:' + image.mimeType + ';base64,' + image.contents + '">');

            var $buttonFake = $('<button type="button">Fake</button>');
            $buttonFake.on('click', function (ev) {
                makeGuess('fake');
            });

            var $buttonReal = $('<button type="button">Real</button>');
            $buttonReal.on('click', function (ev) {
                makeGuess('real');
            });

            var $buttons = $('<div class="buttons"></div>');
            $buttons.append($buttonFake);
            $buttons.append($buttonReal);

            var $div = $('<div class="section"></div>');
            $div.append($img);
            $div.append($buttons);

            $('#container').append($div);
        });
    });
});
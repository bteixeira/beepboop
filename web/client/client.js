$(function () {

    var credits = 1;

    function updateCredits(diff) {
        if (typeof diff !== 'number' || isNaN(diff)) {
            diff = 0;
        }
        credits += diff;
        $('#credits').text(credits);
    }
    updateCredits();

    $.get('/api/getNextSet', function (data) {
        data.forEach(function (image) {

            function makeGuess(guess) {
                $.post('/api/makeGuess', {user: 'Kintaro', id: image.id, guess: guess}, function (data) {
                    console.log(data);
                    if (data.correct) {
                        updateCredits(1);
                    }
                    $buttons.find('button').attr('disabled', true);
                    $div.append(
                        '<div class="result">Your answer is <span class="' +
                            (data.correct ? 'correct' : 'wrong') + '">' +
                            (data.correct ? 'Correct' : 'Wrong') + '</span>! They are ' +
                            (data.correct ? guess : (guess === 'fake' ? 'real' : 'fake')) +
                            '.' + (data.correct ? ' +1 Credit.' : '') +
                        '</div>'
                    );
                    var $buttonShowImage = $('<button type="button">Show Full Image (3 Credits)</button>');
                    $buttonShowImage.on('click', function (ev) {
                        if (credits >= 3) {
                            updateCredits(-3);
                            $.get('/api/getImageById?id=' + image.id, function (fullImage) {
                                $img.attr('src', 'data:' + fullImage.mimeType + ';base64,' + fullImage.contents);
                                $img.toggleClass('expanded', true);
                            });
                        } else {
                            console.log('Not enough credits!');
                        }
                    });

                    var $buttons2 = $('<div class="buttons"></div>');
                    $buttons2.append($buttonShowImage);

                    $div.append($buttons2);
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
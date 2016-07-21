$(function () {
    $.get('/api/getNextSet', function (data) {
        data.forEach(function (image) {
            var $img = $('<img src="data:' + image.mimeType + ';base64,' + image.contents + '">');
            $img.on('click', function (ev) {
                $.post('/api/makeGuess', {user: 'Kintaro', id: image.id, guess: 1}, function (data) {
                    console.log(data);
                });
            });
            $('#container').append($img);
        });
    });
});
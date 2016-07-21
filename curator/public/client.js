$(function () {
    $.get('/api/getNextSet', function (data) {
        data.forEach(function (image) {
            $('#container').append(
                '<img src="data:' + image.mimeType + ';base64,' + image.contents + '">'
            );
        });
    });
});
$(function () {
    var $img = $('#image');

    $.get('http://localhost:9000/api/getImage', function (data) {
        //console.log(arguments);
        $img.attr('src', 'data:' + data.mimeType + ';base64,' + data.contents);


        $img.on('mousedown', function (ev) {
            console.log(ev);

            var $oTop = $('<div class="image-blur-overlay"/>');
            $oTop.css('top', 0);
            $oTop.css('left', 0);
            $oTop.css('width', '100%');
            $oTop.css('height', ev.offsetY);

            var $oBottom = $('<div class="image-blur-overlay"/>');
            $oBottom.css('top', ev.offsetY+1);
            $oBottom.css('left', 0);
            $oBottom.css('width', '100%');
            $oBottom.css('bottom', 0);

            var $oLeft = $('<div class="image-blur-overlay"/>');
            $oLeft.css('top', ev.offsetY);
            $oLeft.css('left', 0);
            $oLeft.css('width', ev.offsetX);
            $oLeft.css('height', 1);

            var $oRight = $('<div class="image-blur-overlay"/>');
            $oRight.css('top', ev.offsetY);
            $oRight.css('right', 0);
            $oRight.css('left', ev.offsetX);
            $oRight.css('height', 0);

            $('#image-area').append($oTop);
            $('#image-area').append($oBottom);
            $('#image-area').append($oLeft);
            //$('#image-area').append($oRight);

            $('#image-area').on('mousemove.down', function (ev) {
               //console.log(ev);
            });


        });

        $('#image-area').on('mouseup', function () {
            $('#image-area').off('mousemove.down');
            console.log('done!');
        });
    });
});



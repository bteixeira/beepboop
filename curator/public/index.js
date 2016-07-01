$(function () {

    for (var m in META) {
        $('#controls').append('<div><label for="control-' + m + '">' + m + '</label><select name="' + m + '">' +
            '<option value=""' + (m in META_DEFAULTS ? '' : ' selected') + '></option>' +
            META[m].map(function (value) {
                return '<option value="' + value + '"' + (m in META_DEFAULTS && value === META_DEFAULTS[m] ? ' selected' : '') + '>' + value + '</option>'
            }).join('') +

            '</select>');
    }

    var $img = $('#image');
    var $imageArea = $('#image-area');

    var clickStart = {};
    var crop = {};

    var $oTop;
    var $oBottom;
    var $oLeft;
    var $oRight;

    function getImageCoords(ev) {
        var y = (
            ev.pageY -
            $imageArea.offset().top -
            parseInt($imageArea.css('border-top-width'), 10) -
            parseInt($imageArea.css('padding-top'), 10)
        );
        if (y > $imageArea.height()) {
            y = $imageArea.height();
        }
        if (y < 0) {
            y = 0;
        }
        var x = (
            ev.pageX -
            $imageArea.offset().left -
            parseInt($imageArea.css('border-left-width'), 10) -
            parseInt($imageArea.css('padding-left'), 10)
        );
        if (x > $imageArea.width()) {
            x = $imageArea.width();
        }
        if (x < 0) {
            x = 0;
        }

        return {
            y: y,
            x: x
        }
    }

    function initSize(ev) {
        var c = getImageCoords(ev);

        crop.x = c.x;
        crop.y = c.y;
        crop.w = 1;
        crop.h = 1;

        clickStart.x = c.x;
        clickStart.y = c.y;
    }

    function refreshSize() {
        $oTop.css('top', 0);
        $oTop.css('left', 0);
        $oTop.css('width', '100%');
        $oTop.css('height', crop.y);

        $oBottom.css('top', crop.y + crop.h);
        $oBottom.css('left', 0);
        $oBottom.css('width', '100%');
        $oBottom.css('bottom', 0);

        $oLeft.css('top', crop.y);
        $oLeft.css('left', 0);
        $oLeft.css('width', crop.x);
        $oLeft.css('height', crop.h);

        $oRight.css('top', crop.y);
        $oRight.css('right', 0);
        $oRight.css('left', crop.x + crop.w);
        $oRight.css('height', crop.h);
    }

    function setModel(model) {
        $('.model-name').text(model.name);
        $('.model-link').text(model.source + ' / ' + model.slug);
        $('.model-link').attr('href', 'http://www.' + model.source + '.com/babe/' + model.slug);
        $('.model-attrs').empty();
        for (var p in model.attributes) {
            $('.model-attrs').append('<dt>' + p + '</dt><dd>' + model.attributes[p] + '</dd>');
        }
    }

    function setImage(image) {
        $img.attr('src', 'data:' + image.mimeType + ';base64,' + image.contents);
        $('.image-link').text(image.filename);
        $('.image-link').attr('href', image.url);
        $('.image-hash').text(image.hash);
        $('.image-mime').text(image.mimeType);

        $('.image-size').text(atob(image.contents).length + ' bytes');
        $('.image-res').text($img[0].naturalWidth + '\u00d7' + $img[0].naturalHeight);
    }

    window.requestImage = function () {
        $.get('http://localhost:9000/api/getImage', function (data) {

            setModel(data.model);
            setImage(data.image);

            $imageArea.on('mousedown', function (ev) {

                $('.image-selection-overlay').toggleClass('hidden', true);

                if (!$oTop) {
                    $oTop = $('<div class="image-blur-overlay"/>');
                    $imageArea.append($oTop);
                }
                if (!$oBottom) {
                    $oBottom = $('<div class="image-blur-overlay"/>');
                    $imageArea.append($oBottom);
                }
                if (!$oLeft) {
                    $oLeft = $('<div class="image-blur-overlay"/>');
                    $imageArea.append($oLeft);
                }
                if (!$oRight) {
                    $oRight = $('<div class="image-blur-overlay"/>');
                    $imageArea.append($oRight);
                }

                initSize(ev);
                refreshSize();
                ev.preventDefault(); // Don't let browser drag the image around

                $('body').on('mousemove.resize', function (ev) {
                    var c = getImageCoords(ev);

                    if (c.x >= clickStart.x) {
                        crop.x = clickStart.x;
                        crop.w = c.x - clickStart.x + 1;
                    } else {
                        crop.x = c.x;
                        crop.w = clickStart.x - c.x + 1;
                    }

                    if (c.y >= clickStart.y) {
                        crop.y = clickStart.y;
                        crop.h = c.y - clickStart.y + 1;
                    } else {
                        crop.y = c.y;
                        crop.h = clickStart.y - c.y + 1;
                    }


                    refreshSize();
                });


                $('body').one('mouseup', function () {
                    $('body').off('mousemove.resize');
                    console.log('done!');
                    console.log(crop);
                    remakeSelectionOVerlay();

                });

            });

        });
    };

    window.requestImage();

    function remakeSelectionOVerlay () {
        $('.image-selection-overlay').removeClass('hidden');
        $('.image-selection-overlay').css('top', crop.y - 2);
        $('.image-selection-overlay').css('left', crop.x - 2);
        $('.image-selection-overlay').css('width', crop.w);
        $('.image-selection-overlay').css('height', crop.h);
    }

    $('.image-selection-overlay').on('mousedown', function (ev) {
        console.log('dragging');
        ev.stopPropagation();
        ev.preventDefault();

        $('.image-selection-overlay').toggleClass('hidden', true);
        $imageArea.toggleClass('dragging', true);

        var c = getImageCoords(ev);
        clickStart.x = c.x;
        clickStart.y = c.y;
        console.log(c);

        $('body').on('mousemove.drag', function (ev) {
            var c = getImageCoords(ev);

            // 1 check diff from clickStart
            var diff = {
                x: c.x - clickStart.x,
                y: c.y - clickStart.y
            };

            // 2 add that vector to crop.xy
            crop.x += diff.x;
            crop.y += diff.y;

            // 3 assign c to clickStart
            clickStart = c;

            if (crop.y + crop.h > $imageArea.height()) {
                crop.y = $imageArea.height() - crop.h;
            }
            if (crop.y < 0) {
                crop.y = 0;
            }
            if (crop.x + crop.w > $imageArea.width()) {
                crop.x = $imageArea.width() - crop.w;
            }
            if (crop.x < 0) {
                crop.x = 0;
            }

            refreshSize();
        });

        $(this).toggleClass('dragging', true);
        $('body').one('mouseup', function () {
            console.log('end');
            $('body').off('mousemove.drag');
            $imageArea.removeClass('dragging');
            remakeSelectionOVerlay();
        });
    });
});



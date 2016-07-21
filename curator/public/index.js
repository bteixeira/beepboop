$(function () {

    var META;

    $.getJSON('/meta.config.json', function (data) {
        META = data;
        for (var m in META) {
            $('#controls').append(
                '<div>' +
                '<label for="control-' + m + '" title="' + META[m].description + '">' + META[m].name + '</label>' +
                '<select name="' + m + '">' +
                '<option value=""' + ('default' in META[m] ? '' : ' selected') + '></option>' +
                META[m].values.map(function (value) {
                    var val, desc;
                    if (typeof value === 'object') {
                        val = desc = value.value;
                        if ('description' in value) {
                            desc = value.description;
                        }
                    } else {
                        val = desc = value;
                    }
                    return '<option value="' + val + '"' + (val === META[m].default ? ' selected' : '') + '>' + desc + '</option>'
                }).join('') +
                '</select>' +
                '</div>'
            );
        }
    });

    var Controller = window.Controller = {};

    var $img = $('#image');
    var $imageArea = $('#image-area');
    var $imageAreaContainer = $('#image-area-container');

    var maxHeight = $imageAreaContainer.innerHeight();
    $img.css('max-height', maxHeight);
    $(window).on('resize', function () {
        var maxHeight_ = $imageAreaContainer.innerHeight();
        if (maxHeight_ !== maxHeight) {
            maxHeight = maxHeight_;
            $img.css('max-height', maxHeight);
        }
    });


    var clickStart = {};
    var crop = {};

    var $oTop;
    var $oBottom;
    var $oLeft;
    var $oRight;

    /**
     * Converts absolute page click coordinates into percentual coordinates relative to the image
     * @param ev
     * @returns {{y: number, x: number}}
     */
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
        var x = Math.round(
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
            y: y / $imageArea.height(),
            x: x / $imageArea.width()
        }
    }

    /**
     * Makes sure the blur overlay is according to crop
     */
    function refreshSize() {
        $oTop.css('top', 0);
        $oTop.css('left', 0);
        $oTop.css('width', '100%');
        $oTop.css('height', (crop.y * 100) + '%');

        $oBottom.css('top', (crop.y + crop.h) * 100 + '%');
        $oBottom.css('left', 0);
        $oBottom.css('width', '100%');
        $oBottom.css('bottom', 0);

        $oLeft.css('top', (crop.y * 100) + '%');
        $oLeft.css('left', 0);
        $oLeft.css('width', (crop.x * 100) + '%');
        $oLeft.css('height', (crop.h * 100) + '%');

        $oRight.css('top', (crop.y * 100) + '%');
        $oRight.css('right', 0);
        $oRight.css('left', (crop.x + crop.w) * 100 + '%');
        $oRight.css('height', (crop.h * 100) + '%');

        $('#input-crop-x').val(Math.round(crop.x * $img[0].naturalWidth));
        $('#input-crop-y').val(Math.round(crop.y * $img[0].naturalHeight));
        $('#input-crop-w').val(Math.round(crop.w * $img[0].naturalWidth));
        $('#input-crop-h').val(Math.round(crop.h * $img[0].naturalHeight));
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

    Controller.requestImage = function () {

        $oTop = $oBottom = $oLeft = $oRight = null;

        $.get('/api/getImage' + (skip ? '?skip=' + skip : ''), function (data) {

            setModel(data.model);
            setImage(data.image);

        });
    };

    $imageArea.on('mousedown', function (ev) {

        if (ev.buttons !== 1) {
            return;
        }

        $('.image-selection-overlay').toggleClass('hidden', true);

        if (!$oTop) {
            $oTop = $('<div class="image-blur-overlay top"/>');
            $imageArea.append($oTop);
        }
        if (!$oBottom) {
            $oBottom = $('<div class="image-blur-overlay bottom"/>');
            $imageArea.append($oBottom);
        }
        if (!$oLeft) {
            $oLeft = $('<div class="image-blur-overlay left"/>');
            $imageArea.append($oLeft);
        }
        if (!$oRight) {
            $oRight = $('<div class="image-blur-overlay right"/>');
            $imageArea.append($oRight);
        }

        clickStart = getImageCoords(ev);
        crop.x = clickStart.x;
        crop.y = clickStart.y;
        crop.w = 0;
        crop.h = 0;
        refreshSize();
        ev.preventDefault(); // Don't let browser drag the image around

        $('body').on('mousemove.resize', function (ev) {
            var c = getImageCoords(ev);

            if (c.x >= clickStart.x) {
                crop.x = clickStart.x;
                crop.w = c.x - clickStart.x;
            } else {
                crop.x = c.x;
                crop.w = clickStart.x - c.x;
            }

            if (c.y >= clickStart.y) {
                crop.y = clickStart.y;
                crop.h = c.y - clickStart.y;
            } else {
                crop.y = c.y;
                crop.h = clickStart.y - c.y;
            }


            refreshSize();
        });


        $('body').one('mouseup', function () {
            $('body').off('mousemove.resize');
            console.log('done selecting!');
            // console.log(crop);

            if (crop.h === 0 || crop.w === 0) {
                crop = {};
                $oTop.remove();
                $oTop = null;
                $oBottom.remove();
                $oBottom = null;
                $oLeft.remove();
                $oLeft = null;
                $oRight.remove();
                $oRight = null;
                $('.image-selection-overlay').toggleClass('hidden', true);
                $('#form-crop input').val('');
            } else {
                remakeSelectionOVerlay();
            }
        });

    });

    Controller.requestImage();

    function remakeSelectionOVerlay() {
        $('.image-selection-overlay').removeClass('hidden');
        $('.image-selection-overlay').css('top', 'calc(' + (crop.y * 100) + '% - 2px)');
        $('.image-selection-overlay').css('left', 'calc(' + (crop.x * 100) + '% - 2px)');
        $('.image-selection-overlay').css('width', (crop.w * 100) + '%');
        $('.image-selection-overlay').css('height', (crop.h * 100) + '%');
    }


    $('.image-selection-overlay').on('mousedown', function (ev) {
        console.log('dragging');
        ev.stopPropagation();
        ev.preventDefault();

        var $handle = $(ev.target);
        var mode;
        console.log(ev.target);
        if ($handle.is('.resize-handle')) {
            mode = 'resize';
        } else {
            mode = 'drag';
        }
        console.log('mode', mode);

        $('.image-selection-overlay').toggleClass('hidden', true);
        $imageArea.toggleClass('dragging', true);

        var c = getImageCoords(ev);
        clickStart.x = c.x;
        clickStart.y = c.y;

        $('body').on('mousemove.drag', function (ev) {
            var c = getImageCoords(ev);


            if (mode === 'resize') {
                if ($handle.is('.top-left')) {
                    crop.w += crop.x - c.x;
                    crop.x = c.x;
                    crop.h += crop.y - c.y;
                    crop.y = c.y;
                } else if ($handle.is('.top')) {
                    crop.h += crop.y - c.y;
                    crop.y = c.y;
                } else if ($handle.is('.top-right')) {
                    crop.w = c.x - crop.x;
                    crop.h += crop.y - c.y;
                    crop.y = c.y;
                } else if ($handle.is('.left')) {
                    crop.w += crop.x - c.x;
                    crop.x = c.x;
                } else if ($handle.is('.right')) {
                    crop.w = c.x - crop.x;
                } else if ($handle.is('.bottom-left')) {
                    crop.w += crop.x - c.x;
                    crop.x = c.x;
                    crop.h = c.y - crop.y;
                } else if ($handle.is('.bottom')) {
                    crop.h = c.y - crop.y;
                } else if ($handle.is('.bottom-right')) {
                    crop.w = c.x - crop.x;
                    crop.h = c.y - crop.y;
                }

            } else {// dragging

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

                if (crop.y + crop.h > 1) {
                    crop.y = 1 - crop.h;
                }
                if (crop.y < 0) {
                    crop.y = 0;
                }
                if (crop.x + crop.w > 1) {
                    crop.x = 1 - crop.w;
                }
                if (crop.x < 0) {
                    crop.x = 0;
                }
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

    var skip = 0;
    Controller.skipImage = function () {
        skip += 1;
        this.requestImage();
    };
    Controller.resetSkip = function () {
        skip = 0;
        this.requestImage();
    };
});



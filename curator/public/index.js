$(function () {

    var $img = $('#image');
    var $imageArea = $('#image-area');

    var clickStart = {};
    var crop = {};


    $.get('http://localhost:9000/api/getImage', function (data) {
        $img.attr('src', 'data:' + data.image.mimeType + ';base64,' + data.image.contents);

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
            var x = (
                ev.pageX -
                $imageArea.offset().left -
                parseInt($imageArea.css('border-left-width'), 10) -
                parseInt($imageArea.css('padding-left'), 10)
            );

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

        $imageArea.on('mousedown', function (ev) {

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

            $imageArea.on('mousemove.resize', function (ev) {
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


        });

        $imageArea.on('mouseup mouseleave', function () {
            $imageArea.off('mousemove.resize');
            console.log('done!');
            console.log(crop);
            // TODO ADD CENTER OVERLAY TO ALLOW DRAGGING SELECTION
        });


    });
});



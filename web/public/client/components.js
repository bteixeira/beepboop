window.P = window.P || {};

var SAFE_MODE = 'cage';

P.comps = {
    guessItem: function (item) {
        var $comp = $('<div class="guess-item"></div>');
        var $img = $('<img src="' + item.getSrc() + '">');
        if (SAFE_MODE === 'cage') {
            $img.attr('src', 'http://www.placecage.com/' + $img[0].naturalWidth + '/' + $img[0].naturalHeight);
        }
        $comp.append($img);
        var r = Math.round(Math.random() * 14) - 7;
        $comp.css('transform', 'translate(-50%, -50%) rotate(' + r + 'deg)');
        $comp.on('mousedown touchstart', function (ev) {
            ev.preventDefault();
            var x = ev.pageX;
            var y = ev.pageY;
            var lastX;
            var lastY;
            if (typeof x === 'undefined' && ev.originalEvent.touches) {
                x = ev.originalEvent.touches.item(0).pageX;
                y = ev.originalEvent.touches.item(0).pageY;
            }
            var top = $('#guess-items').outerHeight() / 2;
            var left = $('#guess-items').outerWidth() / 2;
            $comp.css('top', top);
            $comp.css('left', left);
            $comp.toggleClass('dragging', true);
            $('body').on('mouseup.drag touchend.drag', function (ev) {
                $comp.removeClass('dragging');
                $('body').off('.drag');
                $comp.off('.drag');



                $comp.css({top: '', left: ''});

                var pageX = ev.pageX;
                if (typeof pageX === 'undefined') {
                    pageX = lastX;
                }
                var diff = pageX - x;
                var w = $('#guess-items').outerWidth();
                if (diff + w/2 < 0) {
                    console.log('swipe left');
                } else if (diff + w/2 > w) {
                    console.log('swipe right');
                } else {
                    console.log('no swipe');
                }
            });
            $('body').on('mousemove.drag', function (ev) {
                // console.log('' + (ev.pageX - x) + 'x' + (ev.pageY - y));
                $comp.css('top', (ev.pageY - y + top));
                $comp.css('left', (ev.pageX - x + left));
            });
            $comp.on('touchmove.drag', function (ev) {
                var touch = ev.originalEvent.touches.item(0);
                // console.log('' + (touch.pageX - x) + 'x' + (touch.pageY - y));
                $comp.css('top', (touch.pageY - y + top));
                $comp.css('left', (touch.pageX - x + left));
                lastX = touch.pageX;
                lastY = touch.pageY;
            });
        });

        return $comp;
    }
};

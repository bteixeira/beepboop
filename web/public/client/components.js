window.P = window.P || {};

// var SAFE_MODE = 'cage';
var SAFE_MODE = false;

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

                var pageX = ev.pageX;
                if (typeof pageX === 'undefined') {
                    pageX = lastX;
                }
                var diff = pageX - x;
                var w = $('#guess-items').outerWidth();
                if (diff + w/2 < 0) {
                    // console.log('swipe left');
                    P.overlay.show();
                    $comp.remove();
                    P.API.makeGuess(item.id, 'fake', function (correct) {
                        if (correct) {
                            P.overlay.showAlert('Correct!<br>They\'re Fake!');
                        } else {
                            P.overlay.showAlert('Wrong!<br>They\'re Real!');
                        }
                    });
                } else if (diff + w/2 > w) {
                    // console.log('swipe right');
                    P.overlay.show();
                    $comp.remove();
                    P.API.makeGuess(item.id, 'real', function (correct) {
                        if (correct) {
                            P.overlay.showAlert('Correct!<br>They\'re Real!');
                        } else {
                            P.overlay.showAlert('Wrong!<br>They\'re Fake!');
                        }
                    });
                } else {
                    // console.log('no swipe');
                    $comp.css({top: '', left: ''});
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

window.P = window.P || {};

// var SAFE_MODE = 'cage';
var SAFE_MODE = false;

P.comps = {
    guessItem: function (item) {
        var $el = $('<div class="guess-item"></div>');
        var $img = $('<img src="' + item.getSrc() + '">');
        if (SAFE_MODE === 'cage') {
            $img.attr('src', 'http://www.placecage.com/' + $img[0].naturalWidth + '/' + $img[0].naturalHeight);
        }
        $el.append($img);
        var r = Math.round(Math.random() * 6) - 3;
        $el.css('transform', 'translate(-50%, -50%) rotate(' + r + 'deg)');

        var comp = {
            $el: $el,
            makeGuess: function (guess) {
                P.overlay.show();

                P.API.makeGuess(item.id, guess, function (correct) {
                    var truth = (guess === 'fake' && correct || guess === 'real' && !correct) ? 'Fake' : 'Real';
                    var verdict;
                    if (correct) {
                        verdict = '<span class="correct">Correct!</span>';
                    } else {
                        verdict = '<span class="wrong">Wrong!</span>';
                    }
                    P.overlay.showAlert(verdict + '<br>They\'re ' + truth + '!', function () {
                        $el.remove();
                        comp.trigger('remove');
                        checkRemaining();
                    });
                });

            }
        };

        _.extend(comp, Backbone.Events);

        function checkRemaining () {
            if (!$('.guess-item').length) {
                P.overlay.show();
                window.location = '/dashboard';
            }
        }

        $el.on('mousedown touchstart', function (ev) {
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
            $el.css('top', top);
            $el.css('left', left);
            $el.toggleClass('dragging', true);
            $('body').on('mouseup.drag touchend.drag', function (ev) {
                $el.removeClass('dragging');
                $('body').off('.drag');
                $el.off('.drag');

                var pageX = ev.pageX;
                if (typeof pageX === 'undefined') {
                    pageX = lastX;
                }
                var diff = pageX - x;
                var w = $('#guess-items').outerWidth();
                if (diff + w/2 < 0) {
                    // console.log('swipe left');
                    comp.makeGuess('fake');
                } else if (diff + w/2 > w) {
                    // console.log('swipe right');
                    comp.makeGuess('real');
                } else {
                    // console.log('no swipe');
                    $el.css({top: '', left: ''});
                }
            });
            $('body').on('mousemove.drag', function (ev) {
                // console.log('' + (ev.pageX - x) + 'x' + (ev.pageY - y));
                $el.css('top', (ev.pageY - y + top));
                $el.css('left', (ev.pageX - x + left));
            });
            $el.on('touchmove.drag', function (ev) {
                var touch = ev.originalEvent.touches.item(0);
                // console.log('' + (touch.pageX - x) + 'x' + (touch.pageY - y));
                $el.css('top', (touch.pageY - y + top));
                $el.css('left', (touch.pageX - x + left));
                lastX = touch.pageX;
                lastY = touch.pageY;
            });
        });

        return comp;
    },

    guessQueue: function (el) {
        var $el = $(el);

        var items = [];

        return {
            addItem: function (guessItem) {
                items.push(guessItem);
                $el.prepend(guessItem.$el);
                guessItem.on('remove', function () {
                    items = _.without(items, guessItem);
                });
            },
            getTopItem: function () {
                return items[0];
            }
        }

    }
};

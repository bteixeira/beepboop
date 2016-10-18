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
					$('#game-summary-items').append(P.comps.gameSummaryItem(item, truth.toLowerCase(), guess).$el);
					P.overlay.showAlert(verdict + '<br>They\'re ' + truth + '!', function () {
						$el.remove();
						comp.trigger('remove');
						checkRemaining();
					});
				});

			}
		};

		_.extend(comp, Backbone.Events);

		function checkRemaining() {
			if (!$('.guess-item').length) {
				$('#game').toggleClass('hidden', true);
				$('#game-summary').removeClass('hidden');
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
				if (diff + w / 2 < 0) {
					// console.log('swipe left');
					comp.makeGuess('fake');
				} else if (diff + w / 2 > w) {
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

	},

	gameSummaryItem: function (guessItem /*model*/, truth, guess) {
		var $el = $('<div class="game-summary-item"></div>');
		var $thumbnailContainer = $('<div class="thumbnail-container"></div>');
		var $img = $('<img src="' + guessItem.getSrc() + '">');
		$thumbnailContainer.append($img);
		$el.append($thumbnailContainer);
		$el.append('<div class="truth-box ' + (truth === guess ? 'correct' : 'wrong') + '">' + truth[0].toUpperCase() + truth.slice(1) + '</div>');
		var $button = $('<button type="button">Full Image (10 Credits)</button>');
		if (P.user.get('credits') < 0) {
			$button.attr('disabled', '');
		}
		$button.on('click', function () {
			P.overlay.show();
			P.API.buyImage(guessItem.id, function (data) {
				var src = 'data:' + data.image.mimeType + ';base64,' + data.image.contents;
				$img.attr('src', src);
				$img.on('click', function () {
					$('body').append(new P.comps.fullImageBox(src).$el);
				});
				$el.toggleClass('expanded', true);
				$button.parent().remove();
				$el.append('<div class="guess-item-data"><ul>' +
					'<li class="data-item">' + data.model.name + '</li>' +
					'<li class="data-item">' + data.model.attributes.Age + '</li>' +
					'<li class="data-item">Cup ' + data.model.attributes['Bra/cup size'] + '</li>' +
					'<li class="data-item">' + data.model.attributes['Profession'] + '</li>' +
					'<li class="data-item hint">(Tap image to expand)</li>' +
					'</ul></div>');
				$img.click();
				P.overlay.hide();
			});
		});
		var $controlGroup = $('<div class="control-group"></div>');
		$controlGroup.append($button);
		$el.append($controlGroup);

		return {
			$el: $el
		};
	},

	fullImageBox: function (src /* model */) {
		var $el = $('<div class="full-image-box"></div>');
		var $imageWrapper = $('<div class="full-image-wrapper"></div>');
		var $controlGroup = $('<div class="control-group"></div>');
		var $img = $('<img src="' + src + '">');
		var $btnSize = $('<button type="button">&#x2921;</button>');
		var $btnClose = $('<button type="button">&#x2716;</button>');

		$controlGroup.append($btnSize, $btnClose);
		$imageWrapper.append($img);
		$el.append($imageWrapper, $controlGroup);

		$btnClose.on('click', function () {
			$el.remove();
		});

		$btnSize.on('click', function () {
			$el.toggleClass('expanded');
		});

		return {$el: $el};
	}
};

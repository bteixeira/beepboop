/**
 * Utility for generating class names according to a set of conditions
 * @param prefix either a string that will be prefixed as is, or an array of strings to be joined. Any other type will be cast to string (if given an array of non-strings then each value in the array will be cast to String)
 * @param spec Object: the keys are class names and each value should be truthy if this class should be enabled or falsy otherwise
 * @returns {string} the final class name attribute that can be safely included in the DOM
 */
function cls (prefix, spec) {
	// Default value for `prefix`
	if (!prefix) {
		prefix = ''
	}
	// If there is only one argument then it's assumed to be the spec
	if (!spec) {
		spec = prefix
		prefix = ''
	}
	// The `prefix` can be either array or String (or other)
	if (prefix instanceof Array) {
		prefix = prefix.join(' ')
	} else {
		prefix = String(prefix)
	}
	// prefix is now a String. If not empty, pad it with a space
	if (prefix.length) {
		prefix += ' '
	}
	return prefix + Object.entries(spec) // append the prefix
		.filter(([className, value]) => value) // filter out falsy values
		.map(([className, value]) => className) // leave only the class name
		.join(' ') // space-separated
}

class CuratorApp extends React.Component {
	constructor (props) {
		super(props)
		this.state = {
			metaInfoControls: {},
			model: {
				attributes: {},
			},
			image: {},
			crop: {},
			showImageOverlay: false,
		}
		this.refs_ = {
			image: React.createRef(),
		}
	}

	render () {
		return (
			<div id="container">
				<CuratorAttributePanel
					model={this.state.model}
					image={this.state.image}
					imageWidth={this.refs_.image.current && this.refs_.image.current.naturalWidth}
					imageHeight={this.refs_.image.current && this.refs_.image.current.naturalHeight}
				/>
				<div id="image-container">
					<div id="image-area-container">
						<div id="image-area" onMouseDown={this.startSelecting.bind(this)}>
							{ this.state.image.contents && (
								<img id="image"
									 src="http://www.placecage.com/300/200"
									 // src={`data:${this.state.image.mimeType};base64,${this.state.image.contents}`}
									 ref={this.refs_.image}
								/>
							) }
							<div
								className={cls('image-selection-overlay', {
									'hidden': !this.state.showImageOverlay,
								})}
								onMouseDown={this.startDragging.bind(this)}
							>
								<div className="resize-handle top-left"/>
								<div className="resize-handle top"/>
								<div className="resize-handle top-right"/>
								<div className="resize-handle left"/>
								<div className="resize-handle right"/>
								<div className="resize-handle bottom-left"/>
								<div className="resize-handle bottom"/>
								<div className="resize-handle bottom-right"/>
							</div>
							{ (this.state.crop.w || this.state.crop.h) && (
								<React.Fragment>
									<div className="image-blur-overlay top" style={{
										top: 0,
										left: 0,
										width: '100%',
										height: (this.state.crop.y * 100) + '%',
									}}/>
									<div className="image-blur-overlay bottom" style={{
										top: (this.state.crop.y + this.state.crop.h) * 100 + '%',
										left: 0,
										width: '100%',
										bottom: 0,
									}}/>
									<div className="image-blur-overlay left" style={{
										top: (this.state.crop.y * 100) + '%',
										left: 0,
										width: (this.state.crop.x * 100) + '%',
										height: (this.state.crop.h * 100) + '%',
									}}/>
									<div className="image-blur-overlay right" style={{
										top: (this.state.crop.y * 100) + '%',
										right: 0,
										left: (this.state.crop.x + this.state.crop.w) * 100 + '%',
										height: (this.state.crop.h * 100) + '%',
									}}/>
								</React.Fragment>
							) }
						</div>
					</div>
				</div>
				<CuratorControls
					metaInfoControls={this.state.metaInfoControls}
					x={ this.refs_.image.current ?
							Math.round(this.state.crop.x * this.refs_.image.current.naturalWidth)
							: ''
					}
				/>
			</div>
		)
	}

	startSelecting (ev) {
		if (ev.buttons !== 1) {
			return;
		}

		this.setState({showImageOverlay: false})

		var clickStart = this.getImageCoords(ev);
		this.setState({clickStart});
		this.setState({crop: {
			x: clickStart.x,
			y: clickStart.y,
			w: 0,
			h: 0,
		}});
		ev.preventDefault(); // Don't let the browser drag the image around

		$('body').on('mousemove.resize', ev => {
			var c = this.getImageCoords(ev);
			var crop = {};

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

			this.setState({crop})
		});

		$('body').one('mouseup', () => {
			$('body').off('mousemove.resize');
			console.log('done selecting!');

			if (this.state.crop.h === 0 || this.state.crop.w === 0) {
				this.setState({
					showImageOverlay: false,
					crop: {},
				})
				$('#form-crop input').val('');
			} else {
				this.remakeSelectionOverlay();
			}
		});
	}

	startDragging (ev) {
		var $imageArea = $('#image-area');

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

		this.setState({showImageOverlay: false})
		$imageArea.toggleClass('dragging', true);

		var c = this.getImageCoords(ev);
		this.setState({clickStart: {x: c.x, y: c.y}});

		$('body').on('mousemove.drag', ev => {
			var c = this.getImageCoords(ev);
			var crop = {...this.state.crop};

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
					x: c.x - this.state.clickStart.x,
					y: c.y - this.state.clickStart.y,
				};

				// 2 add that vector to crop.xy
				crop.x += diff.x;
				crop.y += diff.y;

				// 3 assign c to clickStart
				this.setState({clickStart: c})

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

			this.setState({crop})
		});

		$(this).toggleClass('dragging', true);
		$('body').one('mouseup', () => {
			console.log('end');
			$('body').off('mousemove.drag');
			$imageArea.removeClass('dragging');
			this.remakeSelectionOverlay();
		});
	}

	remakeSelectionOverlay () {
		this.setState({showImageOverlay: true})
		$('.image-selection-overlay').css('top', 'calc(' + (this.state.crop.y * 100) + '% - 2px)');
		$('.image-selection-overlay').css('left', 'calc(' + (this.state.crop.x * 100) + '% - 2px)');
		$('.image-selection-overlay').css('width', (this.state.crop.w * 100) + '%');
		$('.image-selection-overlay').css('height', (this.state.crop.h * 100) + '%');
	}

	componentDidMount () {
		const me = this

		$.getJSON('/meta.config.json', data => {
			window.META = data;
			this.setState({metaInfoControls: data})
		});

		var Controller = window.Controller = {};

		var $imageAreaContainer = $('#image-area-container');

		var maxHeight = $imageAreaContainer.innerHeight();
		$(window).on('resize', function () {
			var $img = $('#image');
			var maxHeight_ = $imageAreaContainer.innerHeight();
			if (maxHeight_ !== maxHeight) {
				maxHeight = maxHeight_;
				$img.css('max-height', maxHeight);
			}
		});

		this.setState({});

		Controller.requestImage = function () {
			$.get('/api/getImage' + (skip ? '?skip=' + skip : ''), function (data) {
				me.setState({...data})
			});
		};

		Controller.requestImage();

		var skip = 0;
		Controller.skipImage = function () {
			skip += 1;
			this.requestImage();
		};
		Controller.resetSkip = function () {
			skip = 0;
			this.requestImage();
		};
	}

	/**
	 * Converts absolute page click coordinates into percentual coordinates relative to the image
	 * @param ev
	 * @returns {{y: number, x: number}}
	 */
	getImageCoords (ev) {
		var $imageArea = $('#image-area');

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
			parseInt($imageArea.css('padding-left'), 10),
		);
		if (x > $imageArea.width()) {
			x = $imageArea.width();
		}
		if (x < 0) {
			x = 0;
		}

		return {
			y: y / $imageArea.height(),
			x: x / $imageArea.width(),
		}
	}
}

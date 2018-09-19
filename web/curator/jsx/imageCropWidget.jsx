class ImageCropWidget extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			showImageOverlay: false,
			crop: {
				x: null,
				y: null,
				w: null,
				h: null,
			},
		}
		this.refs_ = {
			image: React.createRef(),
		}
	}

	render () {
		const {cls} = Util;
		return (
			<div id="image-area" onMouseDown={this.startSelecting.bind(this)}>
				{this.props.image && (
					<img id="image"
						 src="http://www.placecage.com/300/200"
						// src={`data:${this.state.image.mimeType};base64,${this.state.image.contents}`}
						 ref={this.refs_.image}
					/>
				)}
				<div
					className={cls('image-selection-overlay', {
						'hidden': !this.state.showImageOverlay,
					})}
					onMouseDown={this.startDragging.bind(this)}
					style={{
						top: `calc(${this.state.crop.y * 100}% - 2px)`,
						left: `calc(${this.state.crop.x * 100}% - 2px)`,
						width: (this.state.crop.w * 100) + '%',
						height: (this.state.crop.h * 100) + '%',
					}}
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
				{(this.state.crop.w || this.state.crop.h) && (
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
				)}
			</div>
		)
	}

	startSelecting (ev) {
		if (ev.buttons !== 1) {
			return;
		}
		ev.preventDefault(); // Don't let the browser drag the image around

		this.setState({showImageOverlay: false})

		const clickStart = this.getImageCoords(ev);
		this.setState({clickStart});
		this.setState({
			crop: {
				x: clickStart.x,
				y: clickStart.y,
				w: 0,
				h: 0,
			},
		});

		$(document).on('mousemove.resize', ev => {
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

		$(document).one('mouseup', () => {
			$(document).off('mousemove.resize');
			console.log('done selecting!');

			if (this.state.crop.h === 0 || this.state.crop.w === 0) {
				this.setState({
					showImageOverlay: false,
					crop: {},
				})
			} else {
				this.setState({showImageOverlay: true})
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
		if ($handle.is('.resize-handle')) {
			mode = 'resize';
		} else {
			mode = 'drag';
		}

		this.setState({showImageOverlay: false})
		$imageArea.toggleClass('dragging', true);

		var clickStart = this.getImageCoords(ev);

		$(document).on('mousemove.drag', ev => {
			var coords = this.getImageCoords(ev);
			var crop = {...this.state.crop};

			if (mode === 'resize') {
				if ($handle.is('.top-left')) {
					crop.w += crop.x - coords.x;
					crop.x = coords.x;
					crop.h += crop.y - coords.y;
					crop.y = coords.y;
				} else if ($handle.is('.top')) {
					crop.h += crop.y - coords.y;
					crop.y = coords.y;
				} else if ($handle.is('.top-right')) {
					crop.w = coords.x - crop.x;
					crop.h += crop.y - coords.y;
					crop.y = coords.y;
				} else if ($handle.is('.left')) {
					crop.w += crop.x - coords.x;
					crop.x = coords.x;
				} else if ($handle.is('.right')) {
					crop.w = coords.x - crop.x;
				} else if ($handle.is('.bottom-left')) {
					crop.w += crop.x - coords.x;
					crop.x = coords.x;
					crop.h = coords.y - crop.y;
				} else if ($handle.is('.bottom')) {
					crop.h = coords.y - crop.y;
				} else if ($handle.is('.bottom-right')) {
					crop.w = coords.x - crop.x;
					crop.h = coords.y - crop.y;
				}

			} else {// dragging

				// 1 check diff from clickStart
				var diff = {
					x: coords.x - clickStart.x,
					y: coords.y - clickStart.y,
				};

				// 2 add that vector to crop.xy
				crop.x += diff.x;
				crop.y += diff.y;

				// 3 assign c to clickStart
				clickStart = coords

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
		$(document).one('mouseup', () => {
			console.log('end');
			$(document).off('mousemove.drag');
			$imageArea.removeClass('dragging');
			this.setState({showImageOverlay: true})
		});
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
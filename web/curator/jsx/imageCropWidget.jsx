const ACTIONS = {
	CLEAR: Symbol('CLEAR'), // Initial state, nothing is selected
	SELECTED: Symbol('SELECTED'), // Something has been selected (mouse is up)
	SELECTING: Symbol('SELECTING'), // Selection underway (mouse is down)
	RESIZING: Symbol('RESIZING'), // Resizing the selection (mouse is down)
	DRAGGING: Symbol('DRAGGING'), // Dragging the selection (mouse is down)
};

class ImageCropWidget extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			crop: null,
			selectionDone: false,
		}
		this._refs = {
			image: React.createRef(),
			imageArea: React.createRef(),
		}
		this._hiddenState = {
			previousCoords: null,
			resizeDir: null,
			currentAction: ACTIONS.CLEAR,
		}

		$(document).on('mousemove.image-crop-widget', (ev) => {
			if (this._hiddenState.currentAction === ACTIONS.SELECTING) {
				this.continueSelecting(ev);
			} else if (this._hiddenState.currentAction === ACTIONS.RESIZING) {
				this.continueResizing(ev);
			} else if (this._hiddenState.currentAction === ACTIONS.DRAGGING) {
				this.continueDragging(ev);
			}
			// if CLEAR or SELECTED, do nothing
		});

		$(document).on('mouseup.image-crop-widget', (ev) => {
			if (
				this._hiddenState.currentAction === ACTIONS.SELECTING ||
				this._hiddenState.currentAction === ACTIONS.RESIZING ||
				this._hiddenState.currentAction === ACTIONS.DRAGGING
			) {
				this._hiddenState.currentAction = ACTIONS.SELECTED;
				if (this.state.crop.h === 0 || this.state.crop.w === 0) {
					this.setCrop(null);
				} else {
					this.setState({selectionDone: true});
				}
			}
			// SELECTED is impossible, CLEAR is impossible
		});
	}

	setCrop(crop) {
		crop = crop || {}
		crop = Object.assign({}, this.state.crop, crop);
		this.setState({crop})
		this.props.onChangeCrop({
			x: Math.round(crop.x * this._refs.image.current.naturalWidth),
			y: Math.round(crop.y * this._refs.image.current.naturalHeight),
			w: Math.round(crop.w * this._refs.image.current.naturalWidth),
			h: Math.round(crop.h * this._refs.image.current.naturalHeight),
		});
	}

	render () {
		return (
			<div
				id="image-area"
				onMouseDown={this.onMouseDownImageArea.bind(this)}
				ref={this._refs.imageArea}
			>
				{this.props.image && (
					<img id="image"
						 src="http://www.placecage.com/300/200"
						// src={`data:${this.state.image.mimeType};base64,${this.state.image.contents}`}
						 ref={this._refs.image}
					/>
				)}
				{this.state.selectionDone && (
					<div
						className="image-selection-overlay"
						onMouseDown={this.onMouseDownImageSelectionOverlay.bind(this)}
						style={{
							top: `calc(${this.state.crop.y * 100}% - 2px)`,
							left: `calc(${this.state.crop.x * 100}% - 2px)`,
							width: (this.state.crop.w * 100) + '%',
							height: (this.state.crop.h * 100) + '%',
						}}
					>
						<div className="resize-handle top-left" onMouseDown={this.onMouseDownResizeHandle.bind(this, 'top-left')}/>
						<div className="resize-handle top" onMouseDown={this.onMouseDownResizeHandle.bind(this, 'top')}/>
						<div className="resize-handle top-right" onMouseDown={this.onMouseDownResizeHandle.bind(this, 'top-right')}/>
						<div className="resize-handle left" onMouseDown={this.onMouseDownResizeHandle.bind(this, 'left')}/>
						<div className="resize-handle right" onMouseDown={this.onMouseDownResizeHandle.bind(this, 'right')}/>
						<div className="resize-handle bottom-left" onMouseDown={this.onMouseDownResizeHandle.bind(this, 'bottom-left')}/>
						<div className="resize-handle bottom" onMouseDown={this.onMouseDownResizeHandle.bind(this, 'bottom')}/>
						<div className="resize-handle bottom-right" onMouseDown={this.onMouseDownResizeHandle.bind(this, 'bottom-right')}/>
					</div>
				)}
				{this.state.crop && (
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

	onMouseDownImageArea (ev) {
		if (ev.buttons !== 1) {
			return;
		}
		ev.preventDefault(); // Don't let the browser drag the image around
		if (this._hiddenState.currentAction === ACTIONS.CLEAR) {
			this.startSelecting(ev);
		} else if (this._hiddenState.currentAction === ACTIONS.SELECTED) {
			this.clearSelection();
		}
		// SELECTING, RESIZING, DRAGGING are impossible
	}

	startSelecting (ev) {
		this._hiddenState.prevCoords = this.getImageCoords(ev);
		this._hiddenState.currentAction = ACTIONS.SELECTING
		this.setState({selectionDone: false});
	}

	continueSelecting (ev) {
		const coords = this.getImageCoords(ev);
		const prevCoords = this._hiddenState.prevCoords;
		const crop = {};

		if (coords.x >= prevCoords.x) {
			crop.x = prevCoords.x;
			crop.w = coords.x - prevCoords.x;
		} else {
			crop.x = coords.x;
			crop.w = prevCoords.x - coords.x;
		}

		if (coords.y >= prevCoords.y) {
			crop.y = prevCoords.y;
			crop.h = coords.y - prevCoords.y;
		} else {
			crop.y = coords.y;
			crop.h = prevCoords.y - coords.y;
		}

		this.setCrop(crop)
	}

	clearSelection () {
		this.setState({selectionDone: false});
		this._hiddenState.currentAction = ACTIONS.CLEAR;
		this.setCrop(null);
	}

	onMouseDownImageSelectionOverlay (ev) {
		if (ev.buttons !== 1) {
			return;
		}
		if (this._hiddenState.currentAction === ACTIONS.SELECTED) {
			this.startDragging(ev);
		}
	}

	startDragging (ev) {
		this.setState({selectionDone: false});
		this._hiddenState.currentAction = ACTIONS.DRAGGING;
		this._hiddenState.prevCoords = this.getImageCoords(ev);
	}

	continueDragging (ev) {
		const coords = this.getImageCoords(ev);
		const $imageArea = $(this._refs.imageArea.current);
		const diff = {
			x: coords.x - this._hiddenState.prevCoords.x,
			y: coords.y - this._hiddenState.prevCoords.y,
		};

		$imageArea.toggleClass('dragging', true);

		this._hiddenState.prevCoords = coords;

		const crop = {...this.state.crop};

		// 2 add that vector to crop.xy
		crop.x += diff.x;
		crop.y += diff.y;

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

		this.setCrop(crop)
	}

	onMouseDownResizeHandle (direction, ev) {
		if (ev.buttons !== 1) {
			return;
		}
		if (this._hiddenState.currentAction === ACTIONS.SELECTED) {
			this.startResizing(direction, ev);
		}
		// all others impossible
	}

	startResizing (direction, ev) {
		this.setState({selectionDone: false});
		this._hiddenState.currentAction = ACTIONS.RESIZING;
		this._hiddenState.resizeDir = direction;
	}

	continueResizing (ev) {
		var coords = this.getImageCoords(ev);
		var crop = {...this.state.crop};
		var direction = this._hiddenState.resizeDir;

		if (direction === 'top-left') {
			crop.w += crop.x - coords.x;
			crop.x = coords.x;
			crop.h += crop.y - coords.y;
			crop.y = coords.y;
		} else if (direction === 'top') {
			crop.h += crop.y - coords.y;
			crop.y = coords.y;
		} else if (direction === 'top-right') {
			crop.w = coords.x - crop.x;
			crop.h += crop.y - coords.y;
			crop.y = coords.y;
		} else if (direction === 'left') {
			crop.w += crop.x - coords.x;
			crop.x = coords.x;
		} else if (direction === 'right') {
			crop.w = coords.x - crop.x;
		} else if (direction === 'bottom-left') {
			crop.w += crop.x - coords.x;
			crop.x = coords.x;
			crop.h = coords.y - crop.y;
		} else if (direction === 'bottom') {
			crop.h = coords.y - crop.y;
		} else if (direction === 'bottom-right') {
			crop.w = coords.x - crop.x;
			crop.h = coords.y - crop.y;
		}

		this.setCrop(crop);
	}

	/**
	 * Converts absolute page click coordinates into percentual coordinates relative to the image
	 * @param ev
	 * @returns {{y: number, x: number}}
	 */
	getImageCoords (ev) {
		var $imageArea = $(this._refs.imageArea.current);

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

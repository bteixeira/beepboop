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
		}
		this.refs_ = {
			image: React.createRef(),
		}
	}

	render () {
		return (
			<div id="container">
				<div id="info-container">
					<h3 className="model-name">{this.state.model.name}</h3>
					<a href={`http://www.${this.state.model.source}.com/babe/${this.state.model.slug}`} className="model-link" target="_blank">
						{this.state.model.source} / {this.state.model.slug}
					</a>
					<h4>Attributes</h4>
					<dl className="model-attrs"> {
						Object.entries(this.state.model.attributes).map(([attr, value]) =>
							<React.Fragment key={attr}>
								<dt>{attr}</dt>
								<dd>{value}</dd>
							</React.Fragment>
						)
					} </dl>
					<h4>Image</h4>
					<a className="image-link" target="_blank" href={this.state.image.url}>
						{this.state.image.filename}
					</a>
					<dl>
						<dt>Hash</dt>
						<dd className="image-hash">
							{this.state.image.hash}
						</dd>
						<dt>MIME Type</dt>
						<dd className="image-mime">
							{this.state.image.mimeType}
						</dd>
						<dt>Size</dt>
						<dd className="image-size">
							{atob(this.state.image.contents || '').length} bytes
						</dd>
						<dt>Resolution</dt>
						<dd className="image-res">
							{this.refs_.image.current && this.refs_.image.current.naturalWidth}
							{'\u00d7'}
							{this.refs_.image.current && this.refs_.image.current.naturalHeight};
						</dd>
					</dl>
				</div>
				<div id="image-container">
					<div id="image-area-container">
						<div id="image-area">
							{ this.state.image.contents && (
								<img id="image"
									 // src="http://www.placecage.com/300/200"
									 src={`data:${this.state.image.mimeType};base64,${this.state.image.contents}`}
									 ref={this.refs_.image}
								/>
							) }
							<div className="image-selection-overlay hidden">
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
				<div id="controls-container">
					Controls
					<form id="form-crop">
						<input id="input-crop-x" name="x" type="number" readOnly value={
							this.refs_.image.current ?
							Math.round(this.state.crop.x * this.refs_.image.current.naturalWidth)
								: ''
						}/>
						<input id="input-crop-y" name="y" type="number"/>
						<input id="input-crop-w" name="w" type="number"/>
						<input id="input-crop-h" name="h" type="number"/>
					</form>
					<form id="form-meta">
						<ul id="controls"> {
							Object.entries(this.state.metaInfoControls).map(([name, control]) =>
								<div key={name}>
									<label htmlFor={`control-${name}`} title={control.description}>{control.name}</label>
									<select name={name} defaultValue={control.default}>
										<option value=""/>
										{
											control.values.map(value => {
												var val, desc;
												if (typeof value === 'object') {
													val = desc = value.value;
													if ('description' in value) {
														desc = value.description;
													}
												} else {
													val = desc = String(value);
												}
												return <option key={val} value={val}>{desc}</option>
											})
										}
									</select>
								</div>,
							)
						} </ul>
						<button type="button" id="button-skip">Skip</button>
						<button type="button" id="button-reset-skip">Reset</button>
						<button type="button" id="button-submit">Submit</button>
					</form>
				</div>
			</div>
		)
	}

	componentDidMount () {
		const me = this

		$.getJSON('/meta.config.json', data => {
			window.META = data;
			this.setState({metaInfoControls: data})
		});

		var Controller = window.Controller = {};

		var $imageArea = $('#image-area');
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

		var clickStart = {};
		var crop = {};

		Controller.requestImage = function () {
			$.get('/api/getImage' + (skip ? '?skip=' + skip : ''), function (data) {
				me.setState({...data})
			});
		};

		$imageArea.on('mousedown', ev => {
			if (ev.buttons !== 1) {
				return;
			}

			$('.image-selection-overlay').toggleClass('hidden', true);

			clickStart = this.getImageCoords(ev);
			crop.x = clickStart.x;
			crop.y = clickStart.y;
			crop.w = 0;
			crop.h = 0;
			me.setState({crop})
			ev.preventDefault(); // Don't let the browser drag the image around

			$('body').on('mousemove.resize', ev => {
				var c = this.getImageCoords(ev);

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

				me.setState({crop})
			});

			$('body').one('mouseup', function () {
				$('body').off('mousemove.resize');
				console.log('done selecting!');

				if (crop.h === 0 || crop.w === 0) {
					crop = {};
					$('.image-selection-overlay').toggleClass('hidden', true);
					$('#form-crop input').val('');
				} else {
					remakeSelectionOVerlay();
				}
			});
		});

		Controller.requestImage();

		function remakeSelectionOVerlay () {
			$('.image-selection-overlay').removeClass('hidden');
			$('.image-selection-overlay').css('top', 'calc(' + (crop.y * 100) + '% - 2px)');
			$('.image-selection-overlay').css('left', 'calc(' + (crop.x * 100) + '% - 2px)');
			$('.image-selection-overlay').css('width', (crop.w * 100) + '%');
			$('.image-selection-overlay').css('height', (crop.h * 100) + '%');
		}

		$('.image-selection-overlay').on('mousedown', ev => {
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

			var c = this.getImageCoords(ev);
			clickStart.x = c.x;
			clickStart.y = c.y;

			$('body').on('mousemove.drag', ev => {
				var c = this.getImageCoords(ev);

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
						y: c.y - clickStart.y,
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

				me.setState({crop})
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

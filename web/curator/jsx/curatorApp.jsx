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
		this.requestImage()
		this._skip = 0;
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
						<ImageCropWidget
							image={this.state.image}
							onChangeCrop={(crop) => this.setState({crop} || {})}
						/>
					</div>
				</div>
				<CuratorControls
					metaInfoControls={this.state.metaInfoControls}
					handlers={{
						submit: this.handleSubmit.bind(this),
						skip: this.handleSkip.bind(this),
						resetSkip: this.handleResetSkip.bind(this),
					}}
					{...this.state.crop}
				/>
			</div>
		)
	}

	handleSubmit (values) {
		function getCrop() {
			var metadata = {};
			$('#form-crop').serializeArray().forEach(function (el) {
				metadata[el.name] = el.value;
			});
			return metadata;
		}

		function getMetadata() {
			var metadata = {};
			$('#form-meta').serializeArray().forEach(function (el) {
				metadata[el.name] = el.value;
			});
			return metadata;
		}

		var metadata = getMetadata();
		metadata.crop = getCrop();
		$.post('http://papaya-app.com/api/saveImage', {
			hash: $('.image-hash').text(),
			metadata: metadata
		}, function (data) {
			$('#controls select').each(function (i, el) {
				$(this).val('default' in META[this.name] ? String(META[this.name].default) : '');
			});
			requestImage();
			$('#form-crop input').val('');
			$('.image-blur-overlay').remove();
			$('.image-selection-overlay').toggleClass('hidden', true);
		});
	}

	handleSkip () {
		this._skip += 1;
		this.requestImage();
	}

	handleResetSkip () {
		this._skip = 0;
		this.requestImage();
	}

	requestImage () {
		$.get('/api/getImage' + (this._skip ? '?skip=' + this._skip : ''), (data) => {
			this.setState({...data})
		});
	}

	componentDidMount () {
		$.getJSON('/meta.config.json', data => {
			this.setState({metaInfoControls: data})
		});

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
	}
}

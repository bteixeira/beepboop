class CuratorApp extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			metaInfoControls: {},
			model: {
				attributes: {},
			},
			image: {},
			crop: {},
		};
		this.refs_ = {
			image: React.createRef(),
		};
		this.requestImage();
		this._skip = 0;
	}

	render () {
		return (
			<div className="container-fluid my-3">
				<div className="row">
					<div className="col-12 col-md-8 col-xl-6 order-md-2">
						<ImageCropWidget
							image={this.state.image}
							onChangeCrop={(crop) => this.setState({crop} || {})}
						/>
					</div>
					<div className="col-12 col-md-4 col-xl-3 order-md-1">
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
					<div className="col-12 col-xl-3 order-3">
						<CuratorAttributePanel
							model={this.state.model}
							image={this.state.image}
							imageWidth={this.refs_.image.current && this.refs_.image.current.naturalWidth}
							imageHeight={this.refs_.image.current && this.refs_.image.current.naturalHeight}
						/>
					</div>
				</div>
			</div>
		)
	}

	handleSubmit (values) {
		$.ajax('/api/saveImage', {
			type: 'PUT',
			data: {
				hash: this.state.image.hash,
				metadata: {
					...values,
					crop: {...this.state.crop},
				},
			},
			success: () => {
				this.requestImage();
			},
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

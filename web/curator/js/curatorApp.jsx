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
				<ImageCropWidget
					image={this.state.image}
					onChangeCrop={(crop) => this.setState({crop})}
				/>
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
}

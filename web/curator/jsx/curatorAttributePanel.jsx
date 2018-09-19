class CuratorAttributePanel extends React.Component {
	render () {
		const {model, image} = this.props
		return (
			<div id="info-container">
				<h3 className="model-name">{model.name}</h3>
				<a href={`http://www.${model.source}.com/babe/${model.slug}`}
				   className="model-link" target="_blank">
					{model.source} / {model.slug}
				</a>
				<h4>Attributes</h4>
				<dl> {
					Object.entries(model.attributes).map(([attr, value]) =>
						<React.Fragment key={attr}>
							<dt>{attr}</dt>
							<dd>{value}</dd>
						</React.Fragment>,
					)
				} </dl>
				<h4>Image</h4>
				<a className="image-link" target="_blank" href={image.url}>
					{image.filename}
				</a>
				<dl>
					<dt>Hash</dt>
					<dd className="image-hash">
						{image.hash}
					</dd>
					<dt>MIME Type</dt>
					<dd className="image-mime">
						{image.mimeType}
					</dd>
					<dt>Size</dt>
					<dd className="image-size">
						{atob(image.contents || '').length} bytes
					</dd>
					<dt>Resolution</dt>
					<dd className="image-res">
						{this.props.imageWidth} {'\u00d7'} {this.props.imageHeight}
					</dd>
				</dl>
			</div>
		)
	}
}

class CuratorControls extends React.Component {
	render () {
		return (
			<div id="controls-container">
				Controls
				<form id="form-crop">
					<input id="input-crop-x" name="x" type="number" readOnly value={this.props.x}/>
					<input id="input-crop-y" name="y" type="number" readOnly value={this.props.y}/>
					<input id="input-crop-w" name="w" type="number" readOnly value={this.props.w}/>
					<input id="input-crop-h" name="h" type="number" readOnly value={this.props.h}/>
				</form>
				<form id="form-meta" onSubmit={this.props.handlers.submit}>
					<ul id="controls"> {
						Object.entries(this.props.metaInfoControls).map(([name, control]) =>
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
					<button type="button" onClick={this.props.handlers.skip}>Skip</button>
					<button type="button" onClick={this.props.handlers.resetSkip}>Reset Skip</button>
					<button type="submit">Submit</button>
				</form>
			</div>
		)
	}
}

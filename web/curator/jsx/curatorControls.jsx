class CuratorControls extends React.Component {
	render () {
		const props = this.props;
		const x = (typeof props.x === 'number' ? props.x : '');
		const y = (typeof props.y === 'number' ? props.y : '');
		const w = (typeof props.w === 'number' ? props.w : '');
		const h = (typeof props.h === 'number' ? props.h : '');
		return (
			<div>
				<form id="form-crop">
					<h5>
						<strong>Image Crop</strong>
					</h5>
					<div className="form-group form-row">
						<label htmlFor="x" className="col-auto col-form-label">X</label>
						<div className="col">
							<input className="form-control" name="x" type="number" readOnly value={x}/>
						</div>
						<label htmlFor="y" className="col-auto col col-form-label">Y</label>
						<div className="col">
							<input className="form-control" name="y" type="number" readOnly value={y}/>
						</div>
						<label htmlFor="w" className="col-auto col col-form-label">W</label>
						<div className="col">
							<input className="form-control" name="w" type="number" readOnly value={w}/>
						</div>
						<label htmlFor="h" className="col-auto col col-form-label">H</label>
						<div className="col">
							<input className="form-control" name="h" type="number" readOnly value={h}/>
						</div>
					</div>
				</form>
				<form id="form-meta" onSubmit={this.props.handlers.submit}>
					{
						Object.entries(this.props.metaInfoControls).map(([name, control]) =>
							<div className="form-group" key={name}>
								<label htmlFor={`control-${name}`} title={control.description}>{control.name}</label>
								<select className="form-control" name={name} defaultValue={control.default}>
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
					}
					<div className="form-row">
						<div className="col"/>
						<div className="col-auto">
							<button type="button" className="btn btn-secondary" onClick={this.props.handlers.skip}>Skip</button>
						</div>
						<div className="col-auto">
							<button type="button" className="btn btn-secondary" onClick={this.props.handlers.resetSkip}>Reset Skip</button>
						</div>
						<div className="col-auto">
							<button type="submit" className="btn btn-primary">Submit</button>
						</div>
					</div>
				</form>
			</div>
		)
	}
}

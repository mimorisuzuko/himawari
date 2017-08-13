import React, { Component } from 'react';
import Close from 'react-icons/lib/md/close';
import autobind from 'autobind-decorator';
import { ipcRenderer } from 'electron';
import qs from 'querystring';
import _ from 'lodash';
import StarOutline from 'react-icons/lib/md/star-outline';
import Star from 'react-icons/lib/md/star';
import Immutable, { Map } from 'immutable';
import './App.scss';

const { _id } = qs.parse(location.search.substring(1));
const sticky = _.find(ipcRenderer.sendSync('sticky:all'), (a) => a._id === _id);

class App extends Component {
	constructor() {
		super();

		this.state = { model: Map(sticky) };
		ipcRenderer.on('sticky:update-from-server', this.updateFromServer);
	}

	/**
	 * @param {any} e
	 * @param {{}} query
	 */
	@autobind
	updateFromServer(e, query) {
		const { state: { model } } = this;

		this.setState({ model: model.merge(query) });
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { state } = this;

		return !Immutable.is(Map(state), Map(nextState));
	}

	render() {
		const { state: { model } } = this;

		return (
			<div styleName='base'>
				<header>
					<div onClick={this.onClickClose}>
						<Close />
					</div>
					<div onClick={this.toggleAlwaysOnTop}>
						{model.get('alwaysOnTop') ? <Star /> : <StarOutline />}
					</div>
				</header>
				<textarea value={model.get('value')} onChange={this.onChange} />
			</div>
		);
	}

	@autobind
	onClickClose() {
		ipcRenderer.send('sticky:close', { _id });
	}

	/**
	 * @param {Event} e 
	 */
	@autobind
	onChange(e) {
		const { state: { model } } = this;
		const { currentTarget: { value } } = e;
		this.setState({ model: model.set('value', value) });
		ipcRenderer.send('sticky:value', { _id, value });
	}

	@autobind
	toggleAlwaysOnTop() {
		const { state: { model } } = this;
		const next = !model.get('alwaysOnTop');
		this.setState({ model: model.set('alwaysOnTop', next) });
		ipcRenderer.send('sticky:alwaysOnTop', { _id, alwaysOnTop: next });
	}
}

export default App;
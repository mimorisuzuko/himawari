import React, { Component } from 'react';
import Close from 'react-icons/lib/md/close';
import autobind from 'autobind-decorator';
import { ipcRenderer } from 'electron';
import qs from 'querystring';
import _ from 'lodash';
import StarOutline from 'react-icons/lib/md/star-outline';
import Star from 'react-icons/lib/md/star';
import './App.scss';

const { _id } = qs.parse(location.search.substring(1));
const sticky = _.find(ipcRenderer.sendSync('sticky:all'), (a) => a._id === _id);

class App extends Component {
	constructor() {
		super();

		this.state = { value: sticky.value, alwaysOnTop: sticky.alwaysOnTop };
	}

	render() {
		const { state: { value, alwaysOnTop } } = this;

		return (
			<div styleName='base'>
				<header>
					<div onClick={this.onClickClose}>
						<Close />
					</div>
					<div onClick={this.toggleAlwaysOnTop}>
						{alwaysOnTop ? <Star /> : <StarOutline />}
					</div>
				</header>
				<textarea value={value} onChange={this.onChange} />
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
		const { currentTarget: { value } } = e;
		this.setState({ value });
		ipcRenderer.send('sticky:value', { _id, value });
	}

	@autobind
	toggleAlwaysOnTop() {
		const { state: { alwaysOnTop } } = this;
		const next = !alwaysOnTop;
		this.setState({ alwaysOnTop: next });
		ipcRenderer.send('sticky:alwaysOnTop', { _id, alwaysOnTop: next });
	}
}

export default App;
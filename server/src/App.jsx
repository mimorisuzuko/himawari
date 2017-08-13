import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import Immutable, { List, Map } from 'immutable';
import Close from 'react-icons/lib/md/close';
import Add from 'react-icons/lib/md/add';
import StickyModel from './StickyModel';
import _ from 'lodash';

import './App.scss';

/* eslint-disable no-undef */
const socket = io('http://localhost:6160');

class Item extends Component {
	render() {
		const { props: { model } } = this;

		return (
			<div styleName='item'>
				<div styleName='side'>
					<div onClick={this.onClick}>
						<Close />
					</div>
				</div>
				<textarea value={model.get('value')} onChange={this.onChange} />
			</div>
		);
	}

	/**
	 * @param {Event} e 
	 */
	@autobind
	onChange(e) {
		const { props: { model, onChange } } = this;
		const { currentTarget: { value } } = e;

		onChange(model.get('_id'), value);
	}

	@autobind
	onClick() {
		const { props: { model, onClickDelete } } = this;
		onClickDelete(model.get('_id'));
	}
}

class App extends Component {
	constructor() {
		super();

		this.state = { stickies: List() };
		this.loop();
	}

	@autobind
	loop() {
		fetch('http://localhost:6160/stickies?deleted=false').then((a) => a.json()).then((res) => {
			this.setState({
				stickies: List(_.map(res.result, (a) => new StickyModel(a)))
			}, () => setTimeout(this.loop, 1000));
		});
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { state } = this;

		return !Immutable.is(Map(state), Map(nextState));
	}

	render() {
		const { state: { stickies } } = this;

		return (
			<div styleName='base'>
				<header>
					<div styleName='logo'>
						Himawari
					</div>
					<div onClick={this.onClickAdd}>
						<Add />
					</div>
				</header>
				<main>
					{stickies.map((model) => <Item model={model} key={model.get('_id')} onChange={this.onChange} onClickDelete={this.onClickDelete} />)}
				</main>
			</div>
		);
	}

	/**
	 * @param {string} _id
	 * @param {string} value
	 */
	@autobind
	onChange(_id, value) {
		const { state: { stickies } } = this;
		const updatedAt = Date.now();

		socket.emit('patch:stickies', { _id, query: { value, updatedAt } });
		this.setState({
			stickies: stickies.update(
				stickies.findIndex((a) => a.get('_id') === _id),
				(sticky) => sticky.merge({ updatedAt, value })
			)
		});
	}

	/**
	 * @param {string} _id
	 */
	@autobind
	onClickDelete(_id) {
		const { state: { stickies } } = this;
		const updatedAt = Date.now();

		socket.emit('patch:stickies', { _id, query: { deleted: true, updatedAt } });
		this.setState({
			stickies: stickies.filter((a) => a.get('_id') !== _id)
		});
	}

	@autobind
	onClickAdd() {
		const { state: { stickies } } = this;
		const sticky = new StickyModel();
		socket.emit('post:stickies', sticky.toJS());
		this.setState({
			stickies: stickies.push(sticky)
		});
	}
}

export default App;
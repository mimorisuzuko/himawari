const { Record } = require('immutable');
const _ = require('lodash');

const gen = () => `sticky${Date.now()}`;

class StickyModel extends Record({ id: gen(), value: '', width: 300, height: 250, x: 0, y: 0, alwaysOnTop: false }) {
	constructor(...args) {
		super(...args);

		return this.merge({
			id: gen()
		});
	}

	toWindowOptions() {
		const options = this.toJS();
		_.forEach(['id', 'value'], (a) => delete options[a]);

		return _.merge(options, {
			frame: false,
			minWidth: 300,
			minHeight: 250
		});
	}
}

module.exports = StickyModel;
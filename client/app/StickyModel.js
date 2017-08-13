const { Record } = require('immutable');
const _ = require('lodash');

const gen = () => `sticky${Date.now()}`;

class StickyModel extends Record({ _id: gen(), value: '', width: 300, height: 250, x: 0, y: 0, alwaysOnTop: false, deleted: false }) {
	constructor(...args) {
		super(...args);

		return this.merge({
			_id: gen()
		});
	}

	toWindowOptions() {
		const options = this.toJS();
		_.forEach(['_id', 'value', 'deleted'], (a) => delete options[a]);

		return _.merge(options, {
			frame: false,
			minWidth: 300,
			minHeight: 250
		});
	}
}

module.exports = StickyModel;
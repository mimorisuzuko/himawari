const { Record } = require('immutable');
const _ = require('lodash');

const genId = () => `sticky${Date.now()}`;

class StickyModel extends Record({ _id: genId(), value: '', width: 300, height: 250, x: 0, y: 0, alwaysOnTop: false, deleted: false, updatedAt: Date.now() }) {
	constructor(args) {
		super(_.merge({ _id: genId() }, args));
	}

	toWindowOptions() {
		const options = this.toJS();
		_.forEach(['_id', 'value', 'deleted', 'updatedAt'], (a) => delete options[a]);

		return _.merge(options, {
			frame: false,
			minWidth: 300,
			minHeight: 250
		});
	}
}

module.exports = StickyModel;
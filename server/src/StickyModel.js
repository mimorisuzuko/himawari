import { Record } from 'immutable';
import _ from 'lodash';

const genId = () => `sticky${Date.now()}`;

class StickyModel extends Record({ _id: genId(), value: '', width: 300, height: 250, x: 0, y: 0, alwaysOnTop: false, deleted: false, updatedAt: Date.now() }) {
	constructor(args) {
		super(_.merge({ _id: genId() }, args));
	}
}

module.exports = StickyModel;
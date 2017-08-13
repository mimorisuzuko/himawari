const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.Promise = Promise;

const StickySchema = new Schema({
	value: { type: String, default: '' },
	width: { type: Number, required: true },
	height: { type: Number, required: true },
	x: { type: Number, required: true },
	y: { type: Number, required: true },
	alwaysOnTop: { type: Boolean, required: true },
	deleted: { type: Boolean, required: true },
	_id: { type: String, required: true },
}, { versionKey: false });

const StickyModel = mongoose.model('Sticky', StickySchema);

mongoose.connect('mongodb://localhost/himawari', { useMongoClient: true });


module.exports = {
	findStickies: () => StickyModel.find({}),
	addSticky: (options) => (new StickyModel(options)).save(),
	updateSticky: (_id, query) => StickyModel.update({ _id }, { $set: query })
};
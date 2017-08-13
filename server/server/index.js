const express = require('express');
const app = express();
const db = require('./db');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const io = require('socket.io').listen(app.listen(6160));
const cors = require('cors');
const _ = require('lodash');
const libpath = require('path');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/', express.static(libpath.join(__dirname, '../docs')));

app.get('/stickies', (req, res) => {
	const query = {};

	_.forEach(_.toPairs(req.query), ([k, v]) => {
		if (k === 'deleted') {
			query[k] = JSON.parse(v);
		}
	});

	db.findStickies(query).then((result) => res.json({ result })).catch((err) => {
		console.error(err);
		res.sendStatus(500);
	});
});

app.post('/stickies', (req, res) => {
	db.addSticky(req.body).then((result) => res.json({ result })).catch((err) => {
		console.error(err);
		res.sendStatus(500);
	});
});

app.patch('/stickies/:_id', (req, res) => {
	const { params: { _id }, body } = req;
	db.updateSticky(_id, body).then((result) => res.json({ result })).catch((err) => {
		console.error(err);
		res.sendStatus(500);
	});
});

io.on('connection', (socket) => {
	socket.on('patch:stickies', ({ _id, query }) => {
		db.updateSticky(_id, query).catch(console.error);
	});
	socket.on('post:stickies', (query) => {
		db.addSticky(query).catch(console.error);
	});
});
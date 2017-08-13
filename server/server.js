const express = require('express');
const app = express();
const db = require('./db');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const io = require('socket.io').listen(app.listen(6160));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/stickies', (req, res) => {
	db.findStickies().then((result) => res.json({ result })).catch((err) => {
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
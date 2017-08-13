const express = require('express');
const app = express();
const db = require('./db');
const morgan = require('morgan');
const bodyParser = require('body-parser');

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

app.patch('/stickies/:id', (req, res) => {
	const { params: { id }, body } = req;
	db.updateSticky(id, body).then((result) => res.json({ result })).catch((err) => {
		console.error(err);
		res.sendStatus(500);
	});
});

app.listen(6160);
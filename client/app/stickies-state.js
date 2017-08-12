const { List } = require('immutable');
const StickyModel = require('./StickyModel');
const libpath = require('path');
const os = require('os');
const fs = require('fs');
const _ = require('lodash');
const { BrowserWindow } = require('electron');

const PATH = libpath.join(os.homedir(), '.himawari.json');

class StickiesState {
	constructor() {
		if (!fs.existsSync(PATH)) {
			fs.writeFileSync(PATH, '[]');
		}

		let stickies = List(_.map(JSON.parse(fs.readFileSync(PATH, 'utf-8')), (a) => new StickyModel(a)));

		if (stickies.size === 0) {
			stickies = stickies.push(new StickyModel());
		}

		this.stickies = stickies;
	}

	init() {
		this.stickies.map((sticky) => this.createWindow(sticky));
	}

	save() {
		fs.writeFileSync(PATH, JSON.stringify(this.stickies.toJS()));
	}

	/**
	 * @param {string} id
	 * @param {{}} query
	 */
	update(id, query) {
		const { stickies } = this;

		this.stickies = stickies.update(
			stickies.findIndex((a) => a.get('id') === id),
			(sticky) => sticky.merge(query)
		);
		this.save();
	}

	/**
	 * @param {string} id
	 */
	remove(id) {
		const { stickies } = this;

		this.stickies = stickies.filter((a) => a.get('id') !== id);
		this.save();
	}

	add() {
		const { stickies } = this;
		const sticky = new StickyModel();
		this.stickies = stickies.push(sticky);
		this.createWindow(sticky);
		this.save();
	}

	/**
	 * @param {any} sticky 
	 */
	createWindow(sticky) {
		const w = new BrowserWindow(sticky.toWindowOptions());
		const id = sticky.get('id');

		w.__stickyId__ = id;
		w.loadURL(`file://${libpath.join(__dirname, `dst/index.html?id=${id}`)}`);
		w.on('move', (e) => {
			const { sender } = e;
			const [x, y] = sender.getPosition();
			this.update(sender.__stickyId__, { x, y });
		});
		w.on('resize', (e) => {
			const { sender } = e;
			const [width, height] = sender.getSize();
			this.update(sender.__stickyId__, { width, height });
		});
		w.on('close', (e) => {
			const { sender } = e;
			this.update(sender.__stickyId__);
		});
	}

	toJS(){
		return this.stickies.toJS();
	}
}

module.exports = new StickiesState();
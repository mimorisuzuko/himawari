const { List } = require('immutable');
const StickyModel = require('./StickyModel');
const libpath = require('path');
const os = require('os');
const fs = require('fs');
const _ = require('lodash');
const { BrowserWindow } = require('electron');
const rp = require('request-promise');
const jsonpatch = require('fast-json-patch');
const qs = require('querystring');
const socket = require('socket.io-client')('http://localhost:6160');

const PATH = libpath.join(os.homedir(), '.himawari.json');
const DB_URI = 'http://localhost:6160/stickies';

class StickiesState {
	constructor() {
		this.stickies = null;
	}

	init() {
		(async () => {
			const stickies = !fs.existsSync(PATH) ? [] : JSON.parse(fs.readFileSync(PATH, 'utf-8'));
			const { result: serverStickies } = await rp({ uri: DB_URI, json: true });
			const patches = jsonpatch.compare(serverStickies, stickies);
			const { length } = patches;
			for (let i = 0; i < length; i += 1) {
				const { op, path: strpath, value } = patches[i];
				if (op === 'add') {
					await rp({ uri: DB_URI, json: true, method: 'POST', body: value });
				} else if (op === 'replace') {
					const [strindex, key] = _.split(strpath.substring(1), '/');
					const { _id } = stickies[_.parseInt(strindex)];
					await rp({ uri: `${DB_URI}/${_id}`, json: true, method: 'PATCH', body: { [key]: value } });
				} else if (op === 'remove') {
					const [strindex] = _.split(strpath.substring(1), '/');
					const index = _.parseInt(strindex);
					stickies[index] = serverStickies[index];
				}
			}
			fs.writeFileSync(PATH, JSON.stringify(stickies));
			this.stickies = List(
				stickies.map((a) => {
					const sticky = new StickyModel(a);
					if (!sticky.get('deleted')) {
						this.createWindow(sticky);
					}
					return sticky;
				})
			);
		})().catch(console.error);
	}

	save() {
		fs.writeFileSync(PATH, JSON.stringify(this.stickies.toJS()));
	}

	/**
	 * @param {string} _id
	 * @param {{}} query
	 */
	update(_id, query) {
		socket.emit('patch:stickies', { _id, query });
		const { stickies } = this;

		this.stickies = stickies.update(
			stickies.findIndex((a) => a.get('_id') === _id),
			(sticky) => sticky.merge(query)
		);
		this.save();
	}

	add() {
		const { stickies } = this;
		const sticky = new StickyModel();
		socket.emit('post:stickies', sticky.toJS());
		this.stickies = stickies.push(sticky);
		this.createWindow(sticky);
		this.save();
	}

	/**
	 * @param {any} sticky 
	 */
	createWindow(sticky) {
		const w = new BrowserWindow(sticky.toWindowOptions());
		const _id = sticky.get('_id');

		w.__stickyId__ = _id;
		w.loadURL(`file://${libpath.join(__dirname, `dst/index.html?${qs.stringify({ _id })}`)}`);
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
	}

	toJS() {
		return this.stickies.toJS();
	}
}

module.exports = new StickiesState();
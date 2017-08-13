const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const _ = require('lodash');
const menu = require('./menu');
const stickiesState = require('./stickies-state');

app.on('ready', () => {
	stickiesState.init();
	Menu.setApplicationMenu(menu);
});

ipcMain.on('sticky:value', (e, { _id, value }) => {
	stickiesState.update(_id, { value });
});

ipcMain.on('sticky:alwaysOnTop', (e, { _id, alwaysOnTop }) => {
	stickiesState.update(_id, { alwaysOnTop });
	_.some(BrowserWindow.getAllWindows(), (a) => {
		if (a.__stickyId__ === _id) {
			a.setAlwaysOnTop(alwaysOnTop);
			return true;
		}
		return false;
	});
});

ipcMain.on('sticky:all', (e) => {
	e.returnValue = stickiesState.toJS();
});

ipcMain.on('sticky:close', (e, { _id }) => {
	stickiesState.update(_id, { deleted: true });
	_.some(BrowserWindow.getAllWindows(), (a) => {
		if (a.__stickyId__ === _id) {
			a.close();
			return true;
		}
		return false;
	});
});
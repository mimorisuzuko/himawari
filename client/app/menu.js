const _ = require('lodash');
const { Menu, shell, app } = require('electron');
const stickiesState = require('./stickies-state');

const menu = [
	{
		label: 'File',
		submenu: [
			{
				label: 'New Sticky',
				accelerator: 'CmdOrCtrl+N',
				click() {
					stickiesState.add();
				}
			}
		]
	},
	{
		label: 'Edit',
		submenu: [
			{
				role: 'undo'
			},
			{
				role: 'redo'
			},
			{
				type: 'separator'
			},
			{
				role: 'cut'
			},
			{
				role: 'copy'
			},
			{
				role: 'paste'
			},
			{
				role: 'pasteandmatchstyle'
			},
			{
				role: 'delete'
			},
			{
				role: 'selectall'
			}
		]
	},
	{
		label: 'View',
		submenu: [
			{
				label: 'Reload',
				accelerator: 'CmdOrCtrl+R',
				click(item, focusedWindow) {
					if (!focusedWindow) { return; }
					focusedWindow.reload();
				}
			},
			{
				label: 'Toggle Developer Tools',
				accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
				click(item, focusedWindow) {
					if (!focusedWindow) { return; }
					focusedWindow.webContents.toggleDevTools();
				}
			},
			{
				type: 'separator'
			},
			{
				role: 'resetzoom'
			},
			{
				role: 'zoomin'
			},
			{
				role: 'zoomout'
			},
			{
				type: 'separator'
			},
			{
				role: 'togglefullscreen'
			}
		]
	},
	{
		role: 'window',
		submenu: [
			{
				role: 'minimize'
			},
			{
				role: 'close'
			}
		]
	},
	{
		role: 'help',
		submenu: [
			{
				label: 'Learn More',
				click() {
					shell.openExternal('https://github.com/mimorisuzuko/himawari');
				}
			}
		]
	}
];

if (process.platform === 'darwin') {
	const name = app.getName();
	menu.unshift({
		label: name,
		submenu: [
			{
				role: 'about'
			},
			{
				type: 'separator'
			},
			{
				role: 'services',
				submenu: []
			},
			{
				type: 'separator'
			},
			{
				role: 'hide'
			},
			{
				role: 'hideothers'
			},
			{
				role: 'unhide'
			},
			{
				type: 'separator'
			},
			{
				role: 'quit'
			}
		]
	});

	// Window menu.
	menu[_.findIndex(menu, (a) => a.role === 'window')].submenu = [
		{
			label: 'Close',
			accelerator: 'CmdOrCtrl+W',
			role: 'close'
		},
		{
			label: 'Zoom',
			role: 'zoom'
		},
		{
			type: 'separator'
		},
		{
			label: 'Bring All to Front',
			role: 'front'
		}
	];
}

module.exports = Menu.buildFromTemplate(menu);
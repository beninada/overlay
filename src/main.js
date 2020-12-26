const { app, ipcMain, BrowserWindow, Menu } = require('electron')
const isDev = require("electron-is-dev")

const INITIAL_WINDOW_HEIGHT = 270;
const INITIAL_WINDOW_WIDTH = 550;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    titleBarStyle: 'hidden',
    height: INITIAL_WINDOW_HEIGHT,
    width: INITIAL_WINDOW_WIDTH,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  var menu = Menu.buildFromTemplate([
    {
      label: 'Menu'
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Load New Image',
          click() { 
            mainWindow.setSize(INITIAL_WINDOW_WIDTH, INITIAL_WINDOW_HEIGHT)
            mainWindow.webContents.send('initialize');
          } 
        },
        {
          label: 'Set Opacity to 10%',
          click() { 
            mainWindow.webContents.send('setOpacity', .1);
          } 
        },
        {
          label: 'Set Opacity to 25%',
          click() { 
            mainWindow.webContents.send('setOpacity', .25);
          } 
        },
        {
          label: 'Set Opacity to 50%',
          click() { 
            mainWindow.webContents.send('setOpacity', .5);
          } 
        },
        {
          label: 'Set Opacity to 75%',
          click() { 
            mainWindow.webContents.send('setOpacity', .75);
          } 
        },
        {
          label: 'Set Opacity to 100%',
          click() { 
            mainWindow.webContents.send('setOpacity', 1);
          } 
        }
      ]
    }
  ])

  Menu.setApplicationMenu(menu); 

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  let timeout = null;

  // Ask the renderer process to resize the main window
  mainWindow.on('resize', () => {
    if (!timeout) {
      timeout = setTimeout(() => {
        mainWindow.webContents.send('resize');
        timeout = null;
      }, 200)
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('resize-main-window', (event, arg) => {
  mainWindow.setSize(arg.width, arg.height)
})

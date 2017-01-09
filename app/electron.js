'use strict'

const electron = require('electron')
const path = require('path')
const localshortcut = require('electron-localshortcut')

const BrowserWindow = electron.BrowserWindow
const app = electron.app

let mainWindow
let config = {}

if (process.env.NODE_ENV === 'development') {
  config = require('../config')
  config.url = `http://localhost:${config.port}`
} else {
  config.devtron = false
  config.url = `file://${__dirname}/dist/index.html`
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 750,
    width: 1150,
    minHeight: 750,
    minWidth: 1150,
  })

  mainWindow.loadURL(config.url)

  if (process.env.NODE_ENV === 'development') {
    BrowserWindow.addDevToolsExtension(path.join(__dirname, '../node_modules/devtron'))

    let installExtension = require('electron-devtools-installer')

    installExtension.default(installExtension.VUEJS_DEVTOOLS)
      .then((name) => mainWindow.webContents.openDevTools())
      .catch((err) => console.log('An error occurred: ', err))
  }

  mainWindow.on('close', () => {
    localshortcut.unregister(mainWindow, 'Ctrl+A')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  localshortcut.register(mainWindow, 'Ctrl+A', () => {
    mainWindow.webContents.send('SHORTCUT_SELECT_ALL')
  })

  console.log('mainWindow opened')
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

import { ipcRenderer, remote } from 'electron'

const dialog = remote.dialog

// 监听 Ctrl + A
export const listenSelectAll = callback => ipcRenderer.on('SHORTCUT_SELECT_ALL', callback)

// 上传文件
export const uploadFile = (option = {}) => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(
      remote.getCurrentWindow(),
      {
        title: '选择要上传的文件',
        buttonLabel: '上传',
        properties: ['openFile', 'multiSelections'],
        ...option,
      },
      filePaths => {
        resolve(filePaths)
      })
  })
}

// 上传文件夹
export const uploadDirectory = (option = {}) => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(
      remote.getCurrentWindow(),
      {
        title: '选择要上传的文件夹',
        buttonLabel: '上传',
        properties: ['openDirectory', 'createDirectory', 'multiSelections', 'showHiddenFiles'],
        ...option,
      },
      filePaths => {
        resolve(filePaths)
      })
  })
}
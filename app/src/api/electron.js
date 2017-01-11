import { ipcRenderer, remote, shell, BrowserWindow } from 'electron'
const {dialog, Menu, MenuItem} = remote


// 打开外部链接
export const openExternal = shell.openExternal

export const windowOpen = (url, frameName, features) => {
  let child = new BrowserWindow({ parent: remote.getCurrentWindow(), modal: true, show: false })
  child.loadURL('https://github.com')
  child.once('ready-to-show', () => {
    child.show()
  })
}

// 创建右键菜单
export const createContextmenu = ({ appendItems } = {}) => {
  const menu = new Menu()
  for (const menuItem of appendItems) menu.append(new MenuItem(menuItem))
  return menu
}

// 显示右键菜单
export const showContextmenu = (items, opts = {}) => {
  const menu = createContextmenu(items)
  setTimeout(() => menu.popup(remote.getCurrentWindow()))
}

// 监听 Ctrl + A
export const listenSelectAll = callback => ipcRenderer.on('SHORTCUT_SELECT_ALL', callback)

// 上传文件
export const uploadFileDialog = (option = {}) => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(
      remote.getCurrentWindow(),
      {
        title: '选择要上传的文件',
        buttonLabel: '上传',
        properties: ['openFile', 'multiSelections'],
        ...option,
      },
      resolve,
    )
  })
}

// 上传文件夹
export const uploadDirectoryDialog = (option = {}) => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(
      remote.getCurrentWindow(),
      {
        title: '选择要上传的文件夹',
        buttonLabel: '上传',
        properties: ['openDirectory', 'createDirectory', 'multiSelections', 'showHiddenFiles'],
        ...option,
      },
      resolve,
    )
  })
}

// 下载
export const downloadFileDialog = (option = {}) => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(
      remote.getCurrentWindow(),
      {
        title: '下载到',
        buttonLabel: '保存',
        properties: ['openDirectory', 'createDirectory', 'showHiddenFiles'],
        ...option,
      },
      folderPaths => {
        resolve(folderPaths && folderPaths[0])
      },
    )
  })
}

// messgae
export const messgaeDialog = (option = {}) => {
  return new Promise((resolve, reject) => {
    dialog.showMessageBox(
      remote.getCurrentWindow(),
      {
        buttons: [],
        cancelId: -1,
        noLink: true,
        ...option,
      },
      resolve,
    )
  })
}
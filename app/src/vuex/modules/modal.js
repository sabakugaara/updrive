import * as types from '../mutation-types'

const state = {
  createFolder: {
    show: false
  },
  renameFile: {
    show: false,
    oldPath: '',
  },
}

const mutations = {
  [types.OPEN_CREATE_FOLDER_MODAL](state) {
    state.createFolder.show = true
  },
  [types.CLOSE_CREATE_FOLDER_MODAL](state) {
    state.createFolder.show = false
  },
  [types.OPEN_RENAME_FILE_MODAL](state) {
    state.renameFile.show = true
  },
  [types.CLOSE_RENAME_FILE_MODAL](state) {
    state.renameFile.show = false
  },
  [types.RENAME_FILE_SET_OLD_PATH](state, oldPath) {
    state.renameFile.oldPath = oldPath
  },
  [types.RENAME_FILE_CLEAR_OLD_PATH](state) {
    state.renameFile.oldPath = ''
  }
}

export default {
  state,
  mutations
}
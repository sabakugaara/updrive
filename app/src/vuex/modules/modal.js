import * as types from '../mutation-types'


const state = {
  createFolder: {
    show: false
  }
}

const mutations = {
  [types.OPEN_CREATE_FOLDER_MODAL](state) {
    state.createFolder.show = true
  },
  [types.CLOSE_CREATE_FOLDER_MODAL](state) {
    state.createFolder.show = false
  }
}

export default {
  state,
  mutations
}
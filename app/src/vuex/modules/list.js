import * as types from '../mutation-types'

const state = {
  dir: {}
}

const mutations = {
  [types.SET_CURRENT_LIST](state, payload = {}) {
    state.dir = payload
  },
  [types.CLEAR_LIST](state) {
    state = {}
  },
}

export default {
  state,
  mutations
}
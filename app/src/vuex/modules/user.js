import * as types from '../mutation-types'

const state = {
  serviceName: '',
  operatorName: '',
  password: '',
}

const mutations = {
  [types.SET_USER_INFO](state, payload = {}) {
    Object.assign(state, payload)
  },
  [types.CLEAR_USER_INFO](state, payload = {}) {
    state = {}
  },
}

export default {
  state,
  mutations
}
import * as types from '../mutation-types'
import { pickAll } from 'ramda'

const state = pickAll(['bucketName', 'operatorName', 'passwordMd5'])(JSON.parse(localStorage.getItem('user')))

const mutations = {
  [types.SET_USER_INFO](state, payload = {}) {
    Object.assign(state, payload)
  },
  [types.CLEAR_USER_INFO](state) {
    state = {}
  },
}

export default {
  state,
  mutations
}
import * as Types from '../mutation-types'
import { pickAll } from 'ramda'

const state = pickAll(['bucketName', 'operatorName', 'passwordMd5', 'password'])(JSON.parse(localStorage.getItem('user')))

const mutations = {
  [Types.SET_USER_INFO](state, payload = {}) {
    Object.assign(state, payload)
  },
  [Types.CLEAR_USER_INFO](state) {
    state = {}
  },
}

export default {
  state,
  mutations
}
import {filter, identity, split, compose, append} from 'ramda'
import * as types from '../mutation-types'

const state = {
  dirInfo: {
    data: [],
    path: '',
  },
}

const mutations = {
  [types.SET_CURRENT_LIST](state, {data, path, addPath}) {
    state.dirInfo = data
  },
  [types.CLEAR_LIST](state) {
    state = {
      dirInfo: {
        data: [],
        path: '',
      },
    }
  },
}

export default {
  state,
  mutations
}
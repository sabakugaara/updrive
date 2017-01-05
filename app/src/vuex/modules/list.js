import { filter, identity, split, compose, append, pluck } from 'ramda'
import * as types from '../mutation-types'

const state = {
  dirInfo: {
    data: [],
    path: '',
  },
  selected: [],
}

const mutations = {
  [types.SET_CURRENT_LIST](state, { data }) {
    state.dirInfo = data
    state.selected = []
  },
  [types.SHORTCUT_SELECT_ALL](state, data) {
    state.selected = pluck('uri', state.dirInfo.data)
  },
  [types.SET_SELECT_LIST](state, {selected}) {
    state.selected = selected
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
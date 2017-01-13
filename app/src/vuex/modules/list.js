import { filter, identity, split, compose, append, pluck } from 'ramda'
import * as Types from '../mutation-types'

const state = {
  dirInfo: {
    data: [],
    path: '',
  },
  selected: [],
}

const mutations = {
  [Types.SET_CURRENT_LIST](state, { data }) {
    state.dirInfo = data
    state.selected = []
  },
  [Types.SHORTCUT_SELECT_ALL](state, data) {
    state.selected = pluck('uri', state.dirInfo.data)
  },
  [Types.SET_SELECT_LIST](state, {selected}) {
    state.selected = selected
  },
  [Types.CLEAR_LIST](state) {
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
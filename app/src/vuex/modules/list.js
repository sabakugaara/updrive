import {filter, identity, split, compose, append} from 'ramda'
import * as types from '../mutation-types'

const state = {
  pathStack: [],
  dirInfo: {},
}

const mutations = {
  [types.SET_CURRENT_LIST](state, {data, path, addPath}) {
    state.dirInfo = data
    console.log(data)
    if(path) state.pathStack =  compose(filter(identity), split('/'))(path)
    if(addPath) state.pathStack =  append(addPath)(state.pathStack)
  },
  [types.CLEAR_LIST](state) {
    state = {
      pathStack: [],
      dirInfo: {},
    }
  },
}

export default {
  state,
  mutations
}
import { reverse, merge, sort, sortBy, filter, identity, split, compose, append, pluck } from 'ramda'
import * as Types from '../mutation-types'

const state = {
  dirInfo: {
    data: [],
    path: '',
  },
  sortInfo: {
    isReverse: false,
    key: '',
  },
  selected: [],
}

const listSort = (data = [], key, isReverse) => {
  if (!key) return data
  const sortData = sort((ObjA, ObjB) => {
    if (ObjA.folderType !== ObjB.folderType) {
      return ObjA.folderType === 'F' ? -1 : 1
    }
    if (key === "lastModified" || key === "size") {
      return ObjA[key] !== ObjB[key] ?
        Number(ObjA[key]) - Number(ObjB[key]) :
        ObjA.filename.localeCompare(ObjB.filename)
    }
    if (key === "filetype" || key === "filename") {
      return ObjA[key] !== ObjB[key] ?
        String(ObjA[key]).localeCompare(String(ObjB[key])) :
        ObjA.filename.localeCompare(ObjB.filename)
    }
  }, state.dirInfo.data)
  return isReverse ? reverse(sortData) : sortData
}


const mutations = {
  [Types.SET_CURRENT_LIST](state, { data }) {
    state.dirInfo = data
    state.dirInfo = merge(state.dirInfo, { data: listSort(state.dirInfo.data, state.sortInfo.key, state.sortInfo.isReverse) })
    state.selected = []
  },
  [Types.SHORTCUT_SELECT_ALL](state, data) {
    state.selected = pluck('uri', state.dirInfo.data)
  },
  [Types.SET_SORT_INFO](state, sortInfo) {
    state.sortInfo = sortInfo
    state.dirInfo = merge(state.dirInfo, { data: listSort(state.dirInfo.data, state.sortInfo.key, state.sortInfo.isReverse) })
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
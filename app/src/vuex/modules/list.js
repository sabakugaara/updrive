import { pipe, reverse, merge, sort, sortBy, filter, identity, split, compose, append, pluck } from 'ramda'
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

  const naturalCompareString = (a = '', b = '') => {
    try {
      const splitByNumber = pipe(split(/(\d+)/), filter(identity))
      const [aArr, bArr] = [splitByNumber(a), splitByNumber(b)]
      for (let i = 0; i < aArr.length; i++) {
        if (aArr[i] !== bArr[i]) {
          if (bArr[i] === undefined) return 1
          if (!isNaN(aArr[i]) && !isNaN(bArr[i])) {
            return parseInt(aArr[i]) - parseInt(bArr[i])
          } else {
            return aArr[i].localeCompare(bArr[i])
          }
        }
      }
      return 0
    } catch (err) {
      return a.localeCompare(b)
    }
  }

  const sortData = sort((ObjA, ObjB) => {
    if (ObjA.folderType !== ObjB.folderType) {
      return ObjA.folderType === 'F' ? -1 : 1
    }
    if (key === "lastModified" || key === "size") {
      return ObjA[key] !== ObjB[key] ?
        Number(ObjA[key]) - Number(ObjB[key]) :
        naturalCompareString(ObjA.filename, ObjB.filename)
    }
    if (key === "filetype" || key === "filename") {
      return ObjA[key] !== ObjB[key] ?
        naturalCompareString(String(ObjA[key]), String(ObjB[key])) :
        naturalCompareString(ObjA.filename, ObjB.filename)
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
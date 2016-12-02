import { join, append, compose, unless, isEmpty } from 'ramda'
import * as types from './mutation-types'
import * as Upyun from '../api/upyun.js'

export default {
  // 登录
  [types.VERIFICATION_ACCOUNT]({state, commit}, payload) {
    return Upyun.checkAuth(payload)
      .then(result => {
        commit(types.SET_USER_INFO, result)
        return result
      })
      .catch(error => {
        commit(types.CLEAR_USER_INFO)
        return Promise.reject(error)
      })
  },
  // 获取文件目录信息
  [types.GET_LIST_DIR_INFO]({state, commit}, { folder = '', path }) {
    return Upyun.getListDirInfo({
      path: path !== undefined ? path : (folder ? compose(join('/'), append(folder)) : join('/'))(state.list.pathStack),
      ...state.user
    })
      .then(result => {
        commit({
          type: types.SET_CURRENT_LIST,
          data: result,
          path: path,
          addPath: folder,})
        return result
      })
      .catch(error => {
        // commit(types.CLEAR_USER_INFO)
        return Promise.reject(error)
      })
  }
}


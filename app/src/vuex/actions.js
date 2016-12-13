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
  [types.GET_LIST_DIR_INFO]({state, commit}, { path }) {
    return Upyun.getListDirInfo({ path, ...state.user })
      .then(result => {
        commit({
          type: types.SET_CURRENT_LIST,
          data: result})
        return result
      })
      .catch(error => {
        // commit(types.CLEAR_USER_INFO)
        return Promise.reject(error)
      })
  },
  // 获取文件目录信息
  [types.UPLOAD_FILES]({state, commit}, { path, localFilePath }) {
    return Upyun.upload({ path, ...state.user }, { localFilePath })
  },
}


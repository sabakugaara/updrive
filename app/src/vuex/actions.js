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
  [types.GET_LIST_DIR_INFO]({state, commit}, payload = {}) {
    return Upyun.getListDirInfo({ ...payload, ...state.user })
      .then(result => {
        console.log(1)
        commit(types.SET_CURRENT_LIST, result)
        return result
      })
      .catch(error => {
        // commit(types.CLEAR_USER_INFO)
        return Promise.reject(error)
      })
  }
}


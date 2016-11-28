import * as types from './mutation-types'
import * as Upyun from '../api/upyun.js'
// export const decrementMain = ({ commit }) => {
//   commit(types.DECREMENT_MAIN_COUNTER)
// }

// export const incrementMain = ({ commit }) => {
//   commit(types.INCREMENT_MAIN_COUNTER)
// }

// // export const incrementMain = ({ commit }) => {
// //   commit(types.INCREMENT_MAIN_COUNTER)
// // }

// // 登录
// export const REQUEST_LOGIN = ({ commit }) => {
//   commit(types.INCREMENT_MAIN_COUNTER)
// }

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
    console.log(state)
    return Upyun.getListDirInfo({ ...payload, ...state.user })
      .then(result => {
        // commit(types.SET_USER_INFO, result)
        return result
      })
      .catch(error => {
        // commit(types.CLEAR_USER_INFO)
        return Promise.reject(error)
      })
  }
}


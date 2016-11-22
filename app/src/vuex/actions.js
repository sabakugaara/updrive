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
    Upyun.checkAuth(payload)
      .then(result => {
        commit(types.SET_USER_INFO, payload)
      })
      .catch(result => {
        commit(types.CLEAR_USER_INFO, payload)
      })
    //commit(types.LOGIN_SUCCESS)
  }
}


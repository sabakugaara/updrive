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
  [types.GET_LIST_DIR_INFO]({state, commit}, { remotePath }) {
    return Upyun.getListDirInfo(state.user, { remotePath })
      .then(result => {
        commit({
          type: types.SET_CURRENT_LIST,
          data: result
        })
        return result
      })
      .catch(error => {
        // commit(types.CLEAR_USER_INFO)
        return Promise.reject(error)
      })
  },
  // 上传文件
  [types.UPLOAD_FILES]({state, commit, dispatch}, { remotePath, localFilePaths }) {
    return Upyun.uploadFiles(state.user, { remotePath, localFilePaths })
  },
  // 上传文件夹
  [types.UPLOAD_FLODER]({state, commit, dispatch}, { remotePath, localFolderPaths }) {
    return Upyun.uploadFloders(state.user, { remotePath, localFolderPaths })
  },
  // 创建目录
  [types.CREATE_FOLDER]({state, commit, dispatch}, { remotePath, folderName }) {
    return Upyun.createFolder(state.user, { remotePath, folderName })
  },
  // 刷新当前目录
  [types.REFRESH_LIST]({state, commit, dispatch},{ remotePath } = {}) {
    // console.log('刷新列表')
    return dispatch({type: 'GET_LIST_DIR_INFO', remotePath: remotePath || state.list.dirInfo.path})
      .then(data => {
        // console.log(JSON.stringify(data))
      })
  },
}


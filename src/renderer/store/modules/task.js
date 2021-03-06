import { append, drop } from 'ramda'

import * as Types from '@/store/mutation-types'

const state = {
  taskList: [
    // {
    //   id, // 每次任务唯一标识符
    //   type, // 类型 ['upload', 'download']
    //   status:, // 状态 '0': '未开始'，'1': '进行中', '2': '已完成', '-1': '出错', '-2': '已取消'
    //   localFilePath,
    //   remoteQuery,
    //   filename,
    //   percentage,
    //   size, // 文件大小
    //   done, // 已完成
    //   abort, 取消函数
    //   retry, 重试函数
    // }
  ],
  showModal: false,
}

const mutations = {
  [Types.SHOW_TASK_MODAL](state) {
    state.showModal = true
  },
  [Types.HIDE_TASK_MODAL](state) {
    state.taskList = state.taskList.filter(item => {
      return item.status === '1'
    })
    state.showModal = false
  },
  [Types.ADD_TASK](state, { data = {} }) {
    state.taskList = append(data, state.taskList)
  },
  [Types.UPDATE_TASK](state, { data = {} }) {
    state.taskList = state.taskList.map(item => {
      if (item.id === data.id) {
        return { ...item, ...data }
      }
      return item
    })
  },
  [Types.DELETE_TASK](state, { data = {} }) {
    state.taskList = state.taskList.filter(item => item.id !== data.id)
  },
  [Types.CANCEL_TASK](state, { data = {} }) {
    state.taskList = state.taskList.map(item => {
      if (item.id === data.id) {
        item.abort && item.abort()
        return { ...item, status: '-2' }
      }
      return item
    })
  },
}

export default {
  state,
  mutations,
}
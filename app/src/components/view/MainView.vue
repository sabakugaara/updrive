<template>
  <div class="list-view">
    <div class="list-operation">
      <div class="list-operation-item" :class="listOperationItemClass">
        <svg class="svg-icon">
          <use xlink:href="#icon-link"></use>
        </svg>
        获取链接
      </div>
      <div class="list-operation-item" @click="downloadFile" :class="listOperationItemClass">
        <svg class="svg-icon">
          <use xlink:href="#icon-icondownload"></use>
        </svg>
        下载
      </div>
      <div class="list-operation-item" :class="listOperationItemClass">
        <svg class="svg-icon">
          <use xlink:href="#icon-browse"></use>
        </svg>
        预览
      </div>
      <div class="list-operation-item" @click="deleteFile" :class="listOperationItemClass">
        <svg class="svg-icon">
          <use xlink:href="#icon-delete"></use>
        </svg>
        删除
      </div>
      <div class="list-operation-item" :class="listOperationItemClass">
        <svg class="svg-icon">
          <use xlink:href="#icon-edit"></use>
        </svg>
        重命名
      </div>
      <div class="list-operation-item" :class="listOperationItemClass">
        <svg class="svg-icon">
          <use xlink:href="#icon-copy"></use>
        </svg>
        复制到
      </div>
      <div class="list-operation-item" :class="listOperationItemClass">
        <svg class="svg-icon">
          <use xlink:href="#icon-rfq"></use>
        </svg>
        移动到
      </div>
    </div>
    <div class="list">
      <div class="file-list">
        <div class="file-list-column">
          <div class="column-file-name table-column"></div>
          <div class="column-last-modified table-column"></div>
          <div class="column-file-type table-column"></div>
          <div class="column-file-size table-column"></div>
        </div>
        <div class="file-list-header">
          <div class="file-info-item column-file-name">名称</div>
          <div class="file-info-item column-last-modified">修改日期</div>
          <div class="file-info-item column-file-type">类型</div>
          <div class="file-info-item column-file-size">大小</div>
        </div>
        <div class="file-list-body">
          <div class="file-list-item" v-for="(file, index) in list.dirInfo.data" :class="{
              'item-selected': (listItemState[file.uri] && listItemState[file.uri].selected),
            }" @click.stop="selectItem(file, $event, index, list.dirInfo.data)" @dblclick.stop="dblclickItem(file)">
            <div class="file-name file-info-item">
              <i class="file-icon" :class="{'icon-folder': file.folderType === 'F'}"></i>{{file.filename}}
            </div>
            <div class="last-modified file-info-item">{{file.lastModified | timestamp}}</div>
            <div class="file-type file-info-item">文件</div>
            <div class="file-size file-info-item">{{(file.folderType === 'F' ? '-' : file.size) | digiUnit}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    assocPath, map, compose, assoc, path, cond, and, prop, both, T, always, keys, filter, apply,
    range, pick, merge, converge, length, not, __, reduce, identity, findIndex, last, pipe, propEq, slice, uri, pluck, concat, remove, append
  } from 'ramda'
  import { mapState, dispatch, commit } from 'vuex'
  import { timestamp, digiUnit } from '../../filters'
  import { downloadFileDialog, messgaeDialog } from '../../api/electron.js'
  import { basename } from 'path'

  export default {
    computed: {
      listOperationItemClass() {
        return {
          disabled: !this.selected.length
        }
      },
      selected() {
        return path(['list', 'selected'], this) || []
      },
      listItemState() {
        const setSelected = reduce((result, value) => assocPath([value, 'selected'], true)(result), __, this.selected)
        return setSelected({})
      },
      currentDirPath() {
        return path(['list', 'dirInfo', 'path'], this)
      },
      ...mapState(['user', 'list']),
    },
    methods: {
      selectItem({uri}, $event, index, data) {
        const getSelectedList = () => {
          const { selected } = this
          if ($event.shiftKey) {
            const lastIndex = findIndex(pipe(last, propEq('uri'))(selected), data)
            const getBacthFile = lastIndex < index ? slice(lastIndex, index + 1) : slice(index, lastIndex + 1)
            const addedList = pluck('uri', getBacthFile(data))
            return $event.ctrlKey ? concat(selected, addedList) : addedList
          } else if ($event.ctrlKey) {
            return !~selected.indexOf(uri) ? append(uri, selected) : remove(selected.indexOf(uri), 1, selected)
          } else {
            return [uri]
          }
        }
        this.$store.commit({ type: 'SET_SELECT_LIST', selected: getSelectedList() })
      },
      // 全选
      selectAll($event) {
        console.log($event)
      },
      // 双击
      dblclickItem({ folderType, filename }) {
        // 如果是文件夹,则打开目录
        if (folderType === 'F') {
          this.$store
            .dispatch({ type: 'GET_LIST_DIR_INFO', remotePath: this.currentDirPath + filename + '/' })
            .then(result => { })
            .catch(alert)
        }
      },
      // 删除文件
      deleteFile() {
        const { selected } = this
        return messgaeDialog({
          title: '提示',
          buttons: ['删除', '取消'],
          defaultId: 1,
          message: `确定要删除「${basename(selected[0])}」${selected.length > 1 ? `等${selected.length}个文件` : ''}吗?`,
          detail: '操作后文件无法恢复',
        })
          .then(index => {
            if (index !== 0) return
            this.$store
              .dispatch({ type: 'DELETE_FILE', selectedPaths: selected })
          })
      },
      // 下载文件
      downloadFile() {
        return downloadFileDialog()
          .then(path => {
            if (!path) return
            console.log(path)
          })
      }
    },
    filters: {
      timestamp,
      digiUnit,
    },
    name: 'ListView'
  }
</script>
<template>
  <div class="list-view" tabindex="-1" @keydown="keydown">
    <div class="list-operation">
      <div class="list-operation-item" @click="getLink" :class="listOperationSingelItemClass">
        <svg class="svg-icon">
          <use xlink:href="#icon-link"></use>
        </svg>
        获取链接
      </div>
      <div class="list-operation-item" @click="downloadFile" :class="listOperationSingelItemClass">
        <svg class="svg-icon">
          <use xlink:href="#icon-icondownload"></use>
        </svg>
        下载
      </div>
      <div class="list-operation-item" @click="dblclickItem" :class="listOperationSingelItemClass">
        <svg class="svg-icon">
          <use xlink:href="#icon-browse"></use>
        </svg>
        查看
      </div>
      <div class="list-operation-item" @click="deleteFile" :class="listOperationItemClass">
        <svg class="svg-icon">
          <use xlink:href="#icon-delete"></use>
        </svg>
        删除
      </div>
      <div class="list-operation-item" @click="renameFile" :class="listOperationSingelItemClass">
        <svg class="svg-icon">
          <use xlink:href="#icon-edit"></use>
        </svg>
        修改路径
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
            }" :tabindex="getListTabIndex(file.uri)" @click.stop="selectItem(file, $event, index)" @dblclick.stop="dblclickItem(file.uri)"
            @contextmenu.prevent="contextmenu(file)">
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
    nth, indexOf, equals, assocPath, map, compose, assoc, path, cond, and, prop, both, T, always, keys, filter, apply,
    range, pick, merge, converge, length, not, __, reduce, identity, findIndex, last, pipe, propEq, slice, uri, pluck, concat, remove, append
  } from 'ramda'
  import { mapState, mapGetters, dispatch, commit } from 'vuex'
  import Path from 'path'

  import { timestamp, digiUnit } from '../../filters'
  import { downloadFileDialog, messgaeDialog, createContextmenu, showContextmenu, openExternal, windowOpen, writeText } from '../../api/electron.js'

  export default {
    computed: {
      listOperationItemClass() {
        return {
          disabled: !this.selected.length
        }
      },
      listOperationSingelItemClass() {
        return {
          disabled: !this.uniqueSelectedUri
        }
      },
      uniqueSelectedUri() {
        const { selected } = this
        if (selected && selected.length !== 1) return ''
        return selected[0]
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
      ...mapGetters(['cname']),
    },
    methods: {
      getListTabIndex(uri) {
        return this.selected.includes(uri) ? 0 : -1
      },
      keydown($event) {
        const { ctrlKey, key, shiftKey } = $event
        const uriData = pluck('uri', this.list.dirInfo.data)
        const selectUri = selected => this.$store.commit({ type: 'SET_SELECT_LIST', selected: selected })
        if (ctrlKey && !shiftKey && key === 'a') {
          selectUri(uriData)
        }
        // 滚动
        if (!ctrlKey && !shiftKey && (key === 'j' || key === 'ArrowDown')) {
          const currentLastIndex = indexOf(last(this.selected), uriData)
          const targetUri = (currentLastIndex + 1 > uriData.length - 1) ? last(uriData) : nth(currentLastIndex + 1, uriData)
          selectUri([targetUri])
        }
        if (!ctrlKey && !shiftKey && (key === 'k' || key === 'ArrowUp')) {
          const currentLastIndex = indexOf(last(this.selected), uriData)
          const targetUri = (currentLastIndex - 1 < 0) ? nth(0, uriData) : nth(currentLastIndex - 1, uriData)
          selectUri([targetUri])
        }
        if (!ctrlKey && shiftKey && (key === 'j' || key === 'ArrowDown')) {
          const currentLastIndex = indexOf(last(this.selected), uriData)
          const targetUri = (currentLastIndex + 1 > uriData.length - 1) ? last(uriData) : nth(currentLastIndex + 1, uriData)
          selectUri(append(targetUri, this.selected))
        }
        if (!ctrlKey && shiftKey && (key === 'k' || key === 'ArrowUp')) {
          const currentLastIndex = indexOf(last(this.selected), uriData)
          const targetUri = (currentLastIndex - 1 < 0) ? nth(0, uriData) : nth(currentLastIndex - 1, uriData)
          selectUri(append(targetUri, this.selected))
        }

      },
      selectItem({uri}, $event, index) {
        const data = this.list.dirInfo.data
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
      // 右键点击
      contextmenu({uri}) {
        if (!this.selected.includes(uri)) this.$store.commit({ type: 'SET_SELECT_LIST', selected: [uri] })
        this.$nextTick(this.showContextMenu)
      },
      // 显示菜单
      showContextMenu() {
        showContextmenu({
          appendItems: [
            { hide: !this.uniqueSelectedUri, label: '打开', click: () => this.dblclickItem(this.uniqueSelectedUri) },
            { hide: !this.uniqueSelectedUri, label: '在浏览器中打开', click: () => openExternal(this.getUrl()) },
            { hide: !this.uniqueSelectedUri, type: 'separator' },
            { hide: !this.uniqueSelectedUri, label: '修改路径...', click: () => this.renameFile() },
            { hide: !this.uniqueSelectedUri, label: '获取链接', click: () => this.getLink() },
            { hide: !this.uniqueSelectedUri, label: '查看详细信息', click: () => console.log('item 1 clicked') },
            { hide: !this.selected.length, label: '下载', click: () => this.downloadFile() },
            { hide: !this.uniqueSelectedUri, type: 'separator' },
            { hide: !this.selected.length, label: '删除', click: () => this.deleteFile() },
          ]
        })
      },
      getUrl(uri = this.uniqueSelectedUri) {
        return this.cname + uri
      },
      // 链接
      getLink(uri) {
        writeText(this.getUrl())
      },
      // 全选
      selectAll($event) {
        console.log($event)
      },
      // 双击
      dblclickItem(uri) {
        // 如果是文件夹,则打开目录
        if (/\/$/.test(uri)) {
          this.$store.dispatch({ type: 'GET_LIST_DIR_INFO', remotePath: uri })
        } else {
          window.open(this.getUrl(), this.getUrl(), { frame: false })
        }
      },
      // 删除文件
      deleteFile() {
        const { selected } = this
        return messgaeDialog({
          title: '提示',
          buttons: ['删除', '取消'],
          defaultId: 1,
          message: `确定要删除「${Path.basename(selected[0])}」${selected.length > 1 ? `等${selected.length}个文件` : ''}吗?`,
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
        if (!this.selected.length) return
        return downloadFileDialog()
          .then(path => {
            console.log(path)
            if (!path) return
            this.$store.dispatch({ type: 'DOWNLOAD_FILES', downloadPath: this.selected, destPath: path })
          })
      },
      // 修改路径
      renameFile() {
        if (!this.uniqueSelectedUri) return
        this.$store.commit('RENAME_FILE_SET_OLD_PATH', this.uniqueSelectedUri)
        this.$store.commit('OPEN_RENAME_FILE_MODAL')
      }
    },
    filters: {
      timestamp,
      digiUnit,
    },
    name: 'ListView'
  }

</script>
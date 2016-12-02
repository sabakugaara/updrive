<template>
  <div class="list-view">
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
          <div
            class="file-list-item"
            v-for="(file, index) in list.dirInfo.data"
            :class="{
              'item-hover': (listState[index] && listState[index].hover)
            }"
            @mouseenter.stop="enterItem(index)"
            @mouseleave.stop="leaveItem(index)"
            @dblclick.stop="dbclickItem(index)">
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
  import { mapState, dispatch } from 'vuex'
  import { assocPath } from 'ramda'
  import { timestamp, digiUnit } from '../../filters'

  export default {
    data() {
      return {
        listState: {},
      }
    },
    computed: {
      ...mapState(['user', 'list']),
    },
    methods: {
      enterItem(index) {
        return (this.listState = assocPath([index, 'hover'])(true)(this.listState))
      },
      leaveItem(index) {
        return (this.listState = assocPath([index, 'hover'])(false)(this.listState))
      },
      dbclickItem(index) {
        const itemData = this.list.dirInfo.data[index]
        // 如果是文件夹,则打开目录
        if(itemData.folderType === 'F') {
          this.$store.dispatch({
            type: 'GET_LIST_DIR_INFO',
            folder: itemData.filename,
          }).then(result => {
            console.log(result)
          }).catch(error => {
            alert(error)
          })
        }
      }
    },
    filters: {
      timestamp,
      digiUnit,
    },
    name: 'ListView'
  }
</script>
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
              'item-hover': (listState[index] && listState[index].hover),
              'item-selected': (listState[index] && listState[index].selected),
            }"
            @mouseenter.stop="enterItem(index)"
            @mouseleave.stop="leaveItem(index)"
            @click.stop="selectItem(index, $event)"
            @dblclick.stop="dblclickItem(index)">
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
  import { assocPath, map, compose, assoc, path, cond, and, prop, both, T, always, keys, filter, apply, range, pick, merge, converge, length } from 'ramda'
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
        return this.listState = assocPath([index, 'hover'], true)(this.listState)
      },
      leaveItem(index) {
        return this.listState = assocPath([index, 'hover'], false)(this.listState)
      },
      selectItem(index, $event) {
        if(path([index, 'selected'])(this.listState)) return
        const mapAllSelectFalse = map(assoc('selected', false))
        const setIndexSelected = assocPath([index, 'selected'], true)
        const getCurrentSelectArray = compose(map(Number), keys, filter(prop('selected')))
        const getStartIndex = (args) => {
          console.log(args)
          compose(String, converge(apply, [always(Math.min), getCurrentSelectArray]))(args)
        }
        const createStartToEndArray = (startIndex, endIndex) => map(String, range(Number(startIndex), Number(endIndex) + 1))
        const setAllIndexSelected = (startIndex, endIndex) => {
          console.log(startIndex, endIndex)
          if(Number(endIndex) > Number(startIndex)) {
            console.log(converge(merge, [
              mapAllSelectFalse,
              compose(map(assoc('selected', true)), pick(createStartToEndArray(startIndex, endIndex))),
            ])(this.listState))
            return converge(merge, [
              mapAllSelectFalse,
              compose(map(assoc('selected', true)), pick(createStartToEndArray(startIndex, endIndex))),
            ])
          } else {
            return converge(merge, [
              mapAllSelectFalse,
              compose(map(assoc('selected', true)), pick(createStartToEndArray(endIndex, startIndex))),
            ])
          }
        }
        console.log(compose(String, converge(apply, [always(Math.min), compose(map(Number), keys, filter(prop('selected')))]))(this.listState))

        return this.listState = cond([
          [compose(length, getCurrentSelectArray), always(compose(setIndexSelected, mapAllSelectFalse))],
          [both(prop('shiftKey'), prop('ctrlKey')), () => console.log('shift', 'ctrl')],
          [prop('shiftKey'), always(setAllIndexSelected(getStartIndex(this.listState), index))],
          [prop('ctrlKey'), always(setIndexSelected)],
          [T, always(compose(setIndexSelected, mapAllSelectFalse))],
        ])($event)(this.listState)
      },
      dblclickItem(index) {
        const itemData = this.list.dirInfo.data[index]
        // 如果是文件夹,则打开目录
        if(itemData.folderType === 'F') {
          this.$store.dispatch({
            type: 'GET_LIST_DIR_INFO',
            path: `${this.list.dirInfo.path}${itemData.filename}/`,
          }).then(result => {
            this.listState = {}
            // console.log(result)
          }).catch(error => {
            // this.listState = {}
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
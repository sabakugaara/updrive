<template>
  <div class="page-main">
    <div class="menu">
    </div>
    <div class="list-view">
      <div class="list">
        <div class="wrap-list">
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
              <div class="file-list-item" v-for="file in list.dir.data">
                <div class="file-name file-info-item">{{file.filename}}</div>
                <div class="last-modified file-info-item">{{file.lastModified | timestamp}}</div>
                <div class="file-type file-info-item">文件</div>
                <div class="file-size file-info-item">{{(file.folderType === 'F' ? '-' : file.size) | digiUnit}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { timestamp, digiUnit } from '../../filters'

  export default {
    computed: {
      ...mapState(['user', 'list']),
    },
    filters: {
      timestamp,
      digiUnit,
    },
    name: 'PageMain',
  }
</script>

<style scoped lang="scss">
  .page-main {
    display: flex;
    flex: 1;
    border-top: 1px solid #ccc;
    background: #eee;
  }

  .menu {
    width: 160px;
    display: flex;
  }

  .list-view {
    flex: 1;
    position: relative;
    display: flex;
    border-left: 1px solid #ccc;
    flex-direction: column;
    background: #fff;
  }

  .list {
    display: flex;
    flex: 1;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .wrap-list {}

  .file-list {
    display: table;
    table-layout: fixed;
    padding-top: 25px;
    height: 100%;
    width: 100%;
    .file-list-header {
      background: #fff;
      position: absolute;
      top: 0;
      color: #4c607a;
      font-size: 14px;
      display: flex;
      width: calc(100% - 16px);
      .column-file-name {
        flex: 1;
      }
      .file-info-item {
        line-height: 25px;
        padding-left: 6px;
        &:not(:last-child) {
          border-right: 1px solid #e5e5e5;
        }
      }
    }
    .file-list-body {
      color: #000;
      display: table-row-group;
    }
    .file-list-column {
      display: table-column-group;
      .table-column {
        display: table-column;
      }
    }
    .column-file-name {
      width: 100%;
    }
    .column-last-modified {
      width: 170px;
    }
    .column-file-type {
      width: 140px;
    }
    .column-file-size {
      width: 140px;
    }
  }

  .file-list-item {
    display: table-row;
  }

  .file-info-item {
    padding-left: 6px;
    padding-right: 10px;
    line-height: 30px;
    display: table-cell;
  }

  .file-type,
  .last-modified,
  .file-size {
    color: #6d6d6d;
  }

  .file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-size {
    padding-right: 30px;
    text-align: right;
  }
</style>
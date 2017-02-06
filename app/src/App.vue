<template>
  <router-view></router-view>
</template>

<script>
  import { commit } from 'vuex'

  import Store from 'src/vuex/store'
  import { listenSelectAll } from './api/electron.js'
  import './assets/iconfont.js'

  export default {
    store: Store,
    created() {
      // 阻止默认的拖动事件
      document.addEventListener('drop', event => event.preventDefault(), false)
      document.addEventListener('dragover', event => event.preventDefault(), false)
    }
  }

</script>


<style lang="scss">
  @font-face {
    font-family: SourceHanSansCN-Light;
    src: url('./fonts/SourceHanSansCN-Light.ttf');
    font-weight: normal;
  }

  $family-primary: Arial,
  "SourceHanSansCN-Light",
  "Hiragino Sans GB",
  "Microsoft YaHei",
  sans-serif;
  @import '../node_modules/bulma/bulma.sass';
  @import './styles/index.scss';
</style>
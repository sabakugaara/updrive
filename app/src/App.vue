<template>
  <router-view></router-view>
</template>

<script>
  import store from 'src/vuex/store'
  import { commit } from 'vuex'
  import * as filters from './filters'
  import { listenSelectAll } from './api/electron.js'

  export default {
    store,
    created() {
      listenSelectAll((event, message) => this.$store.commit('SHORTCUT_SELECT_ALL'))
    }
  }
</script>


<style lang="scss">
  @font-face {
    font-family: SourceHanSansCN-Light;
    src: url('./fonts/SourceHanSansCN-Light.ttf');
    font-weight: normal;
  }

  $family-primary: Arial, "SourceHanSansCN-Light", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;

  @import '../node_modules/bulma/bulma.sass';
  @import './styles/index.scss';
</style>
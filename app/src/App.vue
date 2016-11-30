<template>
  <router-view></router-view>
</template>

<script>
  import * as filters from './filters'
  import store from 'src/vuex/store'

  export default {
    store,
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
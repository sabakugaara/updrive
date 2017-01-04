<template>
  <div class="page-main">
    <main-menu></main-menu>
    <main-view></main-view>
    <create-folder></create-folder>
  </div>
</template>

<script>
  import MainView from '../view/MainView'
  import MainMenu from '../view/MainMenu'
  import CreateFolder from '../modal/CreateFolder'

  export default {
    components: {
      MainView,
      MainMenu,
      CreateFolder,
    },
    name: 'PageMain',
  }
</script>
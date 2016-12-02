<template>
  <div class="page-main">
    <main-menu></main-menu>
    <main-view></main-view>
  </div>
</template>

<script>
  import MainView from '../view/MainView'
  import MainMenu from '../view/MainMenu'

  export default {
    components: {
      MainView,
      MainMenu,
    },
    name: 'PageMain',
  }
</script>
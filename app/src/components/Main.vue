<template>
  <section class="page">
    <page-header></page-header>
    <page-main></page-main>
  </section>
</template>

<style>

  .page {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: #fcfcfc;
  }

</style>

<script>
  import PageHeader from './layout/PageHeader'
  import PageMain from './layout/PageMain'

  export default {
    created () {
      this.$store.dispatch({ type: 'GET_LIST_DIR_INFO', path: '/' })
        .then(result => {
          console.log(result)
        })
        .catch(error => {
          console.log(error)
        })
    },
    components: {
      PageHeader,
      PageMain,
    },
  }
</script>
<template>
  <div class="bar">
    <div class="nav">
      {{user.bucketName}}
    </div>
  </div>
</template>


<script>
  import { mapState } from 'vuex'

  export default {
    computed: {
      ...mapState(['user']),
    }
  }
</script>

<style>
  .bar {
    border-top: 1px solid #ccc;
    align-items: center;
    display: flex;
    background: #fafafa;
  }

  .nav {
    align-items: center;
    background: #fafafa;
    font-size: 1.5em;
  }
</style>
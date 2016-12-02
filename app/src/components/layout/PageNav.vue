<template>
  <div class="bar">
    <div class="button-zone">

    </div>
    <div class="nav">
      {{user.bucketName}}
      <div>
        <div></div>
        <div></div>
      </div>
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
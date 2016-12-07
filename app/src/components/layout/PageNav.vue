<template>
  <div class="bar">
    <div class="button-zone">

    </div>
    <div class="nav">
      <div>
        <div class="breadcrumb-bar">
          <div @click.prevent.stop="goto()" class="path-item">{{user.bucketName}}</div>
        </div>
      </div>
      <div v-for="(path, index) in pathArray">
        <div class="breadcrumb-bar">
          <div class="link-icon">
            <div class="link-icon-inner">
              <svg class="a-s-fa-Ha-pa" x="0px" y="0px" width="20px" height="20px" viewBox="0 0 24 24" focusable="false" fill="#000000">
                <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"></path>
              </svg>
            </div>
          </div>
          <div @click.prevent.stop="goto(index)" class="path-item">{{path}}</div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import { mapState } from 'vuex'
  import { take, split, identity, filter, compose, concat, join } from 'ramda'

  export default {
    computed: {
      pathArray() {
        return compose(filter(identity), split('/'))(this.list.dirInfo.path)
      },
      ...mapState(['user', 'list']),
    },
    methods: {
      goto(index) {
        return this.$store.dispatch({
          type: 'GET_LIST_DIR_INFO',
          path: `/${compose(join('/'), take(index + 1))(this.pathArray)}/`,
        }).then(result => {
          // console.log(result)
        }).catch(error => {
          alert(error)
        })
      }
    }
  }
</script>
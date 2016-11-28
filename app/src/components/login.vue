<template>
  <section class="hero is-fullheight is-dark is-bold">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-vcentered">
          <div class="column is-6 is-offset-3">
            <div class="box">
              <form @submit.prevent="submit" novalidate>
                <label class="label">服务名</label>
                <p class="control">
                  <input class="input" type="text" v-model.trim="bucketName" placeholder="服务名称">
                </p>
                <label class="label">操作员</label>
                <p class="control">
                  <input class="input" type="text" v-model.trim="operatorName" placeholder="操作员账号">
                </p>
                <label class="label">密码</label>
                <p class="control">
                  <input class="input" type="password" v-model.trim="password" placeholder="操作员密码">
                </p>
                <hr>
                <p class="control">
                  <button type="submit" class="button is-primary is-fullwidth">登录</button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import store from 'src/vuex/store'
  import { mapState } from 'vuex'

  export default {
    methods: {
      submit() {
        const {operatorName, password, bucketName} = this
        if(!(operatorName && password && bucketName)) return false
        this.$store
          .dispatch({ type: 'VERIFICATION_ACCOUNT', bucketName, operatorName, password,})
          .then(result => {
            this.$router.push({ name: 'main'})
          })
          .catch(error => {
            alert(error)
          })
      }
    }
  }
</script>
<template>
  <div class="login-wrapper">
    <!-- pop -->
    <div class="modal">
      <!-- list -->
      <el-form ref="userForm" :model="user" status-icon :rules="rules">
        <div class="logo">
          <img src="./../assets/images/1.jpg" alt="">
        </div>
        <el-form-item prop="userName">
          <el-input type="text" placeholder="Username" prefix-icon="User" size="large" v-model="user.userName" />
        </el-form-item>

        <el-form-item prop="userPwd">
          <el-input type="password" placeholder="Password" size="large" prefix-icon="Lock" v-model="user.userPwd" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btn-login" @click="login" size="large">
            Login
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import storage from './../utils/storage'
import utils from './../utils/utils'
export default {
  name: 'login',
  components: {
  },
  data() {
    return {
      user: {
        userName: '',
        userPwd: ''
      },
      rules: {
        userName: [
          {
            required: true, message: "Please enter username", trigger: 'blur'
          }
        ],
        userPwd: [
          {
            required: true, message: "Please enter password", trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    login() {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          this.$api.login(this.user).then(async (res) => {
            this.$store.commit('saveUserInfo', res)
            this.$router.push('/welcome')
          })
        } else {
          return false;
        }
      })
    },
    async loadAsyncRoutes() {
      let userInfo = storage.getItem('userInfo') || {}
      if (userInfo.token) {
        try {
          const  menuList  = await this.$api.getPermissionList()
          let routes = utils.generateRoute(menuList)
          routes.map(route => {
            let url = `./../views/${route.component}.vue`
            route.component = () => import(url);
          })
        } catch (error) {
          console.log("error")
        }
      }
    },
    goHome() {
      this.$router.push('/welcome')
    }
  }
}
</script>

<style lang="scss">
/* a {
  color: #42b983;
} */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #343a40;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .modal {
    width: 500px;
    padding: 60px;
    border-radius: 7px;

    ::placeholder {
      font-size: 17px;
    }

    .logo {
      position: relative;

      img {
        position:inherit;
        overflow: hidden;
      }
    }

    .btn-login {
      width: 100%;
    }
  }
}
</style>
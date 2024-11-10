<template>
  <div class="basic-layout">
    <div :class="['nav-side', isCollapse ? 'fold' : 'unfold']">
      <div class="logo">
        <el-icon><User /></el-icon>
        <span>Welcome, {{ userInfo.userName }}</span>
      </div>
      <el-menu :default-active="activeMenu" background-color="#4C5DA1" text-color="#fff" router :collapse="isCollapse"
        class="nav-menu">
        <TreeMenu :userMenu="userMenu" />
      </el-menu>
    </div>
    <div :class="['content-right',
      isCollapse ? 'fold' : 'unfold']">
      <div class="nav-top">
        <nav class="nav-left">
          <div class="menu-fold" @click="toggle">
            <el-icon>
              <Fold />
            </el-icon>
          </div>
          <div class="bread">
            <BreadCrumb />
          </div>
        </nav>
        <div class="user-info">
          <el-badge :is-dot="noticeCount > 0 ? true : false" class="bell">
            <el-icon>
              <Bell />
            </el-icon>
          </el-badge>
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown-link">
              <div>
                <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                <el-icon class="user-icon-right">
                  <arrow-down />
                </el-icon>
              </div>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="email">
                  Email Address：{{ userInfo.userEmail }}
                </el-dropdown-item>
                <el-dropdown-item command="userinfo">User Info</el-dropdown-item>
                <el-dropdown-item command="logout">Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="wrapper">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script >
import TreeMenu from '@/components/TreeMenu.vue'
import BreadCrumb from '@/components/BreadCrumb.vue'
export default {
  name: 'Home',
  components: { TreeMenu, BreadCrumb },
  data() {
    return {
      isCollapse: false, 
      userInfo: this.$store.state.userInfo,
      noticeCount: 0,
      userMenu: [], 
      activeMenu: location.hash.slice(1)
    }
  },
  computed: {
    noticeCount() {
      return this.$store.state.noticeCount
    },
  },
  mounted() {
    this.getNoticeCount()
    this.getMenuList()
  },
  methods: {
    toggle() {
      this.isCollapse = !this.isCollapse
    },
    handleCommand(key) {
      if (key =="userinfo"){
        this.$router.push("/userInfo")
      }
      else if(key == "email"){
        console.log("email")
      }
      else{
        this.$store.commit("saveUserInfo", "")
        this.userInfo = {}
        this.$router.push("/login")
      }
    },
    async getNoticeCount() {
      try {
        const count = await this.$api.noticeCount()
        this.$store.commit("saveNoticeCount", count)
      } catch (error) {
        console.error(error)
      }
    },
    async getMenuList() {
      try {
        const { menuList, actionList } = await this.$api.getPermissionList()
        this.userMenu = menuList
        this.$store.commit("saveUserMenu", menuList)
        this.$store.commit("saveUserAction", actionList)
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style lang="scss">
.basic-layout {
  position: relative;

  .nav-side {
    position: fixed;
    width: 250px;
    height: 100vh;
    background-color: #4c5da1;
    color: #fff;
    overflow-y: auto;
    transition: width 0.5s;

    .title-size {
      font-size: 18px;
    }

    .logo {
      display: flex;
      align-items: center;
      font-size: 20px;
      height: 5%;

      img {
        margin: 0 20px;
        width: 35px;
        height: 35px;
      }
    }

    .nav-menu {
      // height: calc(100vh - 60px);
      border-right: none;
    }

    &.fold {
      width: 0px;
    }

    &.unfold {
      width: 250px;
    }
  }

  .content-right {
    margin-left: 250px;
    transition: width 1s;

    &.fold {
      margin-left: 75px;
    }

    &.unfold {
      margin-left: 250px;
    }

    .nav-top {
      height: 50px;
      line-height: 50px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #ddd;
      padding: 0 20px;
      font-size: 18px;

      .nav-left {
        display: flex;
        align-items: center;

        .menu-fold {
          padding-right: 20px;
          line-height: 20px;
          font-size: 25px;
          cursor: pointer;
        }
      }

      .user-info {
        .bell {
          line-height: 30px;
          margin-right: 20px;
          cursor: pointer;
        }

        .user-dropdown-link {
          margin-right: 20px;
          cursor: pointer;

          .user-icon-right {
            margin-left: 10px;
          }
        }

      }
    }

    .wrapper {
      background-color: #eef0f3;
      padding: 20px;
      height: calc(100vh - 50px);

      .main-page {
        background-color: #fff;
        height: 100%;
      }
    }
  }
}
</style>

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import request from './utils/request'
import storage from './utils/storage'
import api from './api'
import store from './store'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

console.log("Environment=>", import.meta.env)

const app = createApp(App)


app.directive('has', {
  beforeMount: function (el, binding) {
    let actionList = storage.getItem('actionList')
    let value = binding.value
    let hasPermission = actionList.includes(value)
    if (!hasPermission) {
      el.style = "display:none"
      setTimeout(() => {
        el.parentNode.removeChild(el)
      }, 0)

    }
  }
})

app.config.globalProperties.$request = request
app.config.globalProperties.$api = api
app.config.globalProperties.$storage = storage
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(router).use(store).mount('#app')


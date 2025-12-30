import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 创建Vue应用实例
const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err)
  console.error('Instance:', instance)
  console.error('Info:', info)
  
  // 可以在这里集成错误上报服务
  // reportError(err)
}

// 全局配置
app.config.globalProperties.$filters = {
  formatDate(date) {
    if (!date) return ''
    return new Date(date).toLocaleDateString()
  }
}

// 挂载应用
app.mount('#app')

// 注册Service Worker（PWA支持）
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.log('Service Worker 注册失败:', error)
    })
  })
}

// 离线提示
window.addEventListener('online', () => {
  console.log('应用已恢复在线')
  // 可以在这里添加重新同步数据的逻辑
})

window.addEventListener('offline', () => {
  console.log('应用已离线')
  // 可以在这里显示离线提示
})
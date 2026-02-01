// Suppress ResizeObserver loop warning
const originalConsoleError = console.error
console.error = (...args) => {
  if (/ResizeObserver loop/.test(args[0])) return
  originalConsoleError(...args)
}

import { createApp } from 'vue'
import Cookies from 'js-cookie'
import 'normalize.css/normalize.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import '@/styles/index.scss'
import App from './App'
import store from './store'
import router from './router'
import SvgIcon from './icons'
import './permission'
import ErrorLog from './utils/error-log'
import FilterPlugin from './filters/filter-plugin'
import i18n from './i18n'
import waves from './directive/waves'
import permission from './directive/permission'
import elTable from './directive/el-table'
import elDragDialog from './directive/el-drag-dialog'
import clipboard from './directive/clipboard'

if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

const app = createApp(App)
app.use(store)
app.use(router)
app.use(ElementPlus, { size: Cookies.get('size') || 'medium', locale: zhCn })
app.component('svg-icon', SvgIcon)
app.use(FilterPlugin)
app.use(i18n)
app.use(waves)
app.use(permission)
app.use(elTable)
app.use(elDragDialog)
app.use(clipboard)
app.use(ErrorLog)
app.mount('#app')

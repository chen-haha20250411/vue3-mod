// Simple i18n configuration for Vue 3
// Maps translation keys to Chinese text

const messages = {
  'table.search': '查询',
  'table.add': '新增',
  'table.edit': '编辑',
  'table.delete': '删除',
  'table.actions': '操作',
  'login.username': '用户名',
  'login.password': '密码',
  'login.any': '任意',
  'login.thirdparty': '第三方登录'
}

export default {
  install(app) {
    app.config.globalProperties.$t = function(key) {
      return messages[key] || key
    }
  }
}

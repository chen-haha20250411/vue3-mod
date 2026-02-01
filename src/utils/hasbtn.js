// 权限检查方法
export function has(value, btnPermissionsArr) {
  let isExist = false
  // 获取用户按钮权限
  if (btnPermissionsArr === null || btnPermissionsArr.length <= 0) {
    return false
  }
  if (btnPermissionsArr.indexOf(value) > -1) {
    isExist = true
  }
  return isExist
}

export default {
  install(app) {
    app.directive('has', {
      mounted(el, binding, vnode) {
        const btnPermissionsArr = vnode.context.$route.meta.btnPermissions
        if (!has(binding.value, btnPermissionsArr)) {
          el.parentNode.removeChild(el)
        }
      }
    })
    app.config.globalProperties.$_has = has
  }
}
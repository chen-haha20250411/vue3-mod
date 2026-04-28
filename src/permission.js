import router from './router'
import store from './store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken, setToken } from '@/utils/auth'
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect']

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta.title)
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/dashboard' })
      NProgress.done()
    } else {
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        // 检查目标路由是否存在
        const targetRoute = router.getRoutes().find(r => r.path === to.path)
        if (!targetRoute) {
          // 路由不存在，可能是刷新后动态路由丢失，需要重新获取菜单并添加路由
          try {
            const { menus } = await store.dispatch('user/getInfo')
            const accessRoutes = await store.dispatch('permission/generateRoutes', { roles: store.getters.roles, menus })
            accessRoutes.forEach((route) => {
              router.addRoute(route)
            })
            next({ path: to.path })
          } catch (error) {
            await store.dispatch('user/resetToken')
            ElMessage.error('获取路由信息失败')
            next(`/login?redirect=${to.path}`)
          }
        } else {
          next()
        }
      } else {
        try {
          const { roles, menus } = await store.dispatch('user/getInfo')
          const accessRoutes = await store.dispatch('permission/generateRoutes', { roles, menus })
          accessRoutes.forEach((route) => {
            router.addRoute(route)
          })
          next({ path: to.path })
        } catch (error) {
          await store.dispatch('user/resetToken')
          ElMessage.error(error || '获取用户信息失败')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

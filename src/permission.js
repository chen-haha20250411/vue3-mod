import router from './router'
import store from './store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect']

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta.title)

  const hasToken = getToken()
  console.log('[Router Guard] hasToken:', !!hasToken, 'to.path:', to.path, 'to:', to)

  if (hasToken) {
    if (to.path === '/login') {
      console.log('[Router Guard] Already logged in, redirect to /dashboard')
      next({ path: '/dashboard' })
      NProgress.done()
    } else {
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      console.log('[Router Guard] hasRoles:', hasRoles, 'store.getters.roles:', store.getters.roles)

      if (hasRoles) {
        console.log('[Router Guard] Already have roles, proceed')
        next()
      } else {
        try {
          console.log('[Router Guard] Calling getInfo...')
          const { roles, menus } = await store.dispatch('user/getInfo')
          console.log('[Router Guard] getInfo success, roles:', roles, 'menus count:', menus?.length)

          const accessRoutes = await store.dispatch('permission/generateRoutes', { roles, menus })
          console.log('[Router Guard] generateRoutes success, routes count:', accessRoutes?.length)
          console.log('[Router Guard] Routes to add:', accessRoutes)

          accessRoutes.forEach((route, index) => {
            console.log(`[Router Guard] Adding route ${index}:`, route.path, route)
            router.addRoute(route)
          })
          console.log('[Router Guard] addRoutes done, current routes:', router.getRoutes())

          const redirect = to.query.redirect || '/dashboard'
          console.log('[Router Guard] Redirecting to:', redirect)
          next({ path: redirect, replace: true })
        } catch (error) {
          console.error('[Router Guard] Error:', error)
          await store.dispatch('user/resetToken')
          ElMessage.error(error || '获取用户信息失败')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      console.log('[Router Guard] No token, but in whitelist, proceed')
      next()
    } else {
      console.log('[Router Guard] No token, redirect to login')
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

import router from './router'
import store from './store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  console.log('=== router.beforeEach ===')
  console.log('to.path:', to.path)
  console.log('hasToken:', !!hasToken)
  console.log('store.getters.roles:', store.getters.roles)
  console.log('hasRoles:', !!(store.getters.roles && store.getters.roles.length > 0))

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        console.log('Has roles, allowing navigation')
        const routes = router.getRoutes().map(r => ({ path: r.path, name: r.name }))
        
        // 检查目标路由是否存在
        const targetRoute = routes.find(r => r.path === to.path)
        console.log('Target route exists:', !!targetRoute, to.path)
        
        if (!targetRoute) {
          // 路由不存在，尝试查找子路由
          const parentRoute = routes.find(r => {
            if (!r.path.endsWith('/')) {
              return to.path.startsWith(r.path + '/')
            }
            return false
          })
          console.log('Parent route:', parentRoute)
        }
        
        next()
      } else {
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const { roles, menus } = await store.dispatch('user/getInfo')

          console.log('User roles:', roles)
          console.log('menus count:', menus?.length || 0)

          // generate accessible routes map based on roles and menus
          const accessRoutes = await store.dispatch('permission/generateRoutes', { roles, menus })
          console.log('Generated routes:', accessRoutes.map(r => ({ path: r.path, children: r.children?.map(c => c.path) })))

          // dynamically add accessible routes (Vue Router 4)
          console.log('Before addRoute, current routes:', router.getRoutes().map(r => r.path))
          accessRoutes.forEach((route, index) => {
            console.log(`Adding route ${index + 1}:`, route.path)
            router.addRoute(route)
          })
          console.log('After addRoute, current routes:', router.getRoutes().map(r => r.path))

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          console.log('Calling next() with to:', to.path)
          next({ ...to, replace: true })
        } catch (error) {
          console.error('getInfo error:', error)
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          ElMessage.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach((to, from) => {
  // finish progress bar
  NProgress.done()
  
  // Check if the current route has a 403 error
  if (to.meta && to.meta.noPermission) {
    // Already handled
  }
})

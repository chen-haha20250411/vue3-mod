import { constantRoutes } from '@/router'
import Layout from '@/layout'
import views from '@/views/index'

const DEFAULT_COMPONENT = () => import('@/views/dashboard/admin/index')

function loadComponent(path) {
  if (!path || path === '#') return DEFAULT_COMPONENT
  const cleanPath = path.replace(/^\//, '').replace(/\/$/, '')
  if (!cleanPath) return DEFAULT_COMPONENT

  if (views[cleanPath]) return views[cleanPath]
  const indexPath = cleanPath + '/index'
  if (views[indexPath]) return views[indexPath]

  return () => import(`@/views/${cleanPath}.vue`).catch(() => {
    return import(`@/views/${cleanPath}/index.vue`).catch(() => DEFAULT_COMPONENT())
  })
}

function buildRoute(menu) {
  const menuId = menu.menuId || menu.menu_id
  const menuName = menu.menuName || menu.menu_name
  const menuUrl = menu.menuURL || menu.menuUrl || menu.menu_url || '#'
  const icon = menu.imageurl || menu.icon || 'table'
  const menuAuth = menu.menu_auth
  const btnList = menu.btnList || []

  const hasChildren = (menu.subMenuList && menu.subMenuList.length > 0) || (menu.children && menu.children.length > 0)
  const childMenuList = menu.subMenuList || menu.children || []
  const validChildren = hasChildren ? childMenuList.filter(sub => {
    const subUrl = sub.menuURL || sub.menuUrl
    if (subUrl && subUrl !== '#') return true
    if (sub.subMenuList && sub.subMenuList.length > 0) return true
    return false
  }) : []

  if (menuUrl === '#' || !menuUrl) {
    return null
  }

  const fullPath = menuUrl.startsWith('/') ? menuUrl : '/' + menuUrl

  return {
    path: fullPath,
    name: `Menu-${menuId}`,
    component: Layout,
    redirect: fullPath,
    meta: {
      title: menuName,
      icon: icon,
      menuId: menuId,
      menu_auth: menuAuth,
      btnPermissions: btnList
    },
    children: [
      {
        path: '',
        name: `Menu-${menuId}-View`,
        component: loadComponent(menuUrl),
        meta: {
          title: menuName,
          icon: icon,
          menuId: menuId,
          menu_auth: menuAuth,
          btnPermissions: btnList
        }
      }
    ]
  }
}

function flattenMenus(menus, parentMenu = null) {
  const result = []

  menus.forEach(menu => {
    const menuUrl = menu.menuURL || menu.menuUrl || menu.menu_url

    if (menuUrl && menuUrl !== '#') {
      result.push({
        ...menu,
        _parentName: parentMenu ? (parentMenu.menuName || parentMenu.menu_name) : null
      })
    }

    const childMenuList = menu.subMenuList || menu.children || []
    if (childMenuList && childMenuList.length > 0) {
      const childResults = flattenMenus(childMenuList, menu)
      result.push(...childResults)
    }
  })

  return result
}

export function generateRoutesFromMenus(menus) {
  const routes = []

  // 如果有后端菜单数据，添加动态路由
  if (menus && Array.isArray(menus)) {
    const flatMenus = flattenMenus(menus)

    console.log('=== Menu data received from backend ===')
    flatMenus.forEach((menu, index) => {
      console.log(`Menu ${index + 1}:`, {
        menuName: menu.menuName || menu.menu_name,
        menuURL: menu.menuURL || menu.menuUrl || menu.menu_url,
        parentName: menu._parentName
      })
    })

    flatMenus.forEach(menu => {
      const route = buildRoute(menu)
      if (route) {
        // 检查是否已存在于系统静态路由中
        const routeExists = routes.some(existingRoute =>
          existingRoute.path === route.path ||
          (existingRoute.children && existingRoute.children.some(child =>
            `${existingRoute.path}/${child.path}` === route.path
          ))
        )
        const staticRouteExists = constantRoutes.some(staticRoute =>
          staticRoute.path === route.path
        )

        if (!routeExists && !staticRouteExists) {
          if (route.path.includes('detail')) {
            route.hidden = true
          }
          routes.push(route)
        } else {
          console.log(`Route ${route.path} already exists, skipping dynamic generation`)
        }
      }
    })
  }

  console.log('=== Generated routes ===')
  routes.forEach((route, index) => {
    console.log(`Route ${index + 1}:`, {
      path: route.path,
      name: route.name,
      redirect: route.redirect,
      meta: { title: route.meta ? route.meta.title : '' },
      children: route.children ? route.children.map(child => ({ path: child.path, name: child.name, meta: { title: child.meta ? child.meta.title : '' }})) : []
    })
  })

  return routes
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, { roles, menus = [] }) {
    return new Promise(resolve => {
      let accessedRoutes

      if (menus && menus.length > 0) {
        accessedRoutes = generateRoutesFromMenus(menus)
      } else {
        accessedRoutes = []
      }

      accessedRoutes.push({
        path: '/:pathMatch(.*)',
        redirect: '/404',
        hidden: true
      })

      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

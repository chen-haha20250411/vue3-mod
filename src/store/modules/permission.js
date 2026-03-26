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
  const menuId = menu.menuId
  const menuName = menu.menuName
  const menuUrl = menu.menuURL || menu.menuUrl || '#'
  const icon = menu.imageurl || menu.icon || 'table'
  const menuAuth = menu.menu_auth
  const btnList = menu.btnList || []

  const hasChildren = menu.subMenuList && menu.subMenuList.length > 0
  const validChildren = hasChildren ? menu.subMenuList.filter(sub => {
    const subUrl = sub.menuURL || sub.menuUrl
    if (subUrl && subUrl !== '#') return true
    // 保留有子菜单的目录节点
    if (sub.subMenuList && sub.subMenuList.length > 0) return true
    return false
  }) : []

  if (menuUrl === '#' || !menuUrl) {
    if (validChildren.length > 0) {
      const firstChild = validChildren[0]
      const firstChildUrl = firstChild.menuURL || firstChild.menuUrl || ''
      const firstChildFullPath = firstChildUrl.startsWith('/') ? firstChildUrl : '/' + firstChildUrl
      const segments = firstChildFullPath.replace(/^\//, '').split('/')
      const parentRoutePath = '/' + segments[0]

      const route = {
        path: parentRoutePath,
        name: `Menu-${menuId}`,
        component: Layout,
        redirect: firstChildFullPath,
        meta: {
          title: menuName,
          icon: icon,
          menuId: menuId,
          menu_auth: menuAuth,
          btnPermissions: btnList
        },
        children: []
      }

      validChildren.forEach(child => {
        const childRoute = buildChildRoute(child, parentRoutePath)
        if (childRoute) {
          route.children.push(childRoute)
        }
      })

      return route
    }
    return null
  }

  const fullPath = menuUrl.startsWith('/') ? menuUrl : '/' + menuUrl

  if (validChildren.length > 0) {
    const route = {
      path: fullPath,
      name: `Menu-${menuId}`,
      component: Layout,
      meta: {
        title: menuName,
        icon: icon,
        menuId: menuId,
        menu_auth: menuAuth,
        btnPermissions: btnList
      },
      children: []
    }

    validChildren.forEach(child => {
      const childRoute = buildChildRoute(child, fullPath)
      if (childRoute) {
        route.children.push(childRoute)
      }
    })

    return route
  } else {
    const segments = fullPath.replace(/^\//, '').split('/')
    const parentPath = '/' + segments[0]
    const childPath = segments.slice(1).join('/') || 'index'

    return {
      path: parentPath,
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
          path: childPath,
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
}

function buildChildRoute(menu, parentPath) {
  const menuId = menu.menuId
  const menuName = menu.menuName
  const menuUrl = menu.menuURL || menu.menuUrl || '#'
  const icon = menu.imageurl || menu.icon || 'table'
  const menuAuth = menu.menu_auth
  const btnList = menu.btnList || []

  const hasChildren = menu.subMenuList && menu.subMenuList.length > 0
  const validChildren = hasChildren ? menu.subMenuList.filter(sub => {
    const subUrl = sub.menuURL || sub.menuUrl
    if (subUrl && subUrl !== '#') return true
    // 保留有子菜单的目录节点
    if (sub.subMenuList && sub.subMenuList.length > 0) return true
    return false
  }) : []

  const fullPath = menuUrl.startsWith('/') ? menuUrl : '/' + menuUrl
  const parentSegments = parentPath.replace(/^\//, '').split('/')
  const childSegments = fullPath.replace(/^\//, '').split('/')
  const relativeSegments = childSegments.slice(parentSegments.length)
  let relativePath = relativeSegments.join('/')

  if (!relativePath) {
    relativePath = 'index'
  }

  if (validChildren.length > 0) {
    const route = {
      path: relativePath,
      name: `Menu-${menuId}`,
      component: loadComponent(menuUrl),
      meta: {
        title: menuName,
        icon: icon,
        menuId: menuId,
        menu_auth: menuAuth,
        btnPermissions: btnList
      },
      children: []
    }

    validChildren.forEach(child => {
      const childRoute = buildChildRoute(child, fullPath)
      if (childRoute) {
        route.children.push(childRoute)
      }
    })

    return route
  } else {
    return {
      path: relativePath,
      name: `Menu-${menuId}`,
      component: loadComponent(menuUrl),
      meta: {
        title: menuName,
        icon: icon,
        menuId: menuId,
        menu_auth: menuAuth,
        btnPermissions: btnList
      }
    }
  }
}

export function generateRoutesFromMenus(menus) {
  if (!menus || !Array.isArray(menus)) return []

  const routes = []

  menus.forEach(menu => {
    const route = buildRoute(menu)
    if (route) {
      routes.push(route)
    }
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

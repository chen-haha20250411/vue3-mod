import { constantRoutes } from '@/router'
import Layout from '@/layout'
import views from '@/views/index'
import { isExternal } from '@/utils/validate'

const DEFAULT_COMPONENT = () => import('@/views/dashboard/admin/index')

// ============ 工具函数 ============

function loadComponent(path) {
  if (!path || path === '#') return DEFAULT_COMPONENT
  const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '')
  if (!cleanPath) return DEFAULT_COMPONENT

  if (views[cleanPath]) return views[cleanPath]
  const indexPath = cleanPath + '/index'
  if (views[indexPath]) return views[indexPath]

  return () => import(`@/views/${cleanPath}.vue`).catch(() => {
    return import(`@/views/${cleanPath}/index.vue`).catch(() => DEFAULT_COMPONENT())
  })
}

// ============ 路径计算 ============

function getMenuUrl(menu) {
  return menu.menuURL || menu.menuUrl || menu.menu_url || '#'
}

function getChildMenuList(menu) {
  return menu.subMenuList || menu.children || []
}

function hasValidUrl(menu) {
  const url = getMenuUrl(menu)
  return url && url !== '#'
}

function hasValidChildren(menu) {
  const childList = getChildMenuList(menu)
  return childList.some(sub => {
    const subUrl = getMenuUrl(sub)
    return (subUrl && subUrl !== '#') || (sub.subMenuList && sub.subMenuList.length > 0)
  })
}

function isExternalLink(url) {
  return isExternal(url)
}

/**
 * 计算子菜单的相对路径
 * Vue Router 要求子路由 path 不能以 / 开头
 */
function calculateChildPath(menuUrl, parentPath) {
  const cleanUrl = menuUrl.startsWith('/') ? menuUrl.slice(1) : menuUrl

  // 如果子路径以父路径开头，去掉父路径前缀
  if (parentPath && cleanUrl.startsWith(parentPath.replace(/^\//, ''))) {
    let routePath = cleanUrl.substring(parentPath.replace(/^\//, '').length)
    if (routePath.startsWith('/')) {
      routePath = routePath.slice(1)
    }
    return routePath || 'index'
  }

  return cleanUrl || 'index'
}

/**
 * 计算顶级菜单路径
 * 规则：
 * - 有URL直接用（前面加/）
 * - 无URL但有子菜单：用第一个有效子菜单的父路径
 * - 无URL也无子菜单：/container
 */
function calculateRootPath(menu, childMenuList) {
  const menuUrl = getMenuUrl(menu)

  if (hasValidUrl({ menuUrl })) {
    return menuUrl.startsWith('/') ? menuUrl : '/' + menuUrl
  }

  // 查找第一个有效子菜单
  const firstValidChild = childMenuList.find(sub => {
    const subUrl = getMenuUrl(sub)
    return subUrl && subUrl !== '#'
  })

  if (firstValidChild) {
    const firstChildUrl = getMenuUrl(firstValidChild)
    const cleanPath = firstChildUrl.startsWith('/') ? firstChildUrl.slice(1) : firstChildUrl
    const lastSlash = cleanPath.lastIndexOf('/')
    return '/' + (lastSlash > 0 ? cleanPath.substring(0, lastSlash) : cleanPath)
  }

  return '/container'
}

// ============ 路由构建 ============

/**
 * 构建路由的 meta 部分
 */
function buildRouteMeta(menu) {
  const menuId = menu.menuId || menu.menu_id
  const menuName = menu.menuName || menu.menu_name
  const menuUrl = getMenuUrl(menu)
  const icon = menu.imageurl || menu.icon
  const menuAuth = menu.menu_auth
  const btnList = menu.btnList || []

  return {
    title: menuName,
    icon: icon,
    menuId: menuId,
    menu_auth: menuAuth,
    btnPermissions: btnList,
    external: isExternalLink(menuUrl)
  }
}

/**
 * 过滤有效的子菜单
 */
function getValidChildren(menu) {
  const childList = getChildMenuList(menu)
  return childList.filter(sub => {
    const subUrl = getMenuUrl(sub)
    return (subUrl && subUrl !== '#') || (sub.subMenuList && sub.subMenuList.length > 0) || (sub.children && sub.children.length > 0)
  })
}

/**
 * 构建单个菜单对应的路由
 * @param {Object} menu - 菜单对象
 * @param {boolean} isChild - 是否子菜单
 * @param {string} parentPath - 父级完整路径
 * @returns {Object|null} 路由配置或null
 */
function buildRoute(menu, isChild = false, parentPath = '') {
  const menuUrl = getMenuUrl(menu)
  const childMenuList = getChildMenuList(menu)

  const validUrl = hasValidUrl({ menuUrl })
  const validChildren = hasValidChildren(menu)

  // 顶级菜单：无效URL且无子菜单 → 返回null
  if (!validUrl && !isChild && !validChildren) {
    return null
  }

  // 计算路径
  const routePath = isChild
    ? calculateChildPath(menuUrl, parentPath)
    : calculateRootPath(menu, childMenuList)

  // 完整路径（用于子路由拼接）
  const fullPath = parentPath
    ? (routePath === 'index' ? parentPath : parentPath + routePath)
    : routePath

  const route = {
    path: routePath,
    name: `Menu-${menu.menuId || menu.menu_id}`,
    meta: buildRouteMeta(menu)
  }

  // 外部链接
  if (isExternalLink(menuUrl)) {
    route.path = menuUrl
  }

  // 有子菜单：递归构建子路由
  if (validChildren) {
    const validChildList = getValidChildren(menu)

    if (validChildList.length > 0) {
      const childRoutes = validChildList
        .map(child => buildRoute(child, true, fullPath))
        .filter(Boolean)

      route.children = childRoutes

      // 顶级容器菜单：使用Layout + 默认重定向
      if (!isChild) {
        route.component = Layout
        const firstChild = childRoutes[0]
        if (firstChild) {
          route.children.unshift({
            path: '',
            redirect: firstChild.path,
            hidden: true
          })
        }
      }
    }
  }

  // 叶子节点：设置组件
  if (validUrl && !isExternalLink(menuUrl)) {
    route.component = loadComponent(menuUrl)
  } else if (isChild && !validChildren) {
    route.component = loadComponent('')
  }

  return route
}

// ============ 导出函数 ============

export function generateRoutesFromMenus(menus) {
  if (!menus || !Array.isArray(menus)) {
    return []
  }

  const routes = menus
    .map(menu => buildRoute(menu))
    .filter(Boolean)

  // 添加404
  routes.push({
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    hidden: true
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
      const accessedRoutes = menus.length > 0
        ? generateRoutesFromMenus(menus)
        : []

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

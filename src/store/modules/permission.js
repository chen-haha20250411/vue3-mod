import { asyncRoutes, constantRoutes } from '@/router'
import Layout from '@/layout'
import views from '@/views/index'

const DEFAULT_COMPONENT = () => import('@/views/dashboard/admin/index')

function loadComponent(path) {
  if (!path || path === '#') return DEFAULT_COMPONENT
  const cleanPath = path.replace(/^\//, '').replace(/\/$/, '')
  if (!cleanPath) return DEFAULT_COMPONENT
  
  // 先从映射表中查找
  if (views[cleanPath]) {
    return views[cleanPath]
  }
  
  // 回退：尝试动态导入
  return () => import(`@/views/${cleanPath}.vue`).catch(() => {
    console.warn(`Component not found: ${cleanPath}`)
    return DEFAULT_COMPONENT()
  })
}

function extractModule(url) {
  if (!url) return ''
  return url.split('/')[0] || ''
}

function toRoutePath(url) {
  if (!url || url === '#') return ''
  return url.replace(/^\//, '')
}

function splitToSegments(url) {
  if (!url || url === '#') return []
  return url.replace(/^\//, '').split('/').filter(s => s)
}

export function generateRoutesFromMenus(menus) {
  const routes = []
  
  if (!menus || !Array.isArray(menus)) return routes
  
  menus.forEach(menu => {
    if (!menu.menuId) return
    
    const menuName = menu.menuName || '未命名菜单'
    const menuUrl = menu.menuURL || menu.menuUrl || '#'
    const menuId = menu.menuId
    
    if (menu.subMenuList && menu.subMenuList.length > 0) {
      const validSubMenus = menu.subMenuList.filter(sub => {
        const url = sub.menuURL || sub.menuUrl
        return url && url !== '#'
      })
      
      if (validSubMenus.length === 0) return
      
       const firstSubModule = extractModule(validSubMenus[0].menuURL || validSubMenus[0].menuUrl)
       
       // 修复：即使模块名不同，如果是1个子菜单，也应该正确生成路由
       if (validSubMenus.length === 1) {
         const subMenu = validSubMenus[0]
         const subMenuName = subMenu.menuName || '未命名子菜单'
         const subMenuUrl = subMenu.menuURL || subMenu.menuUrl
         const segments = splitToSegments(subMenuUrl)
         const moduleName = segments[0] || ''
         
         const parentRoute = {
           path: '/' + moduleName,
           component: Layout,
           redirect: '/' + moduleName + '/' + (segments[1] || 'list'),
           name: `Menu-${menuId}`,
           meta: { title: menuName, icon: menu.imageurl || 'table', menuId },
           children: [{
             path: segments[1] || 'list',
             component: loadComponent(subMenuUrl),
             name: `SubMenu-${subMenu.menuId}`,
             meta: {
               title: subMenuName,
               icon: subMenu.imageurl || 'list',
               menuId: subMenu.menuId,
               btnPermissions: subMenu.btnList || []
             }
           }]
         }
         
             if (moduleName) {
               const detailPath = `${moduleName}/detail`
               parentRoute.children.push({
                 path: (segments[1] || 'list') + '/detail/:id',
                 component: loadComponent(detailPath),
                 name: `SubMenu-${subMenu.menuId}-Detail`,
                 meta: { title: `${subMenuName}详情`, noCache: true },
                 hidden: true
               })
             }
         
         routes.push(parentRoute)
         return
       }
       
       const allSameModule = validSubMenus.every(sub => {
         const subModule = extractModule(sub.menuURL || sub.menuUrl)
         return subModule === firstSubModule
       })
       
       if (allSameModule && firstSubModule) {
        const parentRoute = {
          path: '/' + firstSubModule,
          component: Layout,
          name: `Menu-${menuId}`,
          meta: { title: menuName, icon: menu.imageurl || 'table', menuId },
          children: []
        }
        
        validSubMenus.forEach(subMenu => {
          const subMenuName = subMenu.menuName || '未命名子菜单'
          const subMenuUrl = subMenu.menuURL || subMenu.menuUrl
          const segments = splitToSegments(subMenuUrl)
          const lastSegment = segments[segments.length - 1] || 'index'
          const moduleName = segments[0] || ''
          
          parentRoute.children.push({
            path: lastSegment,
            component: loadComponent(subMenuUrl),
            name: `SubMenu-${subMenu.menuId}`,
            meta: {
              title: subMenuName,
              icon: subMenu.imageurl || 'list',
              menuId: subMenu.menuId,
              btnPermissions: subMenu.btnList || []
            }
          })
          
            if (moduleName) {
              const detailPath = `${moduleName}/detail`
              parentRoute.children.push({
                path: `${lastSegment}/detail/:id`,
                component: loadComponent(detailPath),
                name: `SubMenu-${subMenu.menuId}-Detail`,
                meta: { title: `${subMenuName}详情`, noCache: true },
                hidden: true
              })
            }
        })
        
        const visibleChildren = parentRoute.children.filter(child => !child.hidden)
        if (visibleChildren.length > 0) {
          parentRoute.redirect = '/' + firstSubModule + '/' + visibleChildren[0].path
        }
        
        routes.push(parentRoute)
        
       } else {
         // 子菜单属于不同模块，为每个子菜单生成独立的父路由
         validSubMenus.forEach(subMenu => {
           const subMenuName = subMenu.menuName || '未命名子菜单'
           const subMenuUrl = subMenu.menuURL || subMenu.menuUrl
           const segments = splitToSegments(subMenuUrl)
           const moduleName = segments[0] || ''
           const childPath = segments[1] || 'list'
           
           const parentRoute = {
             path: '/' + moduleName,
             component: Layout,
             redirect: '/' + moduleName + '/' + childPath,
             name: `Menu-${subMenu.menuId}`,
             meta: {
               title: subMenuName,
               icon: subMenu.imageurl || 'table',
               menuId: subMenu.menuId,
               btnPermissions: subMenu.btnList || []
             },
             children: [{
               path: childPath,
               component: loadComponent(subMenuUrl),
               name: `Menu-${subMenu.menuId}-Index`,
               meta: { title: subMenuName, icon: subMenu.imageurl || 'list', menuId: subMenu.menuId }
             }]
           }
           
             if (moduleName) {
               const detailPath = `${moduleName}/detail`
               parentRoute.children.push({
                 path: childPath + '/detail/:id',
                 component: loadComponent(detailPath),
                 name: `Menu-${subMenu.menuId}-Detail`,
                 meta: { title: `${subMenuName}详情`, noCache: true },
                 hidden: true
               })
             }
           
           routes.push(parentRoute)
         })
       }
      
     } else {
       // 无子菜单，直接生成路由
       const segments = splitToSegments(menuUrl)
       const moduleName = segments[0] || ''
       const childPath = segments[1] || 'list'
       
       const parentRoute = {
         path: '/' + moduleName,
         component: Layout,
         redirect: '/' + moduleName + '/' + childPath,
         name: `Menu-${menuId}`,
         meta: { title: menuName, icon: menu.imageurl || 'table', menuId },
         children: [{
           path: childPath,
           component: loadComponent(menuUrl),
           name: `Menu-${menuId}-Index`,
           meta: { title: menuName, icon: menu.imageurl || 'table', menuId }
         }]
       }
       
            if (moduleName) {
              const detailPath = `${moduleName}/detail`
              parentRoute.children.push({
                path: childPath + '/detail/:id',
                component: loadComponent(detailPath),
                name: `Menu-${menuId}-Detail`,
                meta: { title: `${menuName}详情`, noCache: true },
                hidden: true
              })
            }
       
       routes.push(parentRoute)
     }
   })
   
   console.log('Generated routes from menus:', routes.map(r => ({ path: r.path, children: r.children?.map(c => c.path) })))
   return routes
}

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
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
      console.log('=== generateRoutes START ===')
      console.log('roles:', JSON.stringify(roles))
      console.log('menus:', JSON.stringify(menus))
      
      const isAdmin = roles.some(role => {
        const roleName = role.toLowerCase()
        return roleName === 'admin' || 
               role.includes('超级管理员') || 
               role.includes('管理员') ||
               roleName === 'role_1' ||
               roleName.includes('admin')
      })
      console.log('isAdmin:', isAdmin)
      
      if (isAdmin) {
        console.log('使用静态 asyncRoutes')
        accessedRoutes = asyncRoutes || []
        console.log('asyncRoutes count:', accessedRoutes.length)
      } else {
        console.log('使用动态菜单生成路由')
        if (menus && menus.length > 0) {
          accessedRoutes = generateRoutesFromMenus(menus)
          console.log('动态生成路由 count:', accessedRoutes.length)
          console.log('动态路由详情:', JSON.stringify(accessedRoutes.map(r => ({ 
            path: r.path, 
            name: r.name, 
            redirect: r.redirect,
            children: r.children?.map(c => ({ path: c.path, name: c.name, component: c.component?.toString().substring(0, 50) }))
          })), null, 2))
        } else {
          console.log('menus为空，使用备用路由')
          accessedRoutes = [
            {
              path: '/oper',
              component: Layout,
              redirect: '/oper/list',
              children: [
                {
                  path: 'list',
                  component: () => import('@/views/oper/list'),
                  name: 'OperList'
                }
              ]
            }
          ]
          console.log('备用路由 count:', accessedRoutes.length)
        }
      }
      console.log('=== generateRoutes END ===')
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

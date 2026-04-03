import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from 'nprogress'
import Layout from '@/layout'
import systemRouter from './modules/system'

/**
 * 路由 meta 字段说明:
 * hidden: true                   是否在侧边栏隐藏
 * alwaysShow: true               是否始终显示根菜单
 * redirect: noRedirect           面包屑不重定向
 * name:'router-name'             路由名称，用于 <keep-alive>
 * meta : {
 *   roles: ['admin','editor']    权限角色控制
 *   title: 'title'               菜单标题
 *   icon: 'svg-name'             菜单图标
 *   noCache: true                是否不缓存页面
 *   affix: true                  是否固定在 tags-view
 *   breadcrumb: false            是否在面包屑显示
 *   activeMenu: '/path'          高亮指定路径
 *   menuId: Number               菜单ID
 *   menu_auth: String            菜单权限标识
 *   btnPermissions: Array        按钮权限列表
 * }
 */

/**
 * constantRoutes - 基础路由
 * 无需权限即可访问的页面
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/403',
    component: () => import('@/views/error-page/403'),
    hidden: true
  },
  {
    path: '/',
    redirect: '/dashboard',
    hidden: true
  },
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/index',
    hidden: true,
    meta: { title: '仪表盘', icon: 'dashboard' },
    children: [
      {
        path: 'index',
        component: () => import('@/views/dashboard/admin/index'),
        name: 'Dashboard',
        meta: { title: '仪表盘', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  },
  {
    path: '/data-platform',
    component: Layout,
    redirect: '/data-platform',
    hidden: true,
    meta: { title: '数据中台', icon: 'database' },
    children: [
      {
        path: '',
        component: () => import('@/views/data-platform/index'),
        name: 'SalesOverview',
        meta: { title: '销售数据总览', icon: 'chart' }
      },
      {
        path: 'detail',
        component: () => import('@/views/data-platform/detail'),
        name: 'SalesDetail',
        meta: { title: '销售详情', icon: 'detail' },
        hidden: true
      },
      {
        path: 'customer',
        component: () => import('@/views/data-platform/components/CustomerAnalysis'),
        name: 'CustomerAnalysis',
        meta: { title: '客户行业看板', icon: 'pie' },
        hidden: true
      }
    ]
  },
  {
    path: '/system/data-permission',
    component: Layout,
    redirect: '/system/data-permission/index',
    hidden: true,
    meta: { title: '数据权限管理', icon: 'lock' },
    children: [
      {
        path: 'index',
        component: () => import('@/views/system/data-permission/index'),
        name: 'DataPermissionConfig',
        meta: { title: '数据权限管理', icon: 'peoples' }
      }
    ]
  },
  { ...systemRouter, hidden: true }
]

/**
 * asyncRoutes - 异步路由
 * 完全由后端菜单动态生成，不再使用静态配置
 */
export const asyncRoutes = []

const initRouter = () => createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = initRouter()

// 添加路由错误处理
router.onError(error => {
  // console.error('Router error:', error)
  NProgress.done()
})

export function resetRouter() {
  // Vue Router 4: remove all dynamic routes and re-add constant routes
  const newRouter = initRouter()
  // Replace the current router's routes
  router.options.routes = constantRoutes
}

export default router

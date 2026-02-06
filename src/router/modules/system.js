import Layout from '@/layout'

const systemRouter = {
  path: '/system',
  component: Layout,
  redirect: '/system/user',
  alwaysShow: true,
  name: 'System',
  meta: {
    title: '系统管理',
    icon: 'component',
    roles: ['admin']
  },
  children: [
    {
      path: 'user',
      component: () => import('@/views/system/user/index'),
      name: 'User',
      meta: {
        title: '用户管理',
        roles: ['admin']
      }
    },
    {
      path: 'role',
      component: () => import('@/views/system/role/index'),
      name: 'Role',
      meta: {
        title: '角色管理',
        roles: ['admin']
      }
    },
    {
      path: 'role/auth',
      component: () => import('@/views/system/role/auth'),
      name: 'RoleAuth',
      hidden: true,
      meta: {
        title: '角色授权',
        roles: ['admin'],
        activeMenu: '/system/role'
      }
    },
    {
      path: 'data-permission',
      component: () => import('@/views/system/data-permission/index'),
      name: 'DataPermission',
      meta: {
        title: '数据权限',
        roles: ['admin']
      }
    },
    {
      path: 'page-permission',
      component: () => import('@/views/permission/page'),
      name: 'PagePermission',
      meta: {
        title: '页面权限',
        roles: ['admin']
      }
    },
    {
      path: 'directive-permission',
      component: () => import('@/views/permission/directive'),
      name: 'DirectivePermission',
      meta: {
        title: '指令权限',
        roles: ['admin']
      }
    },
    {
      path: 'role-permission',
      component: () => import('@/views/permission/role'),
      name: 'RolePermission',
      meta: {
        title: '角色权限',
        roles: ['admin']
      }
    }
  ]
}

export default systemRouter

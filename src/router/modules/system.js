import Layout from '@/layout'

const systemRouter = {
  path: '/system',
  component: Layout,
  redirect: '/system/role',
  alwaysShow: true,
  name: 'System',
  meta: {
    title: '系统权限',
    icon: 'lock',
    roles: ['admin']
  },
  children: [
    {
      path: 'role',
      component: () => import('@/views/system/role/index'),
      name: 'Role',
      meta: {
        title: '功能角色管理',
        icon: 'peoples',
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
      path: 'data-role',
      component: () => import('@/views/system/data-role/index'),
      name: 'DataRole',
      meta: {
        title: '数据角色管理',
        icon: 'skill',
        roles: ['admin']
      }
    },
    {
      path: 'data-permission',
      component: () => import('@/views/system/data-permission/index'),
      name: 'DataPermission',
      meta: {
        title: '数据权限管理',
        icon: 'cascader',
        roles: ['admin']
      }
    },
    {
      path: 'user-data-role',
      component: () => import('@/views/system/user-data-role/index'),
      name: 'UserDataRole',
      meta: {
        title: '用户数据角色分配',
        icon: 'peoples',
        roles: ['admin']
      }
    },
    {
      path: 'menu',
      component: () => import('@/views/system/menu/index'),
      name: 'Menu',
      meta: {
        title: '菜单管理',
        icon: 'menu',
        roles: ['admin']
      }
    },
    {
      path: 'user',
      component: () => import('@/views/enterprise/user/index'),
      name: 'SystemUser',
      meta: {
        title: '用户管理',
        icon: 'user',
        roles: ['admin']
      }
    }
  ]
}

export default systemRouter

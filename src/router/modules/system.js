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
    }

  ]
}

export default systemRouter

import Layout from '@/layout'

const systemRouter = {
  path: '/system',
  component: Layout,
  redirect: '/system/user',
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
      path: 'data-permission',
      component: () => import('@/views/system/data-permission/index'),
      name: 'DataPermission',
      meta: {
        title: '数据权限',
        roles: ['admin']
      }
    }
  ]
}

export default systemRouter

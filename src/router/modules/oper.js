import Layout from '@/layout'

const operRouter = {
  path: '/oper',
  component: Layout,
  redirect: '/oper/list',
  name: 'Oper',
  meta: {
    title: '操作员管理',
    icon: 'user'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/oper/list'),
      name: 'OperList',
      meta: {
        title: '操作员列表',
        btnPermissions: ['edit']
      }
    }
  ]
}

export default operRouter

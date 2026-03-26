import Layout from '@/layout'

export default {
  path: '/data-platform',
  component: Layout,
  redirect: '/data-platform',
  name: 'DataPlatform',
  meta: {
    title: '数据中台',
    icon: 'database'
  },
  children: [
    {
      path: '',
      component: () => import('@/views/data-platform/index'),
      name: 'SalesOverview',
      meta: {
        title: '销售数据总览',
        icon: 'chart'
      }
    },
    {
      path: 'detail',
      component: () => import('@/views/data-platform/detail'),
      name: 'SalesDetail',
      meta: {
        title: '销售详情',
        icon: 'detail'
      },
      hidden: true
    }
  ]
}

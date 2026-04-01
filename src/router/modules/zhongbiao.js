import Layout from '@/layout'

const zhongbiaoRouter = {
  path: '/zhongbiao',
  component: Layout,
  redirect: '/zhongbiao/list',
  name: 'Zhongbiao',
  meta: {
    title: '中标信息',
    icon: 'list'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/zhongbiao/list'),
      name: 'ZhongbiaoList',
      meta: {
        title: '中标列表',
        icon: 'list'
      }
    }
  ]
}
export default zhongbiaoRouter

import Layout from '@/layout'

const zhongbiaoRouter = {
  path: '/zhongbiao',
  component: Layout,
  redirect: '/zhongbiao/list',
  name: 'Zhongbiao',
  meta: { 
    title: '中标数据', 
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
    },
    {
      path: 'detail/:id',
      component: () => import('@/views/zhongbiao/detail'),
      name: 'ZhongbiaoDetail',
      meta: { title: '中标详情', noCache: true },
      hidden: true
    }
  ]
}
export default zhongbiaoRouter

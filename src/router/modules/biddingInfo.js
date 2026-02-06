import Layout from '@/layout'

const biddingInfoRouter = {
  path: '/biddingInfo',
  component: Layout,
  redirect: '/biddingInfo/list',
  name: 'BiddingInfo',
  meta: { 
    title: '投标数据', 
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/biddingInfo/list'),
      name: 'BiddingInfoList',
      meta: { 
        title: '招标信息', 
        icon: 'table'
      }
    }
  ]
}
export default biddingInfoRouter

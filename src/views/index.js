// 自动生成的视图组件映射
// 不要手动修改此文件，运行 npm run gen:views 自动生成

const views = {
  // 系统相关
  'system/user/index': () => import('@/views/system/user/index'),
  'system/role/index': () => import('@/views/system/role/index'),
  'system/role/auth': () => import('@/views/system/role/auth'),
  'system/data-permission/index': () => import('@/views/system/data-permission/index'),
  
  // 业务相关
  'oper/list': () => import('@/views/oper/list'),
  'zhongbiao/list': () => import('@/views/zhongbiao/list'),
  'zhongbiao/detail': () => import('@/views/zhongbiao/detail'),
  'biddingInfo/list': () => import('@/views/biddingInfo/list'),
  'biddingInfo/detail': () => import('@/views/biddingInfo/detail'),
  
  // 示例页面
  'example/list': () => import('@/views/example/list'),
  'example/create': () => import('@/views/example/create'),
  'example/edit': () => import('@/views/example/edit'),
  
  // 表格相关
  'table/dynamic-table/index': () => import('@/views/table/dynamic-table/index'),
  'table/drag-table': () => import('@/views/table/drag-table'),
  'table/inline-edit-table': () => import('@/views/table/inline-edit-table'),
  'table/complex-table': () => import('@/views/table/complex-table'),
  
  // 图表相关
  'charts/keyboard': () => import('@/views/charts/keyboard'),
  'charts/line': () => import('@/views/charts/line'),
  'charts/mix-chart': () => import('@/views/charts/mix-chart'),
  
  // 其他页面
  'documentation/index': () => import('@/views/documentation/index'),
  'guide/index': () => import('@/views/guide/index'),
  'profile/index': () => import('@/views/profile/index'),
  'tab/index': () => import('@/views/tab/index'),
  'error-log/index': () => import('@/views/error-log/index'),
  'excel/export-excel': () => import('@/views/excel/export-excel'),
  'excel/upload-excel': () => import('@/views/excel/upload-excel'),
  'excel/select-excel': () => import('@/views/excel/select-excel'),
  'pdf/index': () => import('@/views/pdf/index'),
  'zip/index': () => import('@/views/zip/index'),
  'theme/index': () => import('@/views/theme/index'),
  'clipboard/index': () => import('@/views/clipboard/index'),
  'nested/menu1/index': () => import('@/views/nested/menu1/index'),
  'nested/menu1/menu1-1': () => import('@/views/nested/menu1/menu1-1'),
  'nested/menu1/menu1-2': () => import('@/views/nested/menu1/menu1-2'),
  'nested/menu1/menu1-3': () => import('@/views/nested/menu1/menu1-3'),
  'nested/menu2/index': () => import('@/views/nested/menu2/index'),
}

export default views

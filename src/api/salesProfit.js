import request from '@/utils/request'

export function getSalesProfitReport(params) {
  return request({
    url: '/api/sales/report//salesProfitReport',
    method: 'get',
    params
  })
}

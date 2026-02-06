import request from '@/utils/request'

export function getSalesProfitReport(params) {
  return request({
    url: '/api/sqlserver/test/salesProfitReport',
    method: 'get',
    params
  })
}

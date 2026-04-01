import request from '@/utils/request'

export function getSalesTarget(params) {
  return request({
    url: '/api/sales/report/getSalesTarget',
    method: 'get',
    params
  })
}

export function getValueAddedBusinessNew(params) {
  return request({
    url: '/api/sales/report/getValueAddedBusiness',
    method: 'get',
    params
  })
}

export function getSalesProfitReport(params) {
  return request({
    url: '/api/sales/report/salesProfitReport',
    method: 'get',
    params
  })
}

export function getCustomerSalesData(params) {
  return request({
    url: '/api/customer/salesData',
    method: 'get',
    params
  })
}

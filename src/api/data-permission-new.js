import request from '@/utils/request'

/**
 * 数据权限管理 API 接口
 * 支持分支机构、部门、员工、客户、行业、产品类型、产品线、仓库等权限管理
 */

// 获取数据权限列表（按角色ID）
export function getDataPermissionList(roleId) {
  return request({
    url: `/api/dataPermission/list/${roleId}`,
    method: 'get'
  })
}

// 获取权限类型列表
export function getPermissionTypes() {
  return request({
    url: '/api/dataPermission/permissionTypes',
    method: 'get'
  })
}

// 获取所有员工信息
export function getAllUsers() {
  return request({
    url: '/api/dataPermission/allUsers',
    method: 'get'
  })
}

// 获取所有分支机构信息
export function getAllBranches() {
  return request({
    url: '/api/branchInfo/list',
    method: 'get'
  })
}

// 获取所有部门信息
export function getAllDepartments() {
  return request({
    url: '/api/departmentInfo/list',
    method: 'get'
  })
}

// 获取所有数据角色
export function getAllDataRoles() {
  return request({
    url: '/api/dataRole/list',
    method: 'get'
  })
}

// 获取客户信息
export function getAllCustomers() {
  return request({
    url: '/api/customer/list',
    method: 'get'
  })
}

// 获取行业信息
export function getAllIndustries() {
  return request({
    url: '/api/industry/list',
    method: 'get'
  })
}

// 获取产品类型信息
export function getAllProductTypes() {
  return request({
    url: '/api/productType/list',
    method: 'get'
  })
}

// 获取产品线信息
export function getAllProductLines() {
  return request({
    url: '/api/productLine/list',
    method: 'get'
  })
}

// 获取仓库信息
export function getAllWarehouses() {
  return request({
    url: '/api/warehouse/list',
    method: 'get'
  })
}

// 保存数据权限配置（保留旧函数名，兼容数据权限管理页面）
export function saveDataPermission(data) {
  return request({
    url: '/api/dataPermission/save',
    method: 'post',
    data: data
  })
}

// 更新数据权限配置（保留旧函数名，兼容数据权限管理页面）
export function updateDataPermission(roleId, data) {
  return request({
    url: `/api/dataPermission/update/${roleId}`,
    method: 'put',
    data: data
  })
}

// 分配新权限
export function assignPermission(data) {
  return request({
    url: '/api/dataPermission/assign',
    method: 'post',
    data: data
  })
}

// 更新已有权限配置
export function updatePermission(data) {
  return request({
    url: '/api/dataPermission/update',
    method: 'put',
    data: data
  })
}

// 删除数据权限配置
export function deleteDataPermission(id) {
  return request({
    url: `/api/dataPermission/delete/${id}`,
    method: 'delete'
  })
}

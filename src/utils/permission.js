import store from '@/store'

/**
 * @param {Array} value
 * @returns {Boolean}
 * @example see @/views/permission/directive.vue
 */
export default function checkPermission(value) {
  if (value && value instanceof Array && value.length > 0) {
    const roles = store.getters && store.getters.roles
    const permissionRoles = value

    const hasPermission = roles.some(role => {
      return permissionRoles.includes(role)
    })
    return hasPermission
  } else {
    // console.error(`need roles! Like v-permission="['admin','editor']"`)
    return false
  }
}

/**
 * 判断用户是否为管理员
 * @returns {Boolean}
 */
export function isAdmin() {
  const roles = store.state.user.roles || []
  const adminRoles = ['admin', '超级管理员', '管理员', 'role_1']
  
  return roles.some(role => {
    const roleName = role ? role.toLowerCase() : ''
    return adminRoles.some(adminRole => {
      return roleName.includes(adminRole.toLowerCase())
    })
  })
}

/**
 * 获取当前登录用户的名称
 * @returns {String}
 */
export function getCurrentUserName() {
  return store.state.user.name || store.state.user.login_name || ''
}

/**
 * 获取当前登录用户的登录名
 * @returns {String}
 */
export function getCurrentUserLoginName() {
  return store.state.user.login_name || store.state.user.name || ''
}

/**
 * 获取当前用户的数据权限列表
 * @returns {Array}
 */
export function getDataPermissions() {
  return store.state.user.dataPermissions || []
}

/**
 * 根据权限类型获取数据权限
 * @param {String} permissionType 权限类型，如 'DEPARTMENT'
 * @returns {Object|null} 返回匹配的权限对象或null
 */
export function getDataPermissionByType(permissionType) {
  const dataPermissions = store.state.user.dataPermissions || []
  
  // dataPermissions 结构:
  // [
  //   {
  //     roleId: 1,
  //     roleName: "全部数据权限",
  //     permissions: [
  //       {
  //         permissionType: "DEPARTMENT",
  //         permissionValue: "1,2,3",
  //         permissionName: "总部门, 技术部, 销售部"
  //       }
  //     ]
  //   }
  // ]
  
  // 遍历外层数组
  for (let i = 0; i < dataPermissions.length; i++) {
    const dataPerm = dataPermissions[i]
    
    // 检查是否有 permissions 数组
    if (dataPerm && dataPerm.permissions && Array.isArray(dataPerm.permissions)) {
      // 遍历内层 permissions 数组
      for (let j = 0; j < dataPerm.permissions.length; j++) {
        const p = dataPerm.permissions[j]
        
        if (p && p.permissionType) {
          if (p.permissionType.toLowerCase() === permissionType.toLowerCase()) {
            return p
          }
        }
      }
    }
    
    // 兼容旧结构：直接在外层检查 permissionType
    if (dataPerm && dataPerm.permissionType) {
      if (dataPerm.permissionType.toLowerCase() === permissionType.toLowerCase()) {
        return dataPerm
      }
    }
  }
  
  return null
}

/**
 * 获取指定类型的权限值列表
 * @param {String} permissionType 权限类型，如 'DEPARTMENT'
 * @returns {Array} 返回权限值数组
 */
export function getDataPermissionValues(permissionType) {
  const permission = getDataPermissionByType(permissionType)
  if (!permission || !permission.permissionValue) {
    return []
  }
  
  const value = permission.permissionValue.trim()
  if (value === 'ALL') {
    return ['ALL']
  }
  if (value === 'CURRENT_USER') {
    return ['CURRENT_USER']
  }
  
  return value.split(',').map(v => v.trim()).filter(v => v)
}

/**
 * 获取指定类型的权限名称列表
 * @param {String} permissionType 权限类型，如 'DEPARTMENT'
 * @returns {Array} 返回权限名称数组
 */
export function getDataPermissionNames(permissionType) {
  const permission = getDataPermissionByType(permissionType)
  if (!permission) {
    // console.log('No permission found for type:', permissionType)
    return []
  }
  
  // console.log('Permission found, checking permissionName:', permission)
  
  // 尝试多种字段名，包括不同大小写形式
  const permissionName = permission.permissionName || 
                        permission.PermissionName || 
                        permission.PERMISSION_NAME || 
                        permission.permission_name || 
                        permission.name || 
                        permission.Name || 
                        permission.NAME || 
                        permission.userName || 
                        permission.UserName || 
                        permission.USER_NAME || 
                        permission.user_name || 
                        permission.realName || 
                        permission.RealName || 
                        permission.REAL_NAME || 
                        permission.real_name || 
                        ''
  
  // console.log('Found permissionName:', permissionName)
  
  if (permissionName) {
    const names = permissionName.split(',').map(v => v.trim()).filter(v => v)
    // console.log('Parsed permission names:', names)
    return names
  }
  
  // console.log('No permissionName found in permission:', permission)
  return []
}

/**
 * 获取指定类型的第一个权限名称
 * @param {String} permissionType 权限类型，如 'EMPLOYEE'
 * @returns {String} 返回第一个权限名称
 */
export function getFirstDataPermissionName(permissionType) {
  const names = getDataPermissionNames(permissionType)
  return names.length > 0 ? names[0] : ''
}

/**
 * 检查用户是否有指定的数据权限
 * @param {String} permissionType 权限类型
 * @param {String} permissionValue 权限值
 * @returns {Boolean}
 */
export function hasDataPermission(permissionType, permissionValue) {
  const values = getDataPermissionValues(permissionType)
  if (values.includes('ALL')) {
    return true
  }
  return values.includes(permissionValue)
}

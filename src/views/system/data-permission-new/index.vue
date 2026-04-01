<template>
  <div class="data-permission-container">
    <!-- 头部筛选区域 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <div class="filter-header">
          <h3>数据权限管理</h3>
          <div class="filter-actions">
            <el-select
              v-model="selectedRoleId"
              placeholder="请选择数据角色"
              style="width: 220px; margin-right: 15px;"
              @change="handleRoleChange"
            >
              <el-option
                v-for="role in roleOptions"
                :key="role.id"
                :label="role.roleName"
                :value="role.id"
              />
            </el-select>

            <el-button
              type="primary"
              icon="el-icon-refresh"
              :loading="loading.permissions"
              :disabled="!selectedRoleId"
              @click="loadPermissions"
            >
              加载权限
            </el-button>

            <el-button
              type="success"
              icon="el-icon-check"
              :loading="saving"
              :disabled="!selectedRoleId"
              @click="savePermissions"
            >
              保存权限
            </el-button>

            <el-button
              type="primary"
              icon="el-icon-edit"
              :loading="saving"
              :disabled="!selectedRoleId"
              @click="updatePermissions"
            >
              修改权限
            </el-button>

            <el-button
              type="warning"
              icon="el-icon-refresh-right"
              @click="resetPermissions"
            >
              重置
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 权限配置主体区域 -->
    <div v-if="selectedRoleId" class="main-content">
      <el-card class="permission-card">
        <div slot="header" class="card-header">
          <span>权限配置 - {{ currentRoleName }}</span>
          <el-tag type="success" size="small">{{ permissionStats.total }} 项配置</el-tag>
        </div>

        <el-tabs v-model="activeTab" type="border-card" class="permission-tabs">
          <el-tab-pane
            v-for="type in permissionTypes"
            :key="type.code"
            :label="type.name"
            :name="type.code"
          >
            <permission-panel
              :data="permissionData[type.code]"
              :all-data="allData[type.code]"
              :scope-type="type.code"
              :loading="loading[type.code]"
              @update:data="updatePermissionData(type.code, $event)"
            />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- 空状态提示 -->
    <div v-else class="empty-state">
      <el-empty description="请先选择数据角色">
        <el-button type="primary" @click="loadRoles">加载角色列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import {
  getAllDataRoles,
  getDataPermissionList,
  getAllUsers,
  getAllBranches,
  getAllDepartments,
  getAllCustomers,
  getAllIndustries,
  getAllProductTypes,
  getAllProductLines,
  getAllWarehouses,
  assignPermission,
  updatePermission,
  getPermissionTypes
} from '@/api/data-permission-new'
import PermissionPanel from './components/PermissionPanel'

export default {
  name: 'DataPermissionManagement',
  components: {
    PermissionPanel
  },
  data() {
    return {
      // 基础数据
      roleOptions: [],
      selectedRoleId: null,
      currentRoleName: '',
      permissionTypes: [],

      // 权限数据
      permissionData: {},

      // 所有可选数据
      allData: {},

      // 状态管理
      activeTab: '',
      loading: {
        roles: false,
        permissions: false
      },
      saving: false
    }
  },

  computed: {
    permissionStats() {
      const total = Object.values(this.permissionData).reduce((sum, items) => sum + items.length, 0)
      return { total }
    }
  },

  created() {
    this.initData()
  },

  methods: {
    // 初始化数据
    async initData() {
      await this.loadPermissionTypes()
      await this.loadRoles()
      await this.loadAllMasterData()
    },

    // 加载权限类型
    async loadPermissionTypes() {
      try {
        console.log('开始加载权限类型...')
        const response = await getPermissionTypes()
        console.log('权限类型接口返回:', response)

        const data = response.data || response
        console.log('解析后的数据:', data)

        let types = []
        if (Array.isArray(data)) {
          types = data
        } else if (data.data) {
          if (Array.isArray(data.data)) {
            types = data.data
          } else if (data.data.list && Array.isArray(data.data.list)) {
            types = data.data.list
          } else if (data.data.items && Array.isArray(data.data.items)) {
            types = data.data.items
          }
        } else if (data.list && Array.isArray(data.list)) {
          types = data.list
        } else if (data.items && Array.isArray(data.items)) {
          types = data.items
        }

        console.log('提取到的类型数组:', types)

        // 保存完整的原始对象，同时提取code和name用于显示
        this.permissionTypes = types.map(type => {
          // 获取原始的type_code或permissionType，不做任何转换
          const originalPermissionType = type.type_code || type.permissionType || type.code || type.type || type.key

          // code用于内部使用，转成小写以保持一致性
          const code = originalPermissionType?.toString().toLowerCase()

          return {
            raw: type, // 保存完整的原始对象
            code: code,
            name: type.type_name || type.name || type.permissionName || type.label || type.title,
            // 保存原始的permissionType值（不转换大小写）
            originalPermissionType: originalPermissionType
          }
        }).filter(type => type.code && type.name)

        console.log('处理后的权限类型:', this.permissionTypes)

        // 如果没有加载到权限类型，使用默认的
        if (this.permissionTypes.length === 0) {
          console.log('使用默认权限类型')
          this.permissionTypes = [
            { raw: { type_code: 'BRANCH' }, code: 'branch', name: '分支机构', originalPermissionType: 'BRANCH' },
            { raw: { type_code: 'DEPARTMENT' }, code: 'department', name: '部门', originalPermissionType: 'DEPARTMENT' },
            { raw: { type_code: 'EMPLOYEE' }, code: 'employee', name: '员工', originalPermissionType: 'EMPLOYEE' }
          ]
        }

        // 设置默认activeTab
        if (this.permissionTypes.length > 0) {
          this.activeTab = this.permissionTypes[0].code
        }

        // 动态初始化permissionData、allData和loading
        this.permissionTypes.forEach(type => {
          this.permissionData[type.code] = []
          this.allData[type.code] = []
          this.loading[type.code] = false
        })

        console.log('最终权限类型:', this.permissionTypes)
        this.$message.success(`加载到 ${this.permissionTypes.length} 个权限类型`)
      } catch (error) {
        console.error('加载权限类型失败:', error)
        this.$message.error('加载权限类型失败: ' + (error.message || '未知错误'))

        // 出错时使用默认权限类型
        console.log('出错，使用默认权限类型')
        this.permissionTypes = [
          { raw: { type_code: 'BRANCH' }, code: 'branch', name: '分支机构', originalPermissionType: 'BRANCH' },
          { raw: { type_code: 'DEPARTMENT' }, code: 'department', name: '部门', originalPermissionType: 'DEPARTMENT' },
          { raw: { type_code: 'EMPLOYEE' }, code: 'employee', name: '员工', originalPermissionType: 'EMPLOYEE' }
        ]

        // 设置默认activeTab
        if (this.permissionTypes.length > 0) {
          this.activeTab = this.permissionTypes[0].code
        }

        // 动态初始化permissionData、allData和loading
        this.permissionTypes.forEach(type => {
          this.permissionData[type.code] = []
          this.allData[type.code] = []
          this.loading[type.code] = false
        })
      }
    },

    // 加载角色列表
    async loadRoles() {
      this.loading.roles = true
      try {
        const response = await getAllDataRoles()
        const data = response.data || response
        this.roleOptions = data.list || data.items || (Array.isArray(data) ? data : [])
        this.$message.success(`加载到 ${this.roleOptions.length} 个数据角色`)
      } catch (error) {
        console.error('加载角色列表失败:', error)
        this.$message.error('加载角色列表失败')
      } finally {
        this.loading.roles = false
      }
    },

    // 加载所有主数据
    async loadAllMasterData() {
      const loadData = async(apiFunc, dataKey, loadingKey, mapper) => {
        if (!apiFunc) return

        this.loading[loadingKey] = true
        try {
          const response = await apiFunc()
          const data = response.data || response
          let items = data.list || data.items || (Array.isArray(data) ? data : [])
          if (mapper && Array.isArray(items)) {
            items = items.map(mapper)
          }
          this.allData[dataKey] = items
        } catch (error) {
          console.error(`加载${dataKey}数据失败:`, error)
        } finally {
          this.loading[loadingKey] = false
        }
      }

      // 建立权限类型code到API函数的映射
      const apiMapper = {
        'branch': getAllBranches,
        'department': getAllDepartments,
        'employee': getAllUsers,
        'customer': getAllCustomers,
        'industry': getAllIndustries,
        'productType': getAllProductTypes,
        'productLine': getAllProductLines,
        'warehouse': getAllWarehouses
      }

      // 为员工数据添加mapper，将userId映射为id
      const mapper = (type, item) => {
        if (type === 'employee') {
          return {
            ...item,
            id: item.id || item.userId
          }
        }
        return item
      }

      // 根据权限类型动态加载对应的数据
      const loadPromises = []
      this.permissionTypes.forEach(type => {
        const apiFunc = apiMapper[type.code.toLowerCase()]
        if (apiFunc) {
          loadPromises.push(
            loadData(
              apiFunc,
              type.code,
              type.code,
              (item) => mapper(type.code, item)
            )
          )
        }
      })

      await Promise.all(loadPromises)
    },

    // 角色选择变更
    handleRoleChange(roleId) {
      const role = this.roleOptions.find(r => r.id === roleId)
      this.currentRoleName = role ? role.roleName : ''
      this.resetPermissionData()
    },

    // 重置权限数据
    resetPermissionData() {
      Object.keys(this.permissionData).forEach(key => {
        this.permissionData[key] = []
      })
    },

    // 加载权限配置
    async loadPermissions() {
      if (!this.selectedRoleId) {
        this.$message.warning('请先选择数据角色')
        return
      }

      this.loading.permissions = true
      try {
        const response = await getDataPermissionList(this.selectedRoleId)
        const permissions = this.parsePermissionResponse(response)

        // 按类型分组权限数据
        const groupedPermissions = this.groupPermissionsByType(permissions)

        // 更新权限数据
        Object.keys(this.permissionData).forEach(type => {
          this.permissionData[type] = groupedPermissions[type] || []
        })

        this.$message.success(`成功加载 ${permissions.length} 条权限配置`)
      } catch (error) {
        console.error('加载权限配置失败:', error)
        this.$message.error('加载权限配置失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading.permissions = false
      }
    },

    // 解析权限响应数据
    parsePermissionResponse(response) {
      let permissions = []

      if (Array.isArray(response)) {
        permissions = response
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          permissions = response.data
        } else if (response.data.list && Array.isArray(response.data.list)) {
          permissions = response.data.list
        } else if (response.data.items && Array.isArray(response.data.items)) {
          permissions = response.data.items
        }
      } else if (response.list && Array.isArray(response.list)) {
        permissions = response.list
      } else if (response.items && Array.isArray(response.items)) {
        permissions = response.items
      }

      return permissions
    },

    // 按类型分组权限
    groupPermissionsByType(permissions) {
      const grouped = {}

      // 初始化所有类型
      Object.keys(this.permissionData).forEach(type => {
        grouped[type] = []
      })

      permissions.forEach(permission => {
        const scopeType = this.normalizeScopeType(permission.scopeType || permission.type || permission.permissionType)
        if (grouped[scopeType]) {
          const processedPermission = this.processPermissionItem(permission)
          grouped[scopeType].push(processedPermission)
        }
      })

      return grouped
    },

    // 标准化权限类型
    normalizeScopeType(scopeType) {
      const typeMap = {
        'branch': 'branch',
        'department': 'department',
        'dept': 'department',
        'employee': 'employee',
        'staff': 'employee',
        'customer': 'customer',
        'client': 'customer',
        'industry': 'industry',
        'product_type': 'productType',
        'producttype': 'productType',
        'ptype': 'productType',
        'product_line': 'productLine',
        'productline': 'productLine',
        'pline': 'productLine',
        'warehouse': 'warehouse',
        'storage': 'warehouse'
      }

      return typeMap[scopeType?.toString().toLowerCase()] || scopeType?.toString().toLowerCase()
    },

    // 处理单个权限项
    processPermissionItem(permission) {
      // 处理选中的ID列表
      let selectedIds = []
      const idFields = ['selectedIds', 'selectedIdList', 'permissionValue', 'value']
      for (const field of idFields) {
        if (permission[field] !== undefined && permission[field] !== null) {
          if (Array.isArray(permission[field])) {
            selectedIds = [...permission[field]]
            break
          } else if (typeof permission[field] === 'string') {
            if (permission[field] === 'ALL' || permission[field] === '*') {
              break
            }
            selectedIds = permission[field].split(',').map(v => {
              const trimmed = v.trim()
              const num = Number(trimmed)
              return isNaN(num) ? trimmed : num
            }).filter(v => v !== '' && v !== null && v !== undefined)
            break
          }
        }
      }

      // 处理全选状态
      let isAll = false
      const isAllFields = ['isAll', 'selectAll', 'all']
      for (const field of isAllFields) {
        if (permission[field] !== undefined) {
          isAll = permission[field] === true || permission[field] === 'true' || permission[field] === 1 || permission[field] === 'ALL'
          break
        }
      }

      // 根据permissionType生成dataName
      let dataName = '未知'
      const permissionType = (permission.permissionType || '').toLowerCase()
      const typeNameMap = {
        'branch': '分支机构权限',
        'department': '部门权限',
        'dept': '部门权限',
        'employee': '员工权限',
        'staff': '员工权限',
        'customer': '客户权限',
        'client': '客户权限',
        'industry': '行业权限',
        'product_type': '产品类型权限',
        'producttype': '产品类型权限',
        'ptype': '产品类型权限',
        'product_line': '产品线权限',
        'productline': '产品线权限',
        'pline': '产品线权限',
        'warehouse': '仓库权限',
        'storage': '仓库权限'
      }

      if (typeNameMap[permissionType]) {
        dataName = typeNameMap[permissionType]
      } else if (permissionType) {
        dataName = `${permissionType}权限`
      }

      const result = {
        id: permission.id || permission.permissionId || Date.now(),
        scopeType: this.normalizeScopeType(permission.scopeType || permission.type || permission.permissionType),
        isAll: isAll,
        selectedIds: [...new Set(selectedIds)].filter(id => id !== null && id !== undefined),
        dataName: dataName
      }
      return result
    },

    // 更新权限数据
    updatePermissionData(type, data) {
      this.permissionData[type] = data
    },

    // 保存权限配置
    async savePermissions() {
      if (!this.selectedRoleId) {
        this.$message.warning('请先选择数据角色')
        return
      }

      this.saving = true
      try {
        // 准备保存的数据 - 按每个权限类型单独处理
        const savePromises = []
        this.permissionTypes.forEach(permissionType => {
          const type = permissionType.code
          const items = this.permissionData[type]

          // 对于每个权限类型，只处理第一个权限项（因为PermissionPanel返回的是数组，但我们只需要一个）
          if (items && items.length > 0) {
            const item = items[0]
            // 转换selectedIds为逗号分隔的字符串
            let permissionValue = ''
            if (item.isAll) {
              permissionValue = 'ALL'
            } else if (item.selectedIds && item.selectedIds.length > 0) {
              permissionValue = item.selectedIds.map(id => String(id)).join(',')
            }

            // 判断是新增还是更新
            if (item.id && !isNaN(item.id) && item.id > 0) {
              // 更新已有权限 - 使用PUT /api/dataPermission/update
              const requestData = {
                id: item.id,
                permissionType: permissionType.originalPermissionType,
                permissionValue: permissionValue
              }
              console.log('更新权限请求:', requestData)
              savePromises.push(updatePermission(requestData))
            } else if (permissionValue) {
              // 新增权限 - 使用POST /api/dataPermission/assign
              const requestData = {
                roleId: this.selectedRoleId,
                permissionType: permissionType.originalPermissionType,
                permissionValue: permissionValue
              }
              console.log('新增权限请求:', requestData)
              savePromises.push(assignPermission(requestData))
            }
          }
        })

        if (savePromises.length === 0) {
          this.$message.warning('没有需要保存的权限配置')
          return
        }

        // 等待所有请求完成
        await Promise.all(savePromises)
        this.$message.success('权限配置保存成功')

        // 重新加载权限，验证数据是否真的被保存
        await this.loadPermissions()
      } catch (error) {
        console.error('保存权限配置失败:', error)
        this.$message.error('保存权限配置失败: ' + (error.message || '未知错误'))
      } finally {
        this.saving = false
      }
    },

    // 修改权限配置（只调用updatePermission）
    async updatePermissions() {
      if (!this.selectedRoleId) {
        this.$message.warning('请先选择数据角色')
        return
      }

      this.saving = true
      try {
        const updatePromises = []
        this.permissionTypes.forEach(permissionType => {
          const type = permissionType.code
          const items = this.permissionData[type]

          // 对于每个权限类型，只处理第一个权限项
          if (items && items.length > 0) {
            const item = items[0]
            // 只处理有权限ID的项
            if (item.id && !isNaN(item.id) && item.id > 0) {
              // 转换selectedIds为逗号分隔的字符串
              let permissionValue = ''
              if (item.isAll) {
                permissionValue = 'ALL'
              } else if (item.selectedIds && item.selectedIds.length > 0) {
                permissionValue = item.selectedIds.map(id => String(id)).join(',')
              }

              // 使用PUT /api/dataPermission/update接口
              const requestData = {
                id: item.id,
                permissionType: permissionType.originalPermissionType,
                permissionValue: permissionValue
              }
              console.log('修改权限请求:', requestData)

              updatePromises.push(updatePermission(requestData))
            }
          }
        })

        if (updatePromises.length === 0) {
          this.$message.warning('没有可更新的权限配置')
          return
        }

        // 等待所有更新请求完成
        await Promise.all(updatePromises)
        this.$message.success(`成功更新 ${updatePromises.length} 条权限配置`)

        // 重新加载权限，验证数据是否真的被保存
        await this.loadPermissions()
      } catch (error) {
        console.error('更新权限配置失败:', error)
        this.$message.error('更新权限配置失败: ' + (error.message || '未知错误'))
      } finally {
        this.saving = false
      }
    },

    // 重置权限配置
    resetPermissions() {
      this.$confirm('确定要重置当前权限配置吗？此操作不可恢复', '确认重置', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.resetPermissionData()
        this.$message.success('权限配置已重置')
      }).catch(() => {
        // 用户取消操作
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.data-permission-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.filter-section {
  margin-bottom: 20px;

  .filter-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        color: #303133;
        font-size: 20px;
        font-weight: 500;
      }

      .filter-actions {
        display: flex;
        align-items: center;
      }
    }
  }
}

.main-content {
  .permission-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .permission-tabs {
      ::v-deep .el-tabs__content {
        padding: 20px 0;
      }
    }
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}

// 响应式设计
@media (max-width: 768px) {
  .data-permission-container {
    padding: 10px;
  }

  .filter-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch !important;

    .filter-actions {
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
    }
  }
}
</style>

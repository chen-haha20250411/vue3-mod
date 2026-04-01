<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="selectedRoleId" placeholder="请选择数据角色" style="width: 200px;" class="filter-item" @change="handleRoleChange">
        <el-option v-for="role in roleList" :key="role.id" :label="role.roleName" :value="role.id" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-download" @click="loadPermissions">
        加载权限
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-check" @click="savePermissions">
        保存权限
      </el-button>
    </div>

    <div v-if="selectedRoleId" class="permission-container">
      <div class="permission-header">
        <h3>权限配置 - {{ currentRoleName }}</h3>
      </div>

      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="客户" name="customer" :lazy="false">
          <permission-config
            ref="customerConfig"
            :data="permissionData.customer"
            :all-data="allData.customer"
            :scope-type="scopeTypes.CUSTOMER"
          />
        </el-tab-pane>
        <el-tab-pane label="行业" name="industry" :lazy="false">
          <permission-config
            ref="industryConfig"
            :data="permissionData.industry"
            :all-data="allData.industry"
            :scope-type="scopeTypes.INDUSTRY"
          />
        </el-tab-pane>
        <el-tab-pane label="产品类型" name="productType" :lazy="false">
          <permission-config
            ref="productTypeConfig"
            :data="permissionData.productType"
            :all-data="allData.productType"
            :scope-type="scopeTypes.PRODUCT_TYPE"
          />
        </el-tab-pane>
        <el-tab-pane label="产品线" name="productLine" :lazy="false">
          <permission-config
            ref="productLineConfig"
            :data="permissionData.productLine"
            :all-data="allData.productLine"
            :scope-type="scopeTypes.PRODUCT_LINE"
          />
        </el-tab-pane>
        <el-tab-pane label="仓库" name="warehouse" :lazy="false">
          <permission-config
            ref="warehouseConfig"
            :data="permissionData.warehouse"
            :all-data="allData.warehouse"
            :scope-type="scopeTypes.WAREHOUSE"
          />
        </el-tab-pane>
        <el-tab-pane label="分支机构" name="branch" :lazy="false">
          <permission-config
            ref="branchConfig"
            :data="permissionData.branch"
            :all-data="allData.branch"
            :scope-type="scopeTypes.BRANCH"
          />
        </el-tab-pane>
        <el-tab-pane label="部门" name="department" :lazy="false">
          <permission-config
            ref="departmentConfig"
            :data="permissionData.department"
            :all-data="allData.department"
            :scope-type="scopeTypes.DEPARTMENT"
          />
        </el-tab-pane>
        <el-tab-pane label="员工" name="employee" :lazy="false">
          <permission-config
            ref="employeeConfig"
            :data="permissionData.employee"
            :all-data="allData.employee"
            :scope-type="scopeTypes.EMPLOYEE"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 权限配置子组件 -->
    <permission-config-wrapper />
  </div>
</template>

<script>
import { getDataRoleList, getDataPermissionList, saveDataPermission, getDeptList, getBranchList, getAllUsers } from '@/api/data-permission'

const scopeTypes = {
  CUSTOMER: 'customer',
  INDUSTRY: 'industry',
  PRODUCT_TYPE: 'product_type',
  PRODUCT_LINE: 'product_line',
  WAREHOUSE: 'warehouse',
  BRANCH: 'branch',
  DEPARTMENT: 'department',
  EMPLOYEE: 'employee'
}

const PermissionConfig = {
  name: 'PermissionConfig',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    allData: {
      type: Array,
      default: () => []
    },
    scopeType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      localIsAll: false,
      selectAll: false,
      isIndeterminate: false,
      searchText: '',
      selectedIds: [],
      filteredData: []
    }
  },
  watch: {
    data: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal && Array.isArray(newVal) && newVal.length > 0) {
          // 合并所有权限配置的selectedIds
          let allSelectedIds = []
          let isAll = false

          newVal.forEach((item, idx) => {
            if (item.isAll) {
              isAll = true
            }
            if (item.selectedIds && Array.isArray(item.selectedIds)) {
              allSelectedIds = [...allSelectedIds, ...item.selectedIds]
            }
          })

          // 设置全选状态
          this.localIsAll = isAll

          // 统一转换为数字类型并去重
          this.selectedIds = [...new Set(allSelectedIds)].map(id => {
            const numId = typeof id === 'string' ? Number(id) : id
            return isNaN(numId) ? id : numId
          }).filter(id => id !== null && id !== undefined)
        } else {
          this.localIsAll = false
          this.selectedIds = []
        }

        this.updateFilteredData()
        this.handleSelectionChange()
      }
    },
    allData: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        this.updateFilteredData()
      }
    },
    localIsAll: {
      handler(newVal) {
        if (newVal) {
          this.selectedIds = []
        }
      }
    }
  },
  methods: {
    updateFilteredData() {
      if (this.searchText) {
        const text = this.searchText.toLowerCase()
        this.filteredData = this.allData.filter(item => {
          const name = (item.name || item.deptName || item.branchName || item.realName || '').toLowerCase()
          return name.includes(text)
        })
      } else {
        this.filteredData = this.allData
      }
    },
    handleScopeTypeChange() {},
    handleSelectAllChange(checked) {
      if (checked) {
        this.selectedIds = this.filteredData.map(item => item.id)
      } else {
        this.selectedIds = []
      }
      this.updateIndeterminate()
    },
    handleSelectionChange() {
      const selectedCount = this.selectedIds.length
      const totalCount = this.filteredData.length
      this.selectAll = selectedCount === totalCount && totalCount > 0
      this.isIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },
    handleSearch() {
      this.updateFilteredData()
    },
    isSelected(id) {
      if (!id || !this.selectedIds || this.selectedIds.length === 0) {
        return false
      }

      const numId = typeof id === 'string' ? Number(id) : id
      if (isNaN(numId)) return false

      const result = this.selectedIds.some(sid => {
        if (sid === null || sid === undefined) return false
        const numSid = typeof sid === 'string' ? Number(sid) : sid
        return !isNaN(numSid) && numSid === numId
      })

      // console.log('🔍 isSelected 检查:', {id, numId, selectedIds: this.selectedIds, result})
      return result
    },
    updateIndeterminate() {
      const selectedCount = this.selectedIds.length
      const totalCount = this.filteredData.length
      this.isIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },
    getPermissionData() {
      return [{
        scopeType: this.scopeType,
        isAll: this.localIsAll,
        selectedIds: this.localIsAll ? [] : this.selectedIds
      }]
    }
  },
  template: `
    <div class="permission-config">
      <div class="config-header">
        <el-radio-group v-model="localIsAll" size="small" @change="handleScopeTypeChange">
          <el-radio-button :label="false">指定数据</el-radio-button>
          <el-radio-button :label="true">全部数据</el-radio-button>
        </el-radio-group>
      </div>

      <div v-if="!localIsAll" class="config-content">
        <div class="toolbar">
          <el-checkbox v-model="selectAll" :indeterminate="isIndeterminate" @change="handleSelectAllChange">
            全选
          </el-checkbox>
          <el-input
            v-model="searchText"
            placeholder="搜索..."
            size="small"
            style="width: 200px;"
            clearable
            @input="handleSearch"
          />
        </div>

        <div class="data-list">
          <div v-if="filteredData.length === 0" class="no-data">暂无数据</div>
          <el-checkbox-group v-model="selectedIds" @change="handleSelectionChange">
            <div v-for="item in filteredData" :key="item.id || item.userId" class="data-item">
              <el-checkbox :label="item.id || item.userId">
                {{ item.name || item.deptName || item.branchName || item.realName }}
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </div>

      <div v-else class="all-data-message">
        <el-alert
          title="已选择全部数据"
          type="success"
          description="当前配置为全部数据权限，无需指定具体数据项"
          show-icon
          :closable="false"
        />
      </div>
    </div>
  `
}

export default {
  name: 'DataPermissionManagement',
  components: { PermissionConfig },
  data() {
    return {
      scopeTypes,
      roleList: [],
      selectedRoleId: null,
      currentRoleName: '',
      activeTab: 'branch',
      permissionData: {
        customer: [],
        industry: [],
        productType: [],
        productLine: [],
        warehouse: [],
        branch: [],
        department: [],
        employee: []
      },
      allData: {
        customer: [],
        industry: [],
        productType: [],
        productLine: [],
        warehouse: [],
        branch: [],
        department: [],
        employee: []
      }
    }
  },
  created() {
    this.loadRoles()
    this.loadAllData()
  },
  methods: {
    loadRoles() {
      getDataRoleList().then(res => {
        const response = res.data || res
        const data = response.data || response
        this.roleList = data.list || data.items || (Array.isArray(data) ? data : [])
      }).catch(err => {
        console.error('加载数据角色列表失败:', err)
      })
    },
    loadAllData() {
      getDeptList().then(res => {
        const response = res.data || res
        const data = response.data || response
        this.allData.department = data.list || data.items || (Array.isArray(data) ? data : [])
      }).catch(err => {
        console.error('加载部门数据失败:', err)
      })

      getBranchList().then(res => {
        const response = res.data || res
        const data = response.data || response
        this.allData.branch = data.list || data.items || (Array.isArray(data) ? data : [])
      }).catch(err => {
        console.error('加载分支机构数据失败:', err)
      })

      getAllUsers().then(res => {
        const response = res.data || res
        const data = response.data || response
        const userList = data.list || data.items || (Array.isArray(data) ? data : [])
        // 将userId映射为id，保持数据格式一致
        this.allData.employee = userList.map(user => ({
          ...user,
          id: user.userId || user.id
        }))
      }).catch(err => {
        console.error('加载用户数据失败:', err)
      })

      // 暂时设置为空数组，后续可以添加对应的API调用
      this.allData.customer = []
      this.allData.industry = []
      this.allData.productType = []
      this.allData.productLine = []
      this.allData.warehouse = []
    },
    handleRoleChange() {
      const role = this.roleList.find(r => r.id === this.selectedRoleId)
      this.currentRoleName = role ? role.roleName : ''
    },
    loadPermissions() {
      if (!this.selectedRoleId) {
        this.$message.warning('请先选择数据角色')
        return
      }

      getDataPermissionList(this.selectedRoleId).then(res => {
        // 更灵活的数据提取方式
        let permissions = []
        if (Array.isArray(res)) {
          permissions = res
        } else if (res.data) {
          if (Array.isArray(res.data)) {
            permissions = res.data
          } else if (res.data.list && Array.isArray(res.data.list)) {
            permissions = res.data.list
          } else if (res.data.items && Array.isArray(res.data.items)) {
            permissions = res.data.items
          }
        } else if (res.list && Array.isArray(res.list)) {
          permissions = res.list
        } else if (res.items && Array.isArray(res.items)) {
          permissions = res.items
        }

        if (permissions.length === 0) {
          this.$message.warning('未找到该角色的权限配置')
        }

        const newPermissionData = {
          customer: [],
          industry: [],
          productType: [],
          productLine: [],
          warehouse: [],
          branch: [],
          department: [],
          employee: []
        }

        // 先对权限数据进行去重处理
        const uniquePermissions = []
        const seenPermissions = new Set()

        permissions.forEach(perm => {
          // 尝试多种字段名获取scopeType
          const scopeTypeFields = ['scopeType', 'type', 'permissionType', 'category']
          let scopeType = ''
          for (const field of scopeTypeFields) {
            if (perm[field]) {
              scopeType = perm[field]
              break
            }
          }

          // 提取选中的ID列表
          let selectedIds = []
          const idFields = ['selectedIds', 'selectedIdList', 'permissionValue', 'value']
          for (const field of idFields) {
            if (perm[field] !== undefined && perm[field] !== null) {
              if (Array.isArray(perm[field])) {
                selectedIds = [...perm[field]]
                break
              } else if (typeof perm[field] === 'string') {
                if (perm[field] === 'ALL' || perm[field] === '*') {
                  // ALL情况特殊处理
                  break
                }
                selectedIds = perm[field].split(',').map(v => {
                  const trimmed = v.trim()
                  const num = Number(trimmed)
                  return isNaN(num) ? trimmed : num
                }).filter(v => v !== '' && v !== null && v !== undefined)
                break
              }
            }
          }

          // 判断是否为全选
          const isAllFields = ['isAll', 'selectAll', 'all']
          let isAll = false
          for (const field of isAllFields) {
            if (perm[field] !== undefined) {
              isAll = perm[field] === true || perm[field] === 'true' || perm[field] === 1 || perm[field] === 'ALL'
              break
            }
          }

          // 生成唯一键用于去重
          const uniqueKey = `${scopeType.toLowerCase()}_${isAll}_${JSON.stringify([...selectedIds].sort())}`

          if (!seenPermissions.has(uniqueKey)) {
            seenPermissions.add(uniqueKey)
            uniquePermissions.push(perm)
          }
        })

        // 处理去重后的权限数据
        uniquePermissions.forEach((perm, index) => {
          // 尝试多种字段名获取scopeType
          const scopeTypeFields = ['scopeType', 'type', 'permissionType', 'category']
          let scopeType = ''
          for (const field of scopeTypeFields) {
            if (perm[field]) {
              scopeType = perm[field]
              break
            }
          }

          // 标准化scopeType
          let normalizedScopeType = scopeType.toString().toLowerCase()
          const typeMapping = {
            'department': 'department',
            'dept': 'department',
            'branch': 'branch',
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

          normalizedScopeType = typeMapping[normalizedScopeType] || normalizedScopeType

          // 提取选中的ID列表
          let selectedIds = []
          const idFields = ['selectedIds', 'selectedIdList', 'permissionValue', 'value']
          for (const field of idFields) {
            if (perm[field] !== undefined && perm[field] !== null) {
              if (Array.isArray(perm[field])) {
                selectedIds = [...perm[field]]
                break
              } else if (typeof perm[field] === 'string') {
                if (perm[field] === 'ALL' || perm[field] === '*') {
                  // ALL情况特殊处理
                  break
                }
                selectedIds = perm[field].split(',').map(v => {
                  const trimmed = v.trim()
                  const num = Number(trimmed)
                  return isNaN(num) ? trimmed : num
                }).filter(v => v !== '' && v !== null && v !== undefined)
                break
              }
            }
          }

          // 判断是否为全选
          const isAllFields = ['isAll', 'selectAll', 'all']
          let isAll = false
          for (const field of isAllFields) {
            if (perm[field] !== undefined) {
              isAll = perm[field] === true || perm[field] === 'true' || perm[field] === 1 || perm[field] === 'ALL'
              break
            }
          }

          if (newPermissionData[normalizedScopeType]) {
            const newItem = {
              id: perm.id || perm.permissionId || Date.now() + index,
              dataId: perm.dataId || perm.permissionId || perm.id,
              dataName: perm.dataName || perm.permissionName || perm.name || '未知',
              scopeType: normalizedScopeType,
              isAll: isAll,
              selectedIds: [...new Set(selectedIds)].filter(id => id !== null && id !== undefined)
            }

            newPermissionData[normalizedScopeType].push(newItem)
          } else {
            this.$message.error(`权限类型 "${normalizedScopeType}" 未找到对应配置，请检查数据格式`)
          }
        })

        // Vue 3 中直接赋值即可触发响应式更新
        this.permissionData = newPermissionData

        // 强制触发组件更新以确保子组件接收到数据
        this.$nextTick(() => {
          this.$forceUpdate()
        })

        // 验证关键数据是否存在
        const testData = {
          branch: newPermissionData.branch.length > 0,
          department: newPermissionData.department.length > 0,
          employee: newPermissionData.employee.length > 0
        }

        // 如果数据为空，显示详细诊断信息
        if (Object.values(testData).every(val => !val)) {
          this.$message.error('权限数据加载失败，请查看控制台详细信息')
        }

        this.$nextTick(() => {
          this.$message.success(`权限加载成功，共加载 ${permissions.length} 条权限记录`)
        })
      }).catch(err => {
        console.error('加载权限配置失败:', err)
        this.$message.error('加载权限失败：' + (err.msg || err.message || '网络错误'))
      })
    },
    savePermissions() {
      if (!this.selectedRoleId) {
        this.$message.warning('请先选择数据角色')
        return
      }

      const permissions = []

      Object.keys(this.scopeTypes).forEach(key => {
        const scopeType = this.scopeTypes[key]
        const refName = scopeType + 'Config'
        const component = this.$refs[refName]
        if (component && component.getPermissionData) {
          const permData = component.getPermissionData()
          permissions.push(...permData)
        }
      })

      saveDataPermission({
        roleId: this.selectedRoleId,
        permissions: permissions
      }).then(res => {
        this.$message.success('权限保存成功')
      }).catch(err => {
        console.error('保存权限配置失败:', err)
        this.$message.error('保存权限失败：' + (err.msg || err.message || '网络错误'))
      })
    }
  }
}
</script>

<style scoped>
.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.filter-item {
  flex-shrink: 0;
}

.permission-container {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
}

.permission-header {
  margin-bottom: 20px;
}

.permission-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.permission-config {
  padding: 20px 0;
}

.config-header {
  margin-bottom: 20px;
}

.config-content {
  margin-top: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.data-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  min-height: 200px;
  background: #fafafa;
}

.no-data {
  width: 100%;
  text-align: center;
  color: #999;
  padding: 20px;
}

.data-item {
  width: 200px;
  background: #fff;
  padding: 8px;
  border-radius: 4px;
}

.data-item /deep/ .el-checkbox__label {
  width: 100%;
  padding-left: 10px;
}

.highlight {
  color: #409EFF;
  font-weight: 500;
}
</style>

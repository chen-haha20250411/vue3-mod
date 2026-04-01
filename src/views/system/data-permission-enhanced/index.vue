<template>
  <div class="data-permission-container">
    <!-- 顶部标签页导航 -->
    <div class="top-navigation">
      <el-tabs v-model="activeMainTab" type="border-card" class="main-tabs">
        <el-tab-pane label="文档" name="documentation">
          <div class="tab-content">
            <el-empty description="文档内容区域" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="销售数据概览" name="salesOverview">
          <div class="tab-content">
            <el-empty description="销售数据概览区域" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="数据权限管理" name="permissionManagement">
          <div class="tab-content permission-management-content">
            <!-- 部门选择和操作按钮 -->
            <div class="filter-section">
              <div class="filter-row">
                <el-select
                  v-model="selectedDepartment"
                  placeholder="请选择部门"
                  style="width: 250px;"
                  @change="handleDepartmentChange"
                >
                  <el-option
                    v-for="dept in departmentOptions"
                    :key="dept.id"
                    :label="dept.name"
                    :value="dept.id"
                  />
                </el-select>

                <el-button
                  type="primary"
                  icon="el-icon-refresh"
                  :loading="loading.permissions"
                  :disabled="!selectedDepartment"
                  @click="loadPermissions"
                >
                  加载权限
                </el-button>

                <el-button
                  type="success"
                  icon="el-icon-check"
                  :loading="saving"
                  :disabled="!selectedDepartment"
                  @click="savePermissions"
                >
                  保存权限
                </el-button>
              </div>
            </div>

            <!-- 权限范围选择 -->
            <div class="scope-selection">
              <div class="scope-title">数据范围</div>
              <el-radio-group v-model="permissionScope" @change="handleScopeChange">
                <el-radio label="specified">指定数据</el-radio>
                <el-radio label="all">全部数据</el-radio>
                <el-radio label="currentUser">仅当前用户</el-radio>
              </el-radio-group>
            </div>

            <!-- 权限配置主体 -->
            <div class="permission-main">
              <el-tabs v-model="activePermissionTab" class="permission-tabs">
                <el-tab-pane label="客户" name="customer">
                  <permission-list
                    :data="customerData"
                    :all-data="allCustomers"
                    :loading="loading.customer"
                    @selection-change="handleCustomerSelection"
                  />
                </el-tab-pane>
                <el-tab-pane label="行业" name="industry">
                  <permission-list
                    :data="industryData"
                    :all-data="allIndustries"
                    :loading="loading.industry"
                    @selection-change="handleIndustrySelection"
                  />
                </el-tab-pane>
                <el-tab-pane label="产品类型" name="productType">
                  <permission-list
                    :data="productTypeData"
                    :all-data="allProductTypes"
                    :loading="loading.productType"
                    @selection-change="handleProductTypeSelection"
                  />
                </el-tab-pane>
                <el-tab-pane label="产品线" name="productLine">
                  <permission-list
                    :data="productLineData"
                    :all-data="allProductLines"
                    :loading="loading.productLine"
                    @selection-change="handleProductLineSelection"
                  />
                </el-tab-pane>
                <el-tab-pane label="仓库" name="warehouse">
                  <permission-list
                    :data="warehouseData"
                    :all-data="allWarehouses"
                    :loading="loading.warehouse"
                    @selection-change="handleWarehouseSelection"
                  />
                </el-tab-pane>
                <el-tab-pane label="分支机构" name="branch">
                  <permission-list
                    :data="branchData"
                    :all-data="allBranches"
                    :loading="loading.branch"
                    @selection-change="handleBranchSelection"
                  />
                </el-tab-pane>
                <el-tab-pane label="部门" name="department">
                  <permission-list
                    :data="departmentData"
                    :all-data="allDepartments"
                    :loading="loading.department"
                    @selection-change="handleDepartmentSelection"
                  />
                </el-tab-pane>
                <el-tab-pane label="员工" name="employee">
                  <permission-list
                    :data="employeeData"
                    :all-data="allEmployees"
                    :loading="loading.employee"
                    @selection-change="handleEmployeeSelection"
                  />
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import PermissionList from './components/PermissionList.vue'

export default {
  name: 'DataPermissionManagement',
  components: {
    PermissionList
  },
  data() {
    return {
      // 主要标签页
      activeMainTab: 'permissionManagement',

      // 部门相关
      selectedDepartment: '',
      departmentOptions: [
        { id: 1, name: '销售-行三事业部' },
        { id: 2, name: '技术部' },
        { id: 3, name: '市场部' },
        { id: 4, name: '财务部' }
      ],

      // 权限范围
      permissionScope: 'specified',

      // 权限标签页
      activePermissionTab: 'employee',

      // 各类权限数据
      customerData: [],
      industryData: [],
      productTypeData: [],
      productLineData: [],
      warehouseData: [],
      branchData: [],
      departmentData: [],
      employeeData: [],

      // 所有可选数据
      allCustomers: [],
      allIndustries: [],
      allProductTypes: [],
      allProductLines: [],
      allWarehouses: [],
      allBranches: [],
      allDepartments: [],
      allEmployees: [],

      // 加载状态
      loading: {
        permissions: false,
        customer: false,
        industry: false,
        productType: false,
        productLine: false,
        warehouse: false,
        branch: false,
        department: false,
        employee: false
      },

      // 保存状态
      saving: false
    }
  },

  mounted() {
    this.loadMasterData()
  },

  methods: {
    // 加载主数据
    async loadMasterData() {
      // 这里应该调用API加载各类基础数据
      // 模拟数据
      this.allEmployees = [
        { id: 1, name: '翁小萍', code: 'WX001' },
        { id: 2, name: '玄林洁', code: 'XL002' },
        { id: 3, name: 'admin', code: 'ADM001' },
        { id: 4, name: 'system', code: 'SYS001' },
        { id: 5, name: '陈用威', code: 'CY001' },
        { id: 6, name: '张海燕', code: 'ZH001' },
        { id: 7, name: '李阳', code: 'LY001' },
        { id: 8, name: '王清清', code: 'WQ001' }
      ]

      this.allDepartments = [
        { id: 1, name: '销售部', code: 'SALES' },
        { id: 2, name: '技术部', code: 'TECH' },
        { id: 3, name: '市场部', code: 'MARKET' }
      ]

      // 其他数据类似...
    },

    // 部门变更处理
    handleDepartmentChange(deptId) {
      console.log('部门变更:', deptId)
      // 可以在这里根据部门加载不同的权限数据
    },

    // 权限范围变更处理
    handleScopeChange(scope) {
      console.log('权限范围变更:', scope)
      // 根据范围调整UI显示
    },

    // 加载权限
    async loadPermissions() {
      if (!this.selectedDepartment) {
        this.$message.warning('请先选择部门')
        return
      }

      this.loading.permissions = true
      try {
        // 调用API加载权限数据
        // 这里应该是实际的API调用
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 模拟加载的数据
        this.employeeData = [1, 2] // 翁小萍和玄林洁被选中

        this.$message.success('权限加载成功')
      } catch (error) {
        this.$message.error('权限加载失败')
      } finally {
        this.loading.permissions = false
      }
    },

    // 保存权限
    async savePermissions() {
      if (!this.selectedDepartment) {
        this.$message.warning('请先选择部门')
        return
      }

      this.saving = true
      try {
        // 准备保存的数据
        const saveData = {
          departmentId: this.selectedDepartment,
          scope: this.permissionScope,
          permissions: {
            customer: this.customerData,
            industry: this.industryData,
            productType: this.productTypeData,
            productLine: this.productLineData,
            warehouse: this.warehouseData,
            branch: this.branchData,
            department: this.departmentData,
            employee: this.employeeData
          }
        }

        // 调用API保存
        await new Promise(resolve => setTimeout(resolve, 1000))

        this.$message.success('权限保存成功')
      } catch (error) {
        this.$message.error('权限保存失败')
      } finally {
        this.saving = false
      }
    },

    // 各类选择变更处理
    handleCustomerSelection(selected) {
      this.customerData = selected
    },

    handleIndustrySelection(selected) {
      this.industryData = selected
    },

    handleProductTypeSelection(selected) {
      this.productTypeData = selected
    },

    handleProductLineSelection(selected) {
      this.productLineData = selected
    },

    handleWarehouseSelection(selected) {
      this.warehouseData = selected
    },

    handleBranchSelection(selected) {
      this.branchData = selected
    },

    handleDepartmentSelection(selected) {
      this.departmentData = selected
    },

    handleEmployeeSelection(selected) {
      this.employeeData = selected
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

.top-navigation {
  .main-tabs {
    ::v-deep .el-tabs__content {
      padding: 0;
    }

    .tab-content {
      min-height: 600px;
      padding: 20px;

      &.permission-management-content {
        padding: 0;
      }
    }
  }
}

.filter-section {
  padding: 20px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;

  .filter-row {
    display: flex;
    align-items: center;
    gap: 15px;
  }
}

.scope-selection {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #ebeef5;

  .scope-title {
    font-weight: 500;
    color: #303133;
    margin-bottom: 15px;
  }

  ::v-deep .el-radio-group {
    .el-radio {
      margin-right: 30px;
    }
  }
}

.permission-main {
  background: #fff;

  .permission-tabs {
    ::v-deep .el-tabs__content {
      padding: 20px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .data-permission-container {
    padding: 10px;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch !important;
    gap: 10px;
  }
}
</style>

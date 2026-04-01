<template>
  <div class="permission-panel">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="4" animated />
    </div>

    <!-- 权限配置内容 -->
    <div v-else class="permission-content">
      <!-- 权限范围选择 -->
      <div class="scope-selector">
        <el-radio-group v-model="localPermission.isAll" @change="handleScopeChange">
          <el-radio-button :label="true">全部数据</el-radio-button>
          <el-radio-button :label="false">指定数据</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 指定数据模式 -->
      <div v-if="!localPermission.isAll" class="specific-data-mode">
        <!-- 工具栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <el-checkbox
              v-model="selectAll"
              :indeterminate="isIndeterminate"
              @change="handleSelectAll"
            >
              全选
            </el-checkbox>

            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              :disabled="selectedIds.length === 0"
              @click="clearSelection"
            >
              清空选择
            </el-button>
          </div>

          <div class="toolbar-right">
            <el-input
              v-model="searchText"
              placeholder="搜索..."
              size="small"
              style="width: 200px;"
              clearable
              @input="handleSearch"
            >
              <i slot="prefix" class="el-input__icon el-icon-search" />
            </el-input>

            <el-tag size="small" type="info">
              已选 {{ selectedIds.length }}/{{ filteredData.length }}
            </el-tag>
          </div>
        </div>

        <!-- 数据列表 -->
        <div class="data-list">
          <div v-if="filteredData.length === 0" class="no-data">
            <el-empty description="暂无数据" :image-size="80" />
          </div>

          <el-checkbox-group
            v-else
            v-model="selectedIds"
            class="checkbox-grid"
            @change="handleSelectionChange"
          >
            <div
              v-for="item in filteredData"
              :key="getItemId(item)"
              class="data-item"
            >
              <el-checkbox :label="getItemId(item)" class="data-checkbox">
                <div class="item-content">
                  <div class="item-name">{{ getItemDisplayName(item) }}</div>
                  <div v-if="getItemDisplayCode(item)" class="item-code">
                    {{ getItemDisplayCode(item) }}
                  </div>
                </div>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </div>

      <!-- 全部数据模式 -->
      <div v-else class="all-data-mode">
        <el-alert
          title="已选择全部数据"
          type="success"
          description="当前配置为全部数据权限，用户可以访问该类型的所有数据"
          show-icon
          :closable="false"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PermissionPanel',
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
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      localPermission: {
        isAll: false,
        selectedIds: []
      },
      searchText: '',
      selectAll: false,
      isIndeterminate: false
    }
  },

  computed: {
    selectedIds: {
      get() {
        return this.localPermission.selectedIds
      },
      set(value) {
        this.localPermission.selectedIds = value
        this.emitDataChange()
      }
    },

    filteredData() {
      if (!this.searchText) {
        return this.allData
      }

      const searchText = this.searchText.toLowerCase()
      return this.allData.filter(item => {
        const displayName = this.getItemDisplayName(item).toLowerCase()
        const displayCode = (this.getItemDisplayCode(item) || '').toLowerCase()
        return displayName.includes(searchText) || displayCode.includes(searchText)
      })
    }
  },

  watch: {
    data: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          // 合并所有权限配置的selectedIds
          let allSelectedIds = []
          let isAll = false

          newVal.forEach((permission) => {
            if (permission && typeof permission === 'object') {
              if (permission.isAll) {
                isAll = true
              }
              if (permission.selectedIds && Array.isArray(permission.selectedIds)) {
                allSelectedIds = [...allSelectedIds, ...permission.selectedIds]
              }
            }
          })

          this.localPermission.isAll = isAll
          // 统一转换为数字类型并去重
          this.localPermission.selectedIds = [...new Set(allSelectedIds)].map(id => {
            const numId = typeof id === 'string' ? Number(id) : id
            return isNaN(numId) ? id : numId
          }).filter(id => id !== null && id !== undefined)
        } else {
          this.localPermission.isAll = false
          this.localPermission.selectedIds = []
        }
        this.updateSelectionState()
      }
    }
  },

  methods: {
    // 获取项的ID
    getItemId(item) {
      const id = item.id || item.userId || item.deptId || item.branchId ||
                 item.customerId || item.industryId || item.productTypeId ||
                 item.productLineId || item.warehouseId
      // 确保返回数字类型，与selectedIds中的类型一致
      const numId = typeof id === 'string' ? Number(id) : id
      return isNaN(numId) ? id : numId
    },

    // 获取显示名称
    getItemDisplayName(item) {
      return item.name ||
             item.deptName ||
             item.branchName ||
             item.userName ||
             item.realName ||
             item.loginName ||
             item.customerName ||
             item.industryName ||
             item.productTypeName ||
             item.productLineName ||
             item.warehouseName ||
             '未知'
    },

    // 获取显示编码
    getItemDisplayCode(item) {
      return item.code ||
             item.deptCode ||
             item.branchCode ||
             item.userCode ||
             item.customerCode ||
             ''
    },

    // 处理权限范围变更
    handleScopeChange(isAll) {
      if (isAll) {
        this.localPermission.selectedIds = []
      }
      this.emitDataChange()
    },

    // 处理全选
    handleSelectAll(checked) {
      if (checked) {
        this.selectedIds = this.filteredData.map(item => this.getItemId(item))
      } else {
        this.selectedIds = []
      }
      this.updateSelectionState()
    },

    // 清空选择
    clearSelection() {
      this.selectedIds = []
      this.updateSelectionState()
    },

    // 处理搜索
    handleSearch() {
      // 搜索已在computed中处理
    },

    // 处理选择变更
    handleSelectionChange() {
      this.updateSelectionState()
      this.emitDataChange()
    },

    // 更新选择状态
    updateSelectionState() {
      const selectedCount = this.selectedIds.length
      const totalCount = this.filteredData.length

      this.selectAll = selectedCount === totalCount && totalCount > 0
      this.isIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },

    // 发送数据变更事件
    emitDataChange() {
      const permissionData = []
      // 保留原有的id字段
      if (this.data && this.data.length > 0) {
        this.data.forEach(permission => {
          permissionData.push({
            id: permission.id,
            scopeType: this.scopeType,
            isAll: this.localPermission.isAll,
            selectedIds: this.localPermission.isAll ? [] : this.localPermission.selectedIds
          })
        })
      } else {
        permissionData.push({
          scopeType: this.scopeType,
          isAll: this.localPermission.isAll,
          selectedIds: this.localPermission.isAll ? [] : this.localPermission.selectedIds
        })
      }

      this.$emit('update:data', permissionData)
    }
  }
}
</script>

<style lang="scss" scoped>
.permission-panel {
  min-height: 400px;
}

.loading-state {
  padding: 20px;
}

.permission-content {
  .scope-selector {
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 6px;
  }

  .specific-data-mode {
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;

      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 15px;
      }
    }

    .data-list {
      min-height: 300px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      background: #fff;

      .no-data {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
      }

      .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 10px;
        padding: 15px;

        .data-item {
          .data-checkbox {
            width: 100%;
            padding: 10px;
            border-radius: 4px;
            transition: all 0.3s;

            &:hover {
              background-color: #f5f7fa;
            }

            ::v-deep .el-checkbox__label {
              width: 100%;
              padding-left: 8px;
            }

            .item-content {
              .item-name {
                font-weight: 500;
                color: #303133;
                margin-bottom: 2px;
              }

              .item-code {
                font-size: 12px;
                color: #909399;
              }
            }
          }
        }
      }
    }
  }

  .all-data-mode {
    padding: 20px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .permission-content {
    .specific-data-mode {
      .toolbar {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;

        .toolbar-left,
        .toolbar-right {
          justify-content: center;
        }
      }

      .checkbox-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>

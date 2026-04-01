<template>
  <div class="permission-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 权限列表内容 -->
    <div v-else class="list-content">
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
            已选 {{ selectedCount }}/{{ filteredData.length }}
          </el-tag>
        </div>
      </div>

      <!-- 数据列表网格 -->
      <div class="data-grid">
        <div v-if="filteredData.length === 0" class="no-data">
          <el-empty description="暂无数据" :image-size="80" />
        </div>

        <div v-else class="grid-container">
          <div
            v-for="item in filteredData"
            :key="item.id"
            class="grid-item"
            :class="{ 'selected': isSelected(item.id) }"
          >
            <el-checkbox
              :value="isSelected(item.id)"
              class="item-checkbox"
              @change="toggleSelection(item.id)"
            >
              <div class="item-content">
                <div class="item-name">{{ item.name }}</div>
                <div v-if="item.code" class="item-code">{{ item.code }}</div>
              </div>
            </el-checkbox>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PermissionList',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    allData: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      searchText: '',
      selectAll: false,
      isIndeterminate: false,
      localSelected: []
    }
  },

  computed: {
    filteredData() {
      if (!this.searchText) {
        return this.allData
      }

      const searchText = this.searchText.toLowerCase()
      return this.allData.filter(item => {
        const name = (item.name || '').toLowerCase()
        const code = (item.code || '').toLowerCase()
        return name.includes(searchText) || code.includes(searchText)
      })
    },

    selectedCount() {
      return this.localSelected.length
    }
  },

  watch: {
    data: {
      immediate: true,
      handler(newVal) {
        this.localSelected = [...newVal]
        this.updateSelectionState()
      }
    }
  },

  methods: {
    // 检查是否选中
    isSelected(id) {
      return this.localSelected.includes(id)
    },

    // 切换选择状态
    toggleSelection(id) {
      const index = this.localSelected.indexOf(id)
      if (index > -1) {
        this.localSelected.splice(index, 1)
      } else {
        this.localSelected.push(id)
      }
      this.updateSelectionState()
      this.emitSelectionChange()
    },

    // 全选处理
    handleSelectAll(checked) {
      if (checked) {
        this.localSelected = this.filteredData.map(item => item.id)
      } else {
        this.localSelected = []
      }
      this.updateSelectionState()
      this.emitSelectionChange()
    },

    // 搜索处理
    handleSearch() {
      // 搜索逻辑已在computed中处理
      this.updateSelectionState()
    },

    // 更新选择状态
    updateSelectionState() {
      const selectedCount = this.localSelected.length
      const totalCount = this.filteredData.length

      this.selectAll = selectedCount === totalCount && totalCount > 0
      this.isIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },

    // 发送选择变更事件
    emitSelectionChange() {
      this.$emit('selection-change', [...this.localSelected])
    }
  }
}
</script>

<style lang="scss" scoped>
.permission-list {
  min-height: 400px;
}

.loading-state {
  padding: 20px;
}

.list-content {
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
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 15px;
    }
  }

  .data-grid {
    .no-data {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
    }

    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      padding: 10px;

      .grid-item {
        background: #fff;
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        padding: 12px;
        transition: all 0.3s ease;

        &:hover {
          border-color: #409eff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
        }

        &.selected {
          border-color: #409eff;
          background-color: #ecf5ff;

          .item-name {
            color: #409eff;
            font-weight: 500;
          }
        }

        .item-checkbox {
          width: 100%;

          ::v-deep .el-checkbox__label {
            width: 100%;
            padding-left: 8px;
          }

          .item-content {
            .item-name {
              font-size: 14px;
              color: #303133;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
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

// 响应式设计
@media (max-width: 768px) {
  .list-content {
    .toolbar {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;

      .toolbar-left,
      .toolbar-right {
        justify-content: center;
      }
    }

    .grid-container {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }
  }
}
</style>

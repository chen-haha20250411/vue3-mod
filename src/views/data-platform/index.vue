<template>
  <div class="data-platform-container">

    <el-card class="data-platform-card">
      <template #header>
        <div class="card-header">
          <span>销售数据总览</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="销售数据" name="sales">
          <SalesOverview />
        </el-tab-pane>
        <el-tab-pane label="增值业务" name="valueAdded">
          <ValueAddedBusiness />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import SalesOverview from './components/SalesOverview.vue'
import ValueAddedBusiness from './components/ValueAddedBusiness.vue'

export default {
  name: 'DataPlatform',
  components: {
    SalesOverview,
    ValueAddedBusiness
  },
  data() {
    return {
      activeTab: 'sales'
    }
  }
}
</script>

<style lang="scss" scoped>
.data-platform-container {
  padding: 24px;
  background: linear-gradient(180deg, #f5f7fa 0%, #fafbfc 100%);
  min-height: calc(100vh - 84px);
}

.data-platform-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;

  :deep(.el-card__header) {
    padding: 20px 24px;
    background: #fff;
    border-bottom: 1px solid #f0f2f7;
  }
}

.page-header {
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;

  h1 {
    margin: 0 0 10px 0;
    font-size: 24px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 17px;
    font-weight: 600;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 10px;

    &::before {
      content: '';
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, #667eea, #764ba2);
      border-radius: 2px;
    }
  }
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
  color: #909399;
  padding: 0 24px;
  height: 48px;
  line-height: 48px;

  &.is-active {
    color: #667eea;
    font-weight: 600;
  }

  &:hover {
    color: #667eea;
  }
}

:deep(.el-tabs__active-bar) {
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px 3px 0 0;
}

:deep(.el-tabs__content) {
  padding: 24px;
}
</style>

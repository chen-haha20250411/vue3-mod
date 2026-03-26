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
  padding: 20px;
  background-color: rgb(240, 242, 245);
  min-height: calc(100vh - 84px);
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
    font-size: 18px;
    font-weight: 600;
  }
}

:deep(.el-tabs__content) {
  padding-top: 10px;
}
</style>

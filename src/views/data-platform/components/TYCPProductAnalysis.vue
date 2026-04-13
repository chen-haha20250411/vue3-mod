<template>
  <div class="tycp-product-analysis">
    <div class="filter-bar">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">时间范围：</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">采购人员：</span>
          <el-input
            v-model="purchaseMan"
            placeholder="全部采购人员"
            size="small"
            style="width: 200px;"
            @input="handlePurchaseManChange"
          />
        </div>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="product-tabs">
      <div class="kpi-cards">
        <el-card class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-label">台机</div>
            <div class="kpi-value main-value">{{ formatCurrency(desktopKpiData.assessmentCompletionQuantity) }}万</div>
            <div class="kpi-divider" />
            <div class="kpi-details">
              <div class="detail-row">
                <span class="detail-label">实际采购量：</span>
                <span class="detail-value">{{ formatCurrency(desktopKpiData.actualPurchaseQuantity) }}万</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">考核目标：</span>
                <span class="detail-value">{{ formatCurrency(desktopKpiData.assessmentTarget) }}万</span>
              </div>
              <div class="detail-row" :class="desktopKpiData.completionRate >= 100 ? 'positive' : 'negative'">
                <span class="detail-label">考核完成率：</span>
                <span class="detail-value">{{ desktopKpiData.completionRate.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
        <el-card class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-label">笔记本</div>
            <div class="kpi-value main-value">{{ formatCurrency(notebookKpiData.assessmentCompletionQuantity) }}万</div>
            <div class="kpi-divider" />
            <div class="kpi-details">
              <div class="detail-row">
                <span class="detail-label">实际采购量：</span>
                <span class="detail-value">{{ formatCurrency(notebookKpiData.actualPurchaseQuantity) }}万</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">考核目标：</span>
                <span class="detail-value">{{ formatCurrency(notebookKpiData.assessmentTarget) }}万</span>
              </div>
              <div class="detail-row" :class="notebookKpiData.completionRate >= 100 ? 'positive' : 'negative'">
                <span class="detail-label">考核完成率：</span>
                <span class="detail-value">{{ notebookKpiData.completionRate.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
        <el-card class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-label">外设</div>
            <div class="kpi-value main-value">{{ formatCurrency(peripheralKpiData.assessmentCompletionQuantity) }}万</div>
            <div class="kpi-divider" />
            <div class="kpi-details">
              <div class="detail-row">
                <span class="detail-label">实际采购量：</span>
                <span class="detail-value">{{ formatCurrency(peripheralKpiData.actualPurchaseQuantity) }}万</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">考核目标：</span>
                <span class="detail-value">{{ formatCurrency(peripheralKpiData.assessmentTarget) }}万</span>
              </div>
              <div class="detail-row" :class="peripheralKpiData.completionRate >= 100 ? 'positive' : 'negative'">
                <span class="detail-label">考核完成率：</span>
                <span class="detail-value">{{ peripheralKpiData.completionRate.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
        <el-card class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-label">汇总</div>
            <div class="kpi-value main-value">{{ formatCurrency(totalKpiData.assessmentCompletionQuantity) }}万</div>
            <div class="kpi-divider" />
            <div class="kpi-details">
              <div class="detail-row">
                <span class="detail-label">实际采购量：</span>
                <span class="detail-value">{{ formatCurrency(totalKpiData.actualPurchaseQuantity) }}万</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">考核目标：</span>
                <span class="detail-value">{{ formatCurrency(totalKpiData.assessmentTarget) }}万</span>
              </div>
              <div class="detail-row" :class="totalKpiData.completionRate >= 100 ? 'positive' : 'negative'">
                <span class="detail-label">考核完成率：</span>
                <span class="detail-value">{{ totalKpiData.completionRate.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </el-tabs>

    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <div class="card-title">明细数据</div>
          <el-button type="primary" size="small" @click="handleExport">
            导出 Excel
          </el-button>
        </div>
      </template>
      <el-table
        v-loading="listLoading"
        :data="paginatedData"
        border
        stripe
        style="width:100%;"
      >
        <el-table-column prop="group" label="小组" width="120" />
        <el-table-column prop="configProduct" label="配置表产品" min-width="200" />
        <el-table-column prop="actualPurchaseQuantity" label="实际采购量(万)" width="120" align="right">
          <template #default="scope">
            <span style="color: #409eff; font-weight: bold;">{{ formatCurrency(scope.row.actualPurchaseQuantity) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="assessmentPurchaseQuantity" label="考核采购量(万)" width="120" align="right">
          <template #default="scope">
            <span style="color: #67c23a; font-weight: bold;">{{ formatCurrency(scope.row.assessmentPurchaseQuantity) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="assessmentTarget" label="考核目标(万)" width="120" align="right">
          <template #default="scope">
            <span style="color: #909399;">{{ formatCurrency(scope.row.assessmentTarget) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="completionRate" label="考核完成率" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getCompletionRateType(scope.row.completionRate)" size="small">
              {{ scope.row.completionRate.toFixed(1) }}%
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="showPagination" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredData.length"
          layout="total, prev, pager, next"
          background
        />
      </div>

      <div v-if="showNoData" class="no-data-tip">
        <el-empty description="暂无数据" />
      </div>
    </el-card>
  </div>
</template>

<script>
import { getProductPurchaseReportforTYCP } from '@/api/dataPlatform'
import { isAdmin, getCurrentUserName, getDataPermissions, getDataPermissionValues } from '@/utils/permission'
export default {
  name: 'TYCPProductAnalysis',
  data() {
    return {
      dateRange: [],
      purchaseMan: '',
      listLoading: false,
      rawData: [],
      filteredData: [],
      currentPage: 1,
      pageSize: 25,
      activeTab: 'desktop',
      desktopKpiData: {
        actualPurchaseQuantity: 0,
        assessmentCompletionQuantity: 0,
        assessmentTarget: 0,
        completionRate: 0
      },
      notebookKpiData: {
        actualPurchaseQuantity: 0,
        assessmentCompletionQuantity: 0,
        assessmentTarget: 0,
        completionRate: 0
      },
      peripheralKpiData: {
        actualPurchaseQuantity: 0,
        assessmentCompletionQuantity: 0,
        assessmentTarget: 0,
        completionRate: 0
      },
      totalKpiData: {
        actualPurchaseQuantity: 0,
        assessmentCompletionQuantity: 0,
        assessmentTarget: 0,
        completionRate: 0
      }
    }
  },
  computed: {
    hasData() {
      return this.filteredData.length > 0
    },
    showPagination() {
      return this.hasData && !this.listLoading && this.filteredData.length > this.pageSize
    },
    showNoData() {
      return !this.hasData && !this.listLoading
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredData.slice(start, end)
    },
    currentTabData() {
      return this.filteredData
    }
  },
  watch: {
    activeTab() {
      this.currentPage = 1
      this.updateKPI()
    }
  },
  mounted() {
    this.initDateRange()
    this.fetchData()
  },
  methods: {
    initDateRange() {
      const startDate = new Date().getFullYear() + '-01-01'
      const endDate = new Date().toISOString().substring(0, 10)
      this.dateRange = [startDate, endDate]
    },
    formatCurrency(value) {
      if (value == null || isNaN(value)) return '0'
      const wan = value / 10000
      return wan.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    },

    async fetchData() {
      this.listLoading = true
      const [startDate, endDate] = this.dateRange || []

      const params = {
        startDate,
        endDate,
        purchaseMan: this.purchaseMan,
        statDimension: '小组'
      }

      try {
        const response = await getProductPurchaseReportforTYCP(params)
        this.rawData = this.extractDataArray(response)
        this.applyFilters()
      } catch (error) {
        console.error('获取TYCP采购数据失败:', error)
      } finally {
        this.listLoading = false
      }
    },

    extractDataArray(response) {
      if (!response) return []
      if (response.list && Array.isArray(response.list)) {
        return response.list
      }
      if (response.data && response.data.list && Array.isArray(response.data.list)) {
        return response.data.list
      }
      if (Array.isArray(response)) return response
      if (response.data && Array.isArray(response.data)) return response.data
      return []
    },

    applyFilters() {
      this.currentPage = 1
      this.filteredData = this.processTableData()
      this.updateKPI()
    },

    processTableData() {
      const processedData = []
      const seen = new Map()

      this.rawData.forEach(item => {
        const group = item['小组'] || item['group'] || ''
        const productType = item['产品类型'] || item['productType'] || ''
        const configProduct = item['配置表产品'] || item['configProduct'] || ''
        const actualPurchaseQuantity = parseFloat(item['实际采购量'] || item['actualPurchaseQuantity'] || 0)
        const assessmentPurchaseQuantity = parseFloat(item['考核采购量'] || item['assessmentPurchaseQuantity'] || 0)
        const assessmentTarget = parseFloat(item['考核目标'] || item['assessmentTarget'] || 0)
        const completionRate = parseFloat(item['考核完成率'] || item['completionRate'] || 0)

        const key = `${group}-${configProduct}`
        if (!seen.has(key)) {
          seen.set(key, {
            group,
            productType,
            configProduct,
            actualPurchaseQuantity,
            assessmentPurchaseQuantity,
            assessmentTarget,
            completionRate: completionRate || (assessmentTarget > 0 ? (assessmentPurchaseQuantity / assessmentTarget) * 100 : 0)
          })
        } else {
          const existing = seen.get(key)
          existing.actualPurchaseQuantity += actualPurchaseQuantity
          existing.assessmentPurchaseQuantity += assessmentPurchaseQuantity
          existing.assessmentTarget += assessmentTarget
          existing.completionRate = existing.completionRate || (existing.assessmentTarget > 0 ? (existing.assessmentPurchaseQuantity / existing.assessmentTarget) * 100 : 0)
        }
      })

      return Array.from(seen.values())
    },

    handleDateRangeChange() {
      this.fetchData()
    },

    handlePurchaseManChange() {
      this.fetchData()
    },

    updateKPI() {
      const calculateDesktopKPI = () => {
        const data = this.filteredData.filter(item => item.group === '台机')
        const actualPurchaseQuantity = data.reduce((sum, item) => sum + item.actualPurchaseQuantity, 0)
        const assessmentCompletionQuantity = data.reduce((sum, item) => sum + item.assessmentPurchaseQuantity, 0)
        const assessmentTarget = data.reduce((sum, item) => sum + item.assessmentTarget, 0)
        const completionRate = assessmentTarget > 0 ? (assessmentCompletionQuantity / assessmentTarget) * 100 : 0

        return {
          actualPurchaseQuantity,
          assessmentCompletionQuantity,
          assessmentTarget,
          completionRate
        }
      }

      const calculateNotebookKPI = () => {
        const data = this.filteredData.filter(item => item.group === '笔记本')
        const actualPurchaseQuantity = data.reduce((sum, item) => sum + item.actualPurchaseQuantity, 0)
        const assessmentCompletionQuantity = data.reduce((sum, item) => sum + item.assessmentPurchaseQuantity, 0)
        const assessmentTarget = data.reduce((sum, item) => sum + item.assessmentTarget, 0)
        const completionRate = assessmentTarget > 0 ? (assessmentCompletionQuantity / assessmentTarget) * 100 : 0

        return {
          actualPurchaseQuantity,
          assessmentCompletionQuantity,
          assessmentTarget,
          completionRate
        }
      }

      const calculatePeripheralKPI = () => {
        const data = this.filteredData.filter(item => item.group === '外设')
        const actualPurchaseQuantity = data.reduce((sum, item) => sum + item.actualPurchaseQuantity, 0)
        const assessmentCompletionQuantity = data.reduce((sum, item) => sum + item.assessmentPurchaseQuantity, 0)
        const assessmentTarget = data.reduce((sum, item) => sum + item.assessmentTarget, 0)
        const completionRate = assessmentTarget > 0 ? (assessmentCompletionQuantity / assessmentTarget) * 100 : 0

        return {
          actualPurchaseQuantity,
          assessmentCompletionQuantity,
          assessmentTarget,
          completionRate
        }
      }

      const calculateTotalKPI = () => {
        const actualPurchaseQuantity = this.filteredData.reduce((sum, item) => sum + item.actualPurchaseQuantity, 0)
        const assessmentCompletionQuantity = this.filteredData.reduce((sum, item) => sum + item.assessmentPurchaseQuantity, 0)
        const assessmentTarget = this.filteredData.reduce((sum, item) => sum + item.assessmentTarget, 0)
        const completionRate = assessmentTarget > 0 ? (assessmentCompletionQuantity / assessmentTarget) * 100 : 0

        return {
          actualPurchaseQuantity,
          assessmentCompletionQuantity,
          assessmentTarget,
          completionRate
        }
      }

      this.desktopKpiData = calculateDesktopKPI()
      this.notebookKpiData = calculateNotebookKPI()
      this.peripheralKpiData = calculatePeripheralKPI()
      this.totalKpiData = calculateTotalKPI()
    },

    getCompletionRateType(rate) {
      if (rate >= 100) return 'success'
      if (rate >= 80) return 'primary'
      if (rate >= 50) return 'warning'
      return 'danger'
    },

    handleExport() {
      const headers = ['小组', '配置表产品', '实际采购量', '考核采购量', '考核目标', '考核完成率(%)']
      const rows = this.filteredData.map(item => [
        item.group,
        item.configProduct,
        item.actualPurchaseQuantity.toFixed(0),
        item.assessmentPurchaseQuantity.toFixed(0),
        item.assessmentTarget.toFixed(0),
        item.completionRate.toFixed(2)
      ])

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `TYCP产品采购业绩_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
    },

    formatNumber(value) {
      if (value == null || isNaN(value)) return '0'
      return Math.round(value).toLocaleString('zh-CN')
    }
  }
}
</script>

<style lang="scss" scoped>
.tycp-product-analysis {
  padding: 15px;
  background-color: rgb(240, 242, 245);
  min-height: calc(100vh - 84px);
}

.filter-bar {
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,.08);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
  flex-shrink: 0;
}

.product-tabs {
  margin-bottom: 15px;
}

.kpi-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.kpi-card {
  text-align: left;
}

.kpi-content {
  padding: 15px;
}

.kpi-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;

  &.positive {
    color: #67c23a;
  }

  &.negative {
    color: #f56c6c;
  }

  &.main-value {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
  }
}

.kpi-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 12px 0;
}

.kpi-details {
  margin-top: 8px;

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 6px 0;
    font-size: 13px;

    .detail-label {
      color: #606266;
    }

    .detail-value {
      font-weight: 600;
      color: #303133;
    }

    &.positive {
      .detail-value {
        color: #67c23a;
      }
    }

    &.negative {
      .detail-value {
        color: #f56c6c;
      }
    }
  }
}

.table-card {
  background: #fff;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-data-tip {
  padding: 40px 0;
  text-align: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-card__header) {
  padding: 12px 15px;
}

:deep(.el-card__body) {
  padding: 15px;
}

@media (max-width: 1200px) {
  .kpi-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .kpi-cards {
    grid-template-columns: 1fr;
  }
}
</style>

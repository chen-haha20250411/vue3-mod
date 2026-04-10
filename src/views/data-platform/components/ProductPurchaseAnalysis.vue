<template>
  <div class="product-purchase-analysis">
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
        <div v-if="staffList.length > 0" class="filter-item">
          <span class="filter-label">业务员：</span>
          <el-select
            v-model="selectedStaffs"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="全部业务员"
            size="small"
            style="width: 200px;"
            @change="handleStaffChange"
          >
            <el-option
              v-for="staff in staffList"
              :key="staff"
              :label="staff"
              :value="staff"
            />
          </el-select>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeGroup" class="group-tabs">
      <div class="kpi-cards">
        <el-card class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-label">整体采购额</div>
            <div class="kpi-value">{{ formatCurrency(serverKpiData.overallAmount) }}万</div>
            <div class="kpi-details">
              <div class="detail-row">
                <span class="detail-label">整体目标采购额：</span>
                <span class="detail-value">{{ formatCurrency(serverKpiData.overallTargetAmount) }}万</span>
              </div>
              <div class="detail-row" :class="serverKpiData.overallCompletionRate >= 100 ? 'positive' : 'negative'">
                <span class="detail-label">整体完成率：</span>
                <span class="detail-value">{{ serverKpiData.overallCompletionRate.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
        <el-card class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-label">网络安全组主要产品总采购额</div>
            <div class="kpi-value purchase-value">{{ formatCurrency(serverKpiData.securityMainProductAmount) }}万</div>
            <div class="kpi-details">
              <div class="detail-row">
                <span class="detail-label">主要产品目标采购额：</span>
                <span class="detail-value">{{ formatCurrency(serverKpiData.securityMainProductTargetAmount) }}万</span>
              </div>
              <div class="detail-row" :class="serverKpiData.securityMainProductCompletionRate >= 100 ? 'positive' : 'negative'">
                <span class="detail-label">主要产品完成率：</span>
                <span class="detail-value">{{ serverKpiData.securityMainProductCompletionRate.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
        <el-card class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-label">服务器组主要产品总采购额</div>
            <div class="kpi-value server-main-value">{{ formatCurrency(serverKpiData.serverMainProductAmount) }}万</div>
            <div class="kpi-details">
              <div class="detail-row">
                <span class="detail-label">主要产品目标采购额：</span>
                <span class="detail-value">{{ formatCurrency(serverKpiData.serverMainProductTargetAmount) }}万</span>
              </div>
              <div class="detail-row" :class="serverKpiData.serverMainProductCompletionRate >= 100 ? 'positive' : 'negative'">
                <span class="detail-label">主要产品完成率：</span>
                <span class="detail-value">{{ serverKpiData.serverMainProductCompletionRate.toFixed(1) }}%</span>
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
        style="width: 100%;"
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="productGroup" label="产品组" width="150" />
        <el-table-column prop="pType" label="考核大类" width="600" />
        <el-table-column prop="actualCompletion" label="实际完成量" width="140" align="right" sortable>
          <template #default="scope">
            <span style="color: #409eff; font-weight: bold;">{{ formatCurrency(scope.row.actualCompletion) }}万</span>
          </template>
        </el-table-column>
        <el-table-column prop="yearlyTarget" label="全年采购任务量" width="160" align="right">
          <template #default="scope">
            <span style="color: #909399;">{{ formatCurrency(scope.row.yearlyTarget) }}万</span>
          </template>
        </el-table-column>
        <el-table-column prop="completionRate" label="完成率" width="120" sortable align="center">
          <template #default="scope">
            <el-tag :type="getCompletionRateType(scope.row.completionRate)" size="small">
              {{ scope.row.completionRate.toFixed(2) }}%
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
import * as echarts from 'echarts'
import { getProductPurchaseReport } from '@/api/dataPlatform'
import { isAdmin, getCurrentUserName, getDataPermissions, getDataPermissionValues } from '@/utils/permission'
import { getAssessmentTargets } from '@/api/enterprise/user'

export default {
  name: 'ProductPurchaseAnalysis',
  data() {
    return {
      dateRange: [],
      selectedStaffs: [],
      staffList: [],
      listLoading: false,
      rawData: [],
      filteredData: [],
      currentPage: 1,
      pageSize: 25,
      activeGroup: 'server',
      salesmanChart: null,
      categoryChart: null,
      serverKpiData: {
        overallAmount: 0,
        overallTargetAmount: 0,
        overallCompletionRate: 0,
        securityMainProductAmount: 0,
        securityMainProductTargetAmount: 0,
        securityMainProductCompletionRate: 0,
        serverMainProductAmount: 0,
        serverMainProductTargetAmount: 0,
        serverMainProductCompletionRate: 0
      },
      securityKpiData: {
        overallAmount: 0,
        overallTargetAmount: 0,
        overallCompletionRate: 0,
        securityMainProductAmount: 0,
        securityMainProductTargetAmount: 0,
        securityMainProductCompletionRate: 0,
        serverMainProductAmount: 0,
        serverMainProductTargetAmount: 0,
        serverMainProductCompletionRate: 0
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
    currentGroupData() {
      const groupField = this.activeGroup === 'server' ? '服务器与存储组' : '网络安全组'
      return this.filteredData.filter(item => item.productGroup === groupField)
    }
  },
  watch: {
    activeGroup() {
      this.currentPage = 1
      this.updateKPI()
      this.updateCharts()
    }
  },
  mounted() {
    this.initDateRange()
    this.$nextTick(() => {
      this.initCharts()
      this.fetchData()
    })
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    this.disposeCharts()
  },
  methods: {
    initDateRange() {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      const currentDay = new Date().getDate()
      const startDate = `${currentYear}-01-01`
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`
      this.dateRange = [startDate, endDate]
    },

    async fetchData() {
      this.listLoading = true
      const currentUserName = getCurrentUserName()
      const admin = isAdmin()
      const employeePermValues = getDataPermissionValues('EMPLOYEE')
      let employeeName = ''

      if (employeePermValues.includes('ALL')) {
        try {
          const res = await getAssessmentTargets()
          const data = res.data || res
          const targets = data.list || data.items || (Array.isArray(data) ? data : [])
          employeeName = targets.map(item => item.realName || item.name || item.loginName).filter(n => n).join(',')
        } catch (err) {
          console.error('获取考核对象列表失败:', err)
          employeeName = ''
        }
      } else {
        const dataPermissions = getDataPermissions()
        for (let i = 0; i < dataPermissions.length; i++) {
          const dataPerm = dataPermissions[i]
          if (dataPerm.permissions && Array.isArray(dataPerm.permissions)) {
            for (let j = 0; j < dataPerm.permissions.length; j++) {
              const perm = dataPerm.permissions[j]
              if (perm.permissionType && perm.permissionType.toLowerCase() === 'employee') {
                employeeName = perm.permissionName || ''
                break
              }
            }
            if (employeeName) break
          }
          if (dataPerm.permissionType && dataPerm.permissionType.toLowerCase() === 'employee') {
            employeeName = dataPerm.permissionName || ''
            break
          }
        }
      }

      let personName = '陈凤翔,刘心洁'

      if (!admin) {
        personName = employeeName || currentUserName
      }

      if (this.selectedStaffs && this.selectedStaffs.length > 0) {
        personName = this.selectedStaffs.join(',')
      }
      const [startDate, endDate] = this.dateRange || []
      const params = {
        startDate,
        endDate,
        personName
      }

      try {
        const response = await getProductPurchaseReport(params)
        this.rawData = this.extractDataArray(response)
        this.staffList = employeeName ? employeeName.split(',').map(n => n.trim()).filter(n => n) : []
        this.applyFilters()
      } catch (error) {
        console.error('获取采购数据失败:', error)
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
      this.updateCharts()
    },

    processTableData() {
      const seen = new Map()
      console.log('后端返回数据', this.rawData)
      this.rawData.forEach(item => {
        const productGroup = item['GroupName'] || ''
        const pType = item['P_type'] || ''
        const actualCompletion = parseFloat(item['实际完成量'] || 0)
        const yearlyTarget = parseFloat(item['全年采购任务量'] || 0)

        // 按 P_type 和 productGroup 汇总
        const key = `${pType}-${productGroup}`
        if (!seen.has(key)) {
          seen.set(key, {
            productGroup,
            pType,
            actualCompletion,
            yearlyTarget,
            completionRate: yearlyTarget > 0 ? (actualCompletion / yearlyTarget) * 100 : 0,
            isYearly: pType.includes('全年')
          })
        } else {
          const existing = seen.get(key)
          existing.actualCompletion += actualCompletion
          existing.yearlyTarget = yearlyTarget
          existing.isYearly = pType.includes('全年')
          // 重新计算完成率
          existing.completionRate = existing.yearlyTarget > 0
            ? (existing.actualCompletion / existing.yearlyTarget) * 100
            : 0
        }
      })

      // 按 groupName 排序，p_type 含有'全年'字样的放在该 groupName 的末尾
      return Array.from(seen.values()).sort((a, b) => {
        if (a.productGroup !== b.productGroup) {
          return a.productGroup.localeCompare(b.productGroup)
        }
        if (a.isYearly !== b.isYearly) {
          return a.isYearly ? 1 : -1
        }
        return b.actualCompletion - a.actualCompletion
      })
    },

    handleDateRangeChange() {
      this.fetchData()
    },

    handleStaffChange() {
      this.fetchData()
    },

    handleResize() {
      this.salesmanChart?.resize()
      this.categoryChart?.resize()
    },

    updateKPI() {
      // 整体采购额：p_type 包含'全年任务'字样的数据汇总
      const overallData = this.filteredData.filter(item =>
        item.pType && item.pType.includes('全年任务')
      )
      const overallAmount = overallData.reduce((sum, item) => sum + item.actualCompletion, 0)
      const overallTargetAmount = overallData.reduce((sum, item) => sum + item.yearlyTarget, 0)
      const overallCompletionRate = overallData.length > 0 ? (overallAmount / overallTargetAmount) * 100 : 0

      // 网络安全组主要产品：GroupName='网络安全组'，并且 p_type 不包含'全年任务'字样的数据汇总
      const securityMainData = this.filteredData.filter(item =>
        item.productGroup === '网络安全组' && (!item.pType || !item.pType.includes('全年任务'))
      )
      const securityMainProductAmount = securityMainData.reduce((sum, item) => sum + item.actualCompletion, 0)
      const securityMainProductTargetAmount = securityMainData.reduce((sum, item) => sum + item.yearlyTarget, 0)
      const securityMainProductCompletionRate = securityMainProductTargetAmount > 0
        ? (securityMainProductAmount / securityMainProductTargetAmount) * 100
        : 0

      // 服务器组主要产品：GroupName='服务器与存储组'，并且 p_type 不包含'全年任务'字样的数据汇总
      const serverMainData = this.filteredData.filter(item =>
        item.productGroup === '服务器与存储组' && (!item.pType || !item.pType.includes('全年任务'))
      )
      const serverMainProductAmount = serverMainData.reduce((sum, item) => sum + item.actualCompletion, 0)
      const serverMainProductTargetAmount = serverMainData.reduce((sum, item) => sum + item.yearlyTarget, 0)
      const serverMainProductCompletionRate = serverMainProductTargetAmount > 0 ? (serverMainProductAmount / serverMainProductTargetAmount) * 100 : 0

      this.serverKpiData = {
        overallAmount,
        overallTargetAmount,
        overallCompletionRate,
        securityMainProductAmount,
        securityMainProductTargetAmount,
        securityMainProductCompletionRate,
        serverMainProductAmount,
        serverMainProductTargetAmount,
        serverMainProductCompletionRate
      }

      this.securityKpiData = {
        overallAmount,
        overallTargetAmount,
        overallCompletionRate,
        securityMainProductAmount,
        securityMainProductTargetAmount,
        securityMainProductCompletionRate,
        serverMainProductAmount,
        serverMainProductTargetAmount,
        serverMainProductCompletionRate
      }
    },

    getCompletionRateType(rate) {
      if (rate >= 100) return 'success'
      if (rate >= 80) return 'primary'
      if (rate >= 50) return 'warning'
      return 'danger'
    },

    initCharts() {
      if (this.$refs.salesmanChartRef) {
        this.salesmanChart = echarts.init(this.$refs.salesmanChartRef)
      }
      if (this.$refs.categoryChartRef) {
        this.categoryChart = echarts.init(this.$refs.categoryChartRef)
      }
    },

    disposeCharts() {
      this.salesmanChart?.dispose()
      this.categoryChart?.dispose()
    },

    updateCharts() {
      this.updateSalesmanChart()
      this.updateCategoryChart()
    },

    updateSalesmanChart() {
      if (!this.salesmanChart) return

      const data = this.currentGroupData
      if (!data || data.length === 0) {
        this.salesmanChart.clear()
        return
      }

      const salesmanMap = new Map()
      data.forEach(item => {
        const salesman = item.salesman || '未知'
        // 使用实际完成量_万作为采购金额
        const amount = item.actualCompletion || item.purchaseAmount || 0
        salesmanMap.set(salesman, (salesmanMap.get(salesman) || 0) + amount)
      })

      const chartData = Array.from(salesmanMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            return `${params.name}: ${this.formatWan(params.value)}万`
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle'
        },
        series: [
          {
            name: '业务员分布',
            type: 'pie',
            radius: '60%',
            center: ['60%', '50%'],
            data: chartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: (params) => {
                return `${params.name}: ${this.formatWan(params.value)}万`
              }
            }
          }
        ]
      }

      this.salesmanChart.setOption(option)
    },

    updateCategoryChart() {
      if (!this.categoryChart) return

      const data = this.currentGroupData
      if (!data || data.length === 0) {
        this.categoryChart.clear()
        return
      }

      const categoryMap = new Map()
      data.forEach(item => {
        // 使用 P_type 作为货品大类
        const category = item.pType || item.productCategory || '未知'
        // 使用实际完成量_万作为采购金额
        const amount = item.actualCompletion || item.purchaseAmount || 0
        categoryMap.set(category, (categoryMap.get(category) || 0) + amount)
      })

      const chartData = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            return `${params.name}: ${this.formatWan(params.value)}万`
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle'
        },
        series: [
          {
            name: '货品大类分布',
            type: 'pie',
            radius: '60%',
            center: ['60%', '50%'],
            data: chartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: (params) => {
                return `${params.name}: ${this.formatWan(params.value)}万`
              }
            }
          }
        ]
      }

      this.categoryChart.setOption(option)
    },

    handleExport() {
      const headers = ['业务员', '产品组', '货品大类', '实际完成量(万)', '全年采购任务量(万)', '完成率(%)']
      const rows = this.filteredData.map(item => [
        item.salesman,
        item.productGroup,
        item.pType || item.productCategory,
        item.actualCompletion.toFixed(1),
        item.yearlyTarget.toFixed(1),
        item.completionRate.toFixed(2)
      ])

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `系统产品采购业绩_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
    },

    formatWan(value) {
      if (value == null || isNaN(value)) return '0'
      return Math.round(value / 10000).toLocaleString('zh-CN')
    },

    formatCurrency(value) {
      if (value == null || isNaN(value)) return '0'
      const wan = value / 10000
      return wan.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    },

    formatNumber(value) {
      if (value == null || isNaN(value)) return '0'
      return Math.round(value).toLocaleString('zh-CN')
    },

    tableRowClassName({ row }) {
      // 为每个 productGroup 分配一个固定的颜色类
      const groupColors = {}
      let colorIndex = 0
      this.filteredData.forEach(item => {
        if (!groupColors[item.productGroup]) {
          groupColors[item.productGroup] = colorIndex % 2
          colorIndex++
        }
      })
      return groupColors[row.productGroup] === 0 ? 'row-even' : 'row-odd'
    }
  }
}
</script>

<style lang="scss" scoped>
.product-purchase-analysis {
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

.group-tabs {
  margin-bottom: 15px;
}

.kpi-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 15px;
}

.kpi-card {
  text-align: center;
}

.kpi-content {
  padding: 10px 0;
}

.kpi-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;

  &.purchase-value {
    color: #f56c6c;
  }
}

.kpi-details {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;

  .detail-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin: 6px 0;
    font-size: 13px;

    .detail-label {
      color: #909399;
    }

    .detail-value {
      font-weight: 600;
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

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.chart-card {
  background: #fff;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
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

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table .row-even) {
  background-color: #f5f7fa;
}

:deep(.el-table .row-odd) {
  background-color: #ffffff;
}

:deep(.el-table__header th) {
  background-color: #e6f3ff !important;
}

:deep(.el-card__header) {
  padding: 12px 15px;
}

:deep(.el-card__body) {
  padding: 15px;
}

@media (max-width: 1200px) {
  .kpi-cards {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div class="customer-analysis">
    <div class="filter-bar">
      <el-form inline size="small" @submit.native.prevent>
        <el-form-item label="">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 220px;"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item label="">
          <el-radio-group v-model="customerType" @change="handleCustomerTypeChange">
            <el-radio-button value="ORG">客户组织</el-radio-button>
            <el-radio-button value="CUSTOMER">客户</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="">
          <el-select
            v-model="selectedIndustries"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="行业"
            style="width: 140px;"
            @change="handleFilterChange"
          >
            <el-option
              v-for="industry in availableIndustries"
              :key="industry"
              :label="industry"
              :value="industry"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-select
            v-model="selectedRanges"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="销售额区间"
            style="width: 180px;"
            @change="handleFilterChange"
          >
            <el-option
              v-for="range in availableRanges"
              :key="range"
              :label="range"
              :value="range"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="staffList.length > 0" label="">
          <el-select
            v-model="selectedStaffs"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="业务员"
            style="width: 140px;"
            @change="handleStaffChange"
          >
            <el-option
              v-for="staff in staffList"
              :key="staff"
              :label="staff"
              :value="staff"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div class="kpi-cards">
      <el-card class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-label">总销售额</div>
          <div class="kpi-value">{{ formatCurrency(kpiData.totalSales) }}万</div>
          <div class="kpi-details">
            <div class="detail-row">
              <span class="detail-label">去年同期：</span>
              <span class="detail-value">{{ formatCurrency(kpiData.lastYearTotalSales) }}万</span>
            </div>
            <div class="detail-row" :class="kpiData.salesDiff >= 0 ? 'positive' : 'negative'">
              <span class="detail-label">差值：</span>
              <span class="detail-value">
                {{ kpiData.salesDiff >= 0 ? '+' : '' }}{{ formatCurrency(kpiData.salesDiff) }}万
              </span>
            </div>
            <div class="detail-row" :class="kpiData.salesYoY >= 0 ? 'positive' : 'negative'">
              <span class="detail-label">同比：</span>
              <span class="detail-value">
                {{ Math.abs(kpiData.salesYoY).toFixed(1) }}% {{ kpiData.salesYoY >= 0 ? '↑' : '↓' }}
              </span>
            </div>
          </div>
        </div>
      </el-card>
      <el-card class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-label">总差价</div>
          <div class="kpi-value profit-value">{{ formatCurrency(kpiData.totalProfit) }}万</div>
          <div class="kpi-details">
            <div class="detail-row">
              <span class="detail-label">去年同期：</span>
              <span class="detail-value">{{ formatCurrency(kpiData.lastYearTotalProfit) }}万</span>
            </div>
            <div class="detail-row" :class="kpiData.profitDiff >= 0 ? 'positive' : 'negative'">
              <span class="detail-label">差值：</span>
              <span class="detail-value">
                {{ kpiData.profitDiff >= 0 ? '+' : '' }}{{ formatCurrency(kpiData.profitDiff) }}万
              </span>
            </div>
            <div class="detail-row" :class="kpiData.profitYoY >= 0 ? 'positive' : 'negative'">
              <span class="detail-label">同比：</span>
              <span class="detail-value">
                {{ Math.abs(kpiData.profitYoY).toFixed(1) }}% {{ kpiData.profitYoY >= 0 ? '↑' : '↓' }}
              </span>
            </div>
          </div>
        </div>
      </el-card>
      <el-card class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-label">客户统计</div>
          <div class="kpi-value customer-value">{{ kpiData.totalCustomers }}</div>
          <div class="kpi-details">
            <div class="detail-row">
              <span class="detail-label">{{ customerType === 'ORG' ? '客户组织数：' : '客户总数：' }}</span>
              <span class="detail-value">{{ kpiData.totalCustomers }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ customerType === 'ORG' ? '平均组织单价：' : '平均客单价：' }}</span>
              <span class="detail-value">{{ formatCurrency(kpiData.avgDealSize) }}万</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="charts-grid">
      <el-card class="chart-card chart-1">
        <template #header>
          <div class="card-title">行业销售分布</div>
        </template>
        <div ref="industryChartRef" class="chart-container" />
      </el-card>
      <el-card class="chart-card chart-2">
        <template #header>
          <div class="card-title">销售额区间分布</div>
        </template>
        <div ref="rangeDistChartRef" class="chart-container" />
      </el-card>
    </div>

    <div class="charts-row">
      <el-card class="chart-card chart-3">
        <template #header>
          <div class="card-title">行业 x 区间 热力图</div>
        </template>
        <div ref="heatmapChartRef" class="chart-container" />
      </el-card>
      <el-card class="chart-card">
        <template #header>
          <div class="card-title">销售额排名 Top10</div>
        </template>
        <div ref="rankChartRef" class="chart-container" />
      </el-card>
    </div>

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
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600', fontSize: '12px' }"
        :cell-style="{ fontSize: '12px' }"
        :default-sort="{ prop: 'currentSales', order: 'descending' }"
        row-class-name="table-row-hover"
      >
        <el-table-column prop="orgName" :label="customerType === 'ORG' ? '客户组织' : '客户名称'" width="250" show-overflow-tooltip />
        <el-table-column prop="industry" label="行业" width="75" align="center">
          <template #default="scope">
            <el-tag type="info" size="small" effect="plain" style="border-radius: 4px;">{{ scope.row.industry }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="customerCount" label="客户数" width="65" align="center" />
        <el-table-column prop="salesRange" label="销售额区间" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getSalesRangeTagType(scope.row.salesRange)" size="small" effect="dark" style="border-radius: 4px; font-size: 10px;">
              {{ scope.row.salesRange }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当期销售额" width="100" align="center">
          <template #default="scope">
            <span style="color: #409eff; font-weight: 600; font-size: 12px;">{{ formatCurrency(scope.row.currentSales) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="去年同期" width="100" align="center">
          <template #default="scope">
            <span style="color: #909399; font-size: 12px;">{{ formatCurrency(scope.row.lastYearSales) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="前年全额" width="100" align="center">
          <template #default="scope">
            <span style="color: #909399; font-size: 12px;">{{ formatCurrency(scope.row.yearBeforeLastSales) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="salesYoYRate" label="去年同期同比" width="130" sortable align="center">
          <template #default="scope">
            <span :style="{ color: scope.row.salesYoYRate >= 0 ? '#f56c6c' : '#67c23a', fontWeight: '600', fontSize: '11px' }">
              {{ scope.row.salesYoYRate >= 0 ? '+' : '' }}{{ formatCurrency(scope.row.salesYoYRate) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="当期差价" width="100" align="center">
          <template #default="scope">
            <span style="color: #009688; font-weight: 600; font-size: 12px;">{{ formatCurrency(scope.row.currentProfit) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="去年同期" width="100" align="center">
          <template #default="scope">
            <span style="color: #909399; font-size: 12px;">{{ formatCurrency(scope.row.lastYearProfit) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="前年全额" width="100" align="center">
          <template #default="scope">
            <span style="color: #909399; font-size: 12px;">{{ formatCurrency(scope.row.yearBeforeLastProfit) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profitYoYRate" label="去年同期同比" width="130" sortable align="center">
          <template #default="scope">
            <span :style="{ color: scope.row.profitYoYRate >= 0 ? '#f56c6c' : '#67c23a', fontWeight: '600', fontSize: '11px' }">
              {{ scope.row.profitYoYRate >= 0 ? '+' : '' }}{{ formatCurrency(scope.row.profitYoYRate) }}
            </span>
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
import { getCustomerSalesData } from '@/api/dataPlatform'
import { isAdmin, getCurrentUserName, getDataPermissions, getFirstDataPermissionName, getDataPermissionValues } from '@/utils/permission'
import { getAssessmentTargets } from '@/api/enterprise/user'

export default {
  name: 'CustomerAnalysis',
  data() {
    return {
      dateRange: [],
      customerType: 'ORG',
      selectedIndustries: [],
      selectedRanges: [],
      selectedStaffs: [],
      staffList: [],
      listLoading: false,
      rawData: [],
      filteredData: [],
      currentPage: 1,
      pageSize: 25,
      industryChart: null,
      rangeDistChart: null,
      heatmapChart: null,
      rankChart: null,
      kpiData: {
        totalSales: 0,
        totalCustomers: 0,
        totalProfit: 0,
        avgDealSize: 0,
        salesYoY: 0,
        profitYoY: 0,
        currentTotalSales: 0,
        currentTotalProfit: 0
      },
      TOOLTIP_COLORS: {
        sales: '#409eff',
        profit: '#009688',
        count: '#e6a23c',
        positive: '#67c23a',
        negative: '#f56c6c',
        muted: '#909399',
        text: '#303133',
        border: '#e4e7ed',
        bg: 'rgba(255, 255, 255, 0.98)'
      }
    }
  },
  computed: {
    availableIndustries() {
      const industries = new Set()
      this.rawData.forEach(item => {
        const industry = item['行业'] || ''
        if (industry) industries.add(industry)
      })
      return Array.from(industries).sort()
    },
    availableRanges() {
      const ranges = new Set()
      this.rawData.forEach(item => {
        const range = item['销售额区间'] || ''
        if (range) ranges.add(range)
      })
      return Array.from(ranges).sort()
    },
    tableData() {
      return this.filteredData.map(item => {
        const currentSales = this.getFieldValue(item, '销售额', 'current')
        const lastYearSales = this.getFieldValue(item, '销售额', 'last')
        const yearBeforeLastSales = this.getFieldValue(item, '销售额', 'yearBeforeLast')
        const currentProfit = this.getFieldValue(item, '差价', 'current')
        const lastYearProfit = this.getFieldValue(item, '差价', 'last')
        const yearBeforeLastProfit = this.getFieldValue(item, '差价', 'yearBeforeLast')
        const salesYoYRate = lastYearSales > 0 ? currentSales - lastYearSales : 0
        const profitYoYRate = lastYearProfit > 0 ? currentProfit - lastYearProfit : 0

        // 根据customerType选择正确的客户名称字段
        const orgName = this.customerType === 'ORG'
          ? (item['组织'] || '')
          : (item['客户'] || '')

        return {
          ...item,
          orgName,
          industry: item['行业'] || '',
          customerCount: this.customerType === 'ORG' ? (item['客户数量'] || 0) : 1,
          salesRange: item['销售额区间'] || '',
          currentSales,
          lastYearSales,
          yearBeforeLastSales,
          currentProfit,
          lastYearProfit,
          yearBeforeLastProfit,
          salesYoYRate,
          profitYoYRate
        }
      }).sort((a, b) => b.currentSales - a.currentSales)
    },
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
      return this.tableData.slice(start, end)
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
    getCurrentYearField(item, keyword) {
      const keys = Object.keys(item)
      const field = keys.find(key => key.includes(keyword) && key.includes('当期'))
      return field
    },

    getLastYearField(item, keyword) {
      const keys = Object.keys(item)
      const field = keys.find(key => key.includes(keyword) && key.includes('同期'))
      return field
    },

    getYearBeforeLastField(item, keyword) {
      const keys = Object.keys(item)
      const field = keys.find(key => key.includes(keyword) && key.includes('前年'))
      return field
    },

    getFieldValue(item, keyword, type = 'current') {
      if (type === 'current') {
        const field = this.getCurrentYearField(item, keyword)
        return field ? (parseFloat(item[field]) || 0) : 0
      } else if (type === 'last') {
        const field = this.getLastYearField(item, keyword)
        return field ? (parseFloat(item[field]) || 0) : 0
      } else if (type === 'yearBeforeLast') {
        const field = this.getYearBeforeLastField(item, keyword)
        return field ? (parseFloat(item[field]) || 0) : 0
      }
      return 0
    },

    initDateRange() {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      const currentDay = new Date().getDate()
      const nextDay = new Date()
      nextDay.setDate(currentDay + 1)
      const nextDayMonth = nextDay.getMonth() + 1
      const nextDayDate = nextDay.getDate()

      const startDate = `${currentYear}-01-01`
      const endDate = `${currentYear}-${String(nextDayMonth).padStart(2, '0')}-${String(nextDayDate).padStart(2, '0')}`

      this.dateRange = [startDate, endDate]
    },

    async fetchData() {
      this.listLoading = true
      const currentUserName = getCurrentUserName()
      const admin = isAdmin()

      const employeePermValues = getDataPermissionValues('EMPLOYEE')
      let employeeName = ''
      let permissionValue = ''

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
                permissionValue = perm.permissionValue || ''
                break
              }
            }
            if (employeeName) break
          }
          if (dataPerm.permissionType && dataPerm.permissionType.toLowerCase() === 'employee') {
            employeeName = dataPerm.permissionName || ''
            permissionValue = dataPerm.permissionValue || ''
            break
          }
        }
      }

      let salesPerson = 'ALL'

      if (!admin) {
        salesPerson = employeeName || currentUserName
      }

      if (this.selectedStaffs && this.selectedStaffs.length > 0) {
        salesPerson = this.selectedStaffs.join(',')
      }

      const [currentStart, currentEnd] = this.dateRange || []

      const params = {
        customerType: this.customerType,
        reportType: this.customerType,
        startDate: currentStart,
        endDate: currentEnd,
        salesPerson: salesPerson
      }

      try {
        const response = await getCustomerSalesData(params)
        this.rawData = this.extractDataArray(response)

        this.staffList = employeeName ? employeeName.split(',').map(n => n.trim()).filter(n => n) : []

        this.applyFilters()
      } catch (error) {
        console.error('获取客户数据失败:', error)
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
      let filtered = [...this.rawData]
      this.currentPage = 1

      filtered = filtered.filter(item => {
        const industry = item['行业'] || ''
        return industry !== '个人1'
      })

      if (this.selectedIndustries.length > 0) {
        filtered = filtered.filter(item => {
          const industry = item['行业'] || ''
          return this.selectedIndustries.includes(industry)
        })
      }

      if (this.selectedRanges.length > 0) {
        filtered = filtered.filter(item => {
          const range = item['销售额区间'] || ''
          return this.selectedRanges.includes(range)
        })
      }

      this.filteredData = filtered
      this.updateKPI()
      this.updateCharts()
    },

    handleDateRangeChange() {
      this.fetchData()
    },

    handleCustomerTypeChange() {
      this.fetchData()
    },

    handleFilterChange() {
      this.applyFilters()
    },
    handleStaffChange() {
      this.fetchData()
    },

    handleResize() {
      this.industryChart?.resize()
      this.rangeDistChart?.resize()
      this.heatmapChart?.resize()
      this.rankChart?.resize()
    },
    // 加载销售额、差价页签数据
    updateKPI() {
      const currentTotalSales = this.filteredData.reduce((sum, item) => sum + this.getFieldValue(item, '销售额', 'current'), 0)
      const lastYearTotalSales = this.filteredData.reduce((sum, item) => sum + this.getFieldValue(item, '销售额', 'last'), 0)
      const currentTotalProfit = this.filteredData.reduce((sum, item) => sum + this.getFieldValue(item, '差价', 'current'), 0)
      const lastYearTotalProfit = this.filteredData.reduce((sum, item) => sum + this.getFieldValue(item, '差价', 'last'), 0)

      // 根据customerType计算客户数：
      // - ORG: 按组织名称去重统计组织数量
      // - CUSTOMER: 每行数据代表一个客户，使用数据行数
      let totalCustomers = 0
      if (this.customerType === 'ORG') {
        const orgSet = new Set()
        this.filteredData.forEach(item => {
          const orgName = item['组织'] || ''
          if (orgName) orgSet.add(orgName)
        })
        totalCustomers = orgSet.size
      } else {
        totalCustomers = this.filteredData.length
      }

      const avgDealSize = currentTotalSales > 0 && totalCustomers > 0 ? currentTotalSales / totalCustomers : 0

      this.kpiData = {
        totalSales: currentTotalSales,
        totalCustomers,
        totalProfit: currentTotalProfit,
        avgDealSize,
        currentTotalSales,
        currentTotalProfit,
        lastYearTotalSales,
        lastYearTotalProfit,
        salesDiff: currentTotalSales - lastYearTotalSales,
        profitDiff: currentTotalProfit - lastYearTotalProfit,
        salesYoY: lastYearTotalSales > 0 ? ((currentTotalSales - lastYearTotalSales) / lastYearTotalSales) * 100 : 0,
        profitYoY: lastYearTotalProfit > 0 ? ((currentTotalProfit - lastYearTotalProfit) / lastYearTotalProfit) * 100 : 0
      }
    },

    getSalesRangeTagType(salesRange) {
      const typeMap = {
        '300万以上': 'success',
        '100-300万': 'primary',
        '50-100万': 'warning',
        '20-50万': 'info',
        '10-20万': '',
        '10万以下': 'danger'
      }
      return typeMap[salesRange] || 'info'
    },

    initCharts() {
      if (this.$refs.industryChartRef) {
        this.industryChart = echarts.init(this.$refs.industryChartRef)
        this.industryChart.on('click', (params) => {
          if (params.name) {
            this.handleIndustryClick(params.name)
          }
        })
      }
      if (this.$refs.rangeDistChartRef) {
        this.rangeDistChart = echarts.init(this.$refs.rangeDistChartRef)
      }
      if (this.$refs.heatmapChartRef) {
        this.heatmapChart = echarts.init(this.$refs.heatmapChartRef)
      }
      if (this.$refs.rankChartRef) {
        this.rankChart = echarts.init(this.$refs.rankChartRef)
      }
    },

    disposeCharts() {
      this.industryChart?.dispose()
      this.rangeDistChart?.dispose()
      this.heatmapChart?.dispose()
      this.rankChart?.dispose()
    },

    handleIndustryClick(industry) {
      if (this.selectedIndustries.includes(industry)) {
        this.selectedIndustries = this.selectedIndustries.filter(i => i !== industry)
      } else {
        this.selectedIndustries = [...this.selectedIndustries, industry]
      }
      this.applyFilters()
    },

    updateCharts() {
      this.updateIndustryChart()
      this.updateRangeDistChart()
      this.updateHeatmapChart()
      this.updateRankChart()
    },

    updateIndustryChart() {
      if (!this.industryChart) return

      if (!this.filteredData || this.filteredData.length === 0) {
        this.industryChart.clear()
        return
      }

      const industrySalesMap = new Map()
      const industryCountMap = new Map()

      this.filteredData.forEach(item => {
        const industry = item['行业'] || '未知'
        const sales = this.getFieldValue(item, '销售额', 'current')
        const count = this.customerType === 'ORG' ? (item['客户数量'] || 0) : 1
        industrySalesMap.set(industry, (industrySalesMap.get(industry) || 0) + sales)
        industryCountMap.set(industry, (industryCountMap.get(industry) || 0) + count)
      })

      const totalSales = Array.from(industrySalesMap.values()).reduce((sum, v) => sum + v, 0)

      const industryData = Array.from(industrySalesMap.entries())
        .map(([name, value]) => ({
          name,
          value,
          count: industryCountMap.get(name) || 0,
          percent: totalSales > 0 ? (value / totalSales * 100) : 0
        }))
        .sort((a, b) => b.value - a.value)

      const tooltipColors = this.TOOLTIP_COLORS
      const customerType = this.customerType
      const formatWan = this.formatWan.bind(this)

      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: tooltipColors.bg,
          borderColor: tooltipColors.border,
          borderWidth: 1,
          padding: [12, 16],
          textStyle: {
            color: tooltipColors.text,
            fontSize: 13
          },
          formatter: function(params) {
            const data = industryData.find(d => d.name === params.name)
            if (!data) return ''
            const c = tooltipColors
            const countLabel = customerType === 'ORG' ? '组织数' : '客户数'
            const html = `
              <div style="font-size:14px;font-weight:bold;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid ${c.border};">
                ${data.name}
              </div>
              <div style="margin-bottom:6px;">
                <span style="color:${c.sales};font-weight:600;">销售额</span>
                <span style="margin-left:10px;font-weight:bold;">${formatWan(data.value)} 万</span>
                <span style="margin-left:8px;color:${c.muted};">占比</span>
                <span style="margin-left:4px;font-weight:bold;">${data.percent.toFixed(1)}%</span>
              </div>
              <div style="margin-bottom:4px;">
                <span style="color:${c.count};font-weight:600;">${countLabel}</span>
                <span style="margin-left:10px;font-weight:bold;">${data.count}</span>
              </div>
            `
            return html
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle',
          textStyle: {
            color: '#606266'
          }
        },
        series: [
          {
            name: '行业分布',
            type: 'pie',
            radius: '55%',
            center: ['60%', '50%'],
            data: industryData,
            emphasis: {
              itemStyle: {
                shadowBlur: 15,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                borderWidth: 2,
                borderColor: '#fff'
              }
            },
            label: {
              show: false
            }
          }
        ]
      }

      this.industryChart.setOption(option)
    },

    updateRangeDistChart() {
      if (!this.rangeDistChart) return

      if (!this.filteredData || this.filteredData.length === 0) {
        this.rangeDistChart.clear()
        return
      }

      const rangeOrder = ['300万以上', '100-300万', '50-100万', '20-50万', '10-20万', '10万以下']
      const salesMap = new Map()
      const profitMap = new Map()
      const orgCountMap = new Map()
      const customerCountMap = new Map()
      rangeOrder.forEach(r => {
        salesMap.set(r, 0)
        profitMap.set(r, 0)
        orgCountMap.set(r, new Set())
        customerCountMap.set(r, 0)
      })

      this.filteredData.forEach(item => {
        const range = item['销售额区间'] || '未知'
        if (salesMap.has(range)) {
          const sales = this.getFieldValue(item, '销售额', 'current')
          const profit = this.getFieldValue(item, '差价', 'current')
          const orgName = item['组织'] || ''
          salesMap.set(range, salesMap.get(range) + sales)
          profitMap.set(range, profitMap.get(range) + profit)
          if (orgName) orgCountMap.get(range).add(orgName)
          // 客户模式：每行数据代表一个客户，统计行数+1
          // 组织模式：累加每个组织的客户数量
          if (this.customerType === 'CUSTOMER') {
            customerCountMap.set(range, customerCountMap.get(range) + 1)
          } else {
            customerCountMap.set(range, customerCountMap.get(range) + (item['客户数量'] || 0))
          }
        }
      })

      const totalSales = Array.from(salesMap.values()).reduce((sum, v) => sum + v, 0)
      const totalOrgCount = Array.from(orgCountMap.values()).reduce((sum, set) => sum + set.size, 0)
      const totalCustomerCount = Array.from(customerCountMap.values()).reduce((sum, v) => sum + v, 0)
      const totalCount = customerType === 'ORG' ? totalOrgCount : totalCustomerCount
      const tooltipColors = this.TOOLTIP_COLORS
      const customerType = this.customerType
      const formatWan = this.formatWan.bind(this)

      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: tooltipColors.bg,
          borderColor: tooltipColors.border,
          borderWidth: 1,
          padding: [12, 16],
          textStyle: {
            color: tooltipColors.text,
            fontSize: 13
          },
          formatter: function(params) {
            if (!params) return ''
            const c = tooltipColors
            const range = params.name
            const orgSet = orgCountMap.get(range)
            const customerCount = customerCountMap.get(range) || 0
            const rangeData = {
              sales: salesMap.get(range) || 0,
              profit: profitMap.get(range) || 0,
              count: customerType === 'ORG' ? (orgSet ? orgSet.size : 0) : customerCount
            }
            const salesPercent = totalSales > 0 ? (rangeData.sales / totalSales * 100) : 0
            const countPercent = totalCount > 0 ? (rangeData.count / totalCount * 100) : 0
            const countLabel = customerType === 'ORG' ? '组织数' : '客户数'

            const html = `
              <div style="font-size:14px;font-weight:bold;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid ${c.border};">
                ${range}
              </div>
              <div style="margin-bottom:8px;">
                <span style="color:${c.sales};font-weight:600;">销售额</span>
                <span style="margin-left:10px;font-weight:bold;">${formatWan(rangeData.sales)} 万</span>
                <span style="margin-left:8px;color:${c.muted};">占比</span>
                <span style="margin-left:4px;font-weight:bold;">${salesPercent.toFixed(1)}%</span>
              </div>
              <div style="margin-bottom:8px;">
                <span style="color:${c.profit};font-weight:600;">差价</span>
                <span style="margin-left:10px;font-weight:bold;">${formatWan(rangeData.profit)} 万</span>
              </div>
              <div>
                <span style="color:${c.count};font-weight:600;">${countLabel}</span>
                <span style="margin-left:10px;font-weight:bold;">${rangeData.count}</span>
                <span style="margin-left:8px;color:${c.muted};">占比</span>
                <span style="margin-left:4px;font-weight:bold;">${countPercent.toFixed(1)}%</span>
              </div>
            `
            return html
          }
        },
        legend: {
          data: ['销售额', '差价', '客户数'],
          bottom: 0,
          textStyle: {
            color: '#606266'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: rangeOrder,
          axisLabel: {
            color: '#606266',
            fontSize: 12
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '金额(万)',
            nameTextStyle: {
              color: '#909399'
            },
            axisLabel: {
              color: '#606266'
            }
          }
        ],
        series: [
          {
            name: '销售额',
            type: 'bar',
            data: rangeOrder.map(r => salesMap.get(r)),
            itemStyle: { color: '#409eff' },
            barWidth: '35%'
          },
          {
            name: '差价',
            type: 'bar',
            data: rangeOrder.map(r => profitMap.get(r)),
            itemStyle: { color: '#009688' },
            barWidth: '35%'
          },
          {
            name: '客户数',
            type: 'bar',
            yAxisIndex: 0,
            data: rangeOrder.map(r => customerType === 'ORG' ? (orgCountMap.get(r)?.size || 0) : (customerCountMap.get(r) || 0)),
            itemStyle: { color: '#e6a23c' },
            barWidth: '20%'
          }
        ]
      }

      this.rangeDistChart.setOption(option)

      // 点击柱状图筛选当前区间数据
      this.rangeDistChart.off('click')
      this.rangeDistChart.on('click', (params) => {
        if (params.name && params.seriesName === '销售额') {
          this.selectedRanges = [params.name]
          this.applyFilters()
        }
      })
    },

    updateHeatmapChart() {
      if (!this.heatmapChart) return

      const industries = [...new Set(this.filteredData.map(item => item['行业'] || ''))].filter(Boolean).sort()
      const rangeOrder = ['300万以上', '100-300万', '50-100万', '20-50万', '10-20万', '10万以下']
      const ranges = [...new Set(this.filteredData.map(item => item['销售额区间'] || ''))].filter(Boolean)

      if (industries.length === 0 || ranges.length === 0) {
        this.heatmapChart.clear()
        return
      }

      ranges.sort((a, b) => rangeOrder.indexOf(a) - rangeOrder.indexOf(b))

      const rawData = []
      let totalSales = 0
      let totalOrgCount = 0
      let totalCustomerCount = 0

      industries.forEach(industry => {
        ranges.forEach(range => {
          const items = this.filteredData.filter(item =>
            (item['行业'] || '') === industry &&
            (item['销售额区间'] || '') === range
          )
          const sales = items.reduce((sum, item) => sum + this.getFieldValue(item, '销售额', 'current'), 0)
          const orgSet = new Set()
          let customerCount = 0
          items.forEach(item => {
            const orgName = item['组织'] || ''
            if (orgName) orgSet.add(orgName)
            customerCount += item['客户数量'] || 0
          })
          totalSales += sales
          totalOrgCount += orgSet.size
          totalCustomerCount += customerCount
          rawData.push({ range, industry, sales, orgCount: orgSet.size, customerCount })
        })
      })

      const totalCount = this.customerType === 'ORG' ? totalOrgCount : totalCustomerCount
      const tooltipColors = this.TOOLTIP_COLORS
      const customerType = this.customerType
      const formatWan = this.formatWan.bind(this)

      const heatmapData = rawData.map(item => {
        const percent = totalSales > 0 ? (item.sales / totalSales * 100) : 0
        return [item.range, item.industry, item.sales, percent, item.orgCount, item.customerCount]
      })

      const option = {
        tooltip: {
          backgroundColor: tooltipColors.bg,
          borderColor: tooltipColors.border,
          borderWidth: 1,
          padding: [12, 16],
          textStyle: {
            color: tooltipColors.text,
            fontSize: 13
          },
          formatter: function(params) {
            const [range, industry, sales, percent, orgCount, customerCount] = params.value
            const c = tooltipColors
            const count = customerType === 'ORG' ? orgCount : customerCount
            const countPercent = totalCount > 0 ? (count / totalCount * 100) : 0
            const countLabel = customerType === 'ORG' ? '组织数' : '客户数'

            const html = `
              <div style="font-size:14px;font-weight:bold;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid ${c.border};">
                ${industry} - ${range}
              </div>
              <div style="margin-bottom:8px;">
                <span style="color:${c.sales};font-weight:600;">销售额</span>
                <span style="margin-left:10px;font-weight:bold;">${formatWan(sales)} 万</span>
                <span style="margin-left:8px;color:${c.muted};">占比</span>
                <span style="margin-left:4px;font-weight:bold;">${percent.toFixed(1)}%</span>
              </div>
              <div>
                <span style="color:${c.count};font-weight:600;">${countLabel}</span>
                <span style="margin-left:10px;font-weight:bold;">${count}</span>
                <span style="margin-left:8px;color:${c.muted};">占比</span>
                <span style="margin-left:4px;font-weight:bold;">${countPercent.toFixed(1)}%</span>
              </div>
            `
            return html
          }
        },
        grid: {
          left: '3%',
          right: '10%',
          bottom: '3%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: rangeOrder.filter(r => ranges.includes(r)),
          splitArea: { show: true }
        },
        yAxis: {
          type: 'category',
          data: industries,
          splitArea: { show: true }
        },
        visualMap: {
          min: 0,
          max: 100,
          calcul: true,
          left: 'right',
          top: 'center',
          text: ['高', '低'],
          formatter: (value) => `${value}%`,
          inRange: {
            color: ['#ffffdf', '#fcff85', '#f7d34d', '#f4a261', '#e76f51', '#9b2226']
          }
        },
        series: [{
          name: '销售额',
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: true,
            formatter: (params) => this.formatWan(params.value[2])
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }

      this.heatmapChart.setOption(option)

      // 点击热力图联动筛选行业和区间
      this.heatmapChart.off('click')
      this.heatmapChart.on('click', (params) => {
        const [range, industry] = params.value
        this.selectedRanges = [range]
        this.selectedIndustries = [industry]
        this.applyFilters()
      })
    },

    updateRankChart() {
      if (!this.rankChart) return

      if (!this.filteredData || this.filteredData.length === 0) {
        this.rankChart.clear()
        return
      }

      const nameField = this.customerType === 'ORG' ? '组织' : '客户'

      const sortedData = [...this.filteredData]
        .map(item => ({
          name: item[nameField] || '',
          currentSales: this.getFieldValue(item, '销售额', 'current'),
          lastSales: this.getFieldValue(item, '销售额', 'last'),
          yearBeforeLastSales: this.getFieldValue(item, '销售额', 'yearBeforeLast'),
          currentProfit: this.getFieldValue(item, '差价', 'current'),
          lastProfit: this.getFieldValue(item, '差价', 'last'),
          yearBeforeLastProfit: this.getFieldValue(item, '差价', 'yearBeforeLast')
        }))
        .sort((a, b) => b.currentSales - a.currentSales)
        .slice(0, 10)

      const tooltipColors = this.TOOLTIP_COLORS
      const formatWan = this.formatWan.bind(this)

      const option = {
        tooltip: {
          trigger: 'item',
          axisPointer: { type: 'shadow' },
          backgroundColor: tooltipColors.bg,
          borderColor: tooltipColors.border,
          borderWidth: 1,
          padding: [12, 16],
          textStyle: {
            color: tooltipColors.text,
            fontSize: 13
          },
          formatter: function(params) {
            if (!params) return ''
            const idx = params.dataIndex
            if (idx < 0 || idx >= sortedData.length) return ''
            const data = sortedData[idx]

            const salesDiff = data.currentSales - data.lastSales
            const profitDiff = data.currentProfit - data.lastProfit

            const html = `
              <div style="font-size:14px;font-weight:bold;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid ${tooltipColors.border};">
                ${data.name}
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <tr style="border-bottom:1px solid ${tooltipColors.border};">
                  <td style="padding:4px 8px;color:${tooltipColors.muted};">当期销售额</td>
                  <td style="padding:4px 8px;font-weight:bold;text-align:right;">${formatWan(data.currentSales)}万</td>
                  <td style="padding:4px 8px;color:${tooltipColors.muted};">当期差价</td>
                  <td style="padding:4px 8px;font-weight:bold;text-align:right;">${formatWan(data.currentProfit)}万</td>
                </tr>
                <tr style="border-bottom:1px solid ${tooltipColors.border};">
                  <td style="padding:4px 8px;color:${tooltipColors.muted};">去年同期</td>
                  <td style="padding:4px 8px;font-weight:bold;text-align:right;">${formatWan(data.lastSales)}万</td>
                  <td style="padding:4px 8px;color:${tooltipColors.muted};">去年同期</td>
                  <td style="padding:4px 8px;font-weight:bold;text-align:right;">${formatWan(data.lastProfit)}万</td>
                </tr>
                <tr>
                  <td style="padding:4px 8px;color:${tooltipColors.muted};">差值</td>
                  <td style="padding:4px 8px;font-weight:bold;text-align:right;color:${salesDiff >= 0 ? tooltipColors.negative : tooltipColors.positive};">${salesDiff >= 0 ? '+' : ''}${formatWan(salesDiff)}万</td>
                  <td style="padding:4px 8px;color:${tooltipColors.muted};">差值</td>
                  <td style="padding:4px 8px;font-weight:bold;text-align:right;color:${profitDiff >= 0 ? tooltipColors.negative : tooltipColors.positive};">${profitDiff >= 0 ? '+' : ''}${formatWan(profitDiff)}万</td>
                </tr>
              </table>
            `
            return html
          }
        },
        grid: {
          left: '3%',
          right: '10%',
          bottom: '3%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: '销售额(万)',
          axisLabel: {
            formatter: function(value) {
              return Math.round(value / 10000)
            }
          },
          splitNumber: 5
        },
        yAxis: {
          type: 'category',
          data: sortedData.map(d => d.name),
          inverse: true
        },
        series: [{
          name: '销售额',
          type: 'bar',
          data: sortedData.map(d => d.currentSales),
          itemStyle: {
            color: function(params) {
              const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#ffb6c1']
              return colors[params.dataIndex % colors.length]
            }
          },
          label: {
            show: true,
            position: 'right',
            formatter: function(params) {
              return formatWan(params.value) + '万'
            }
          },
          barWidth: '60%'
        }]
      }

      this.rankChart.setOption(option)
    },

    handleExport() {
      const headers = [this.customerType === 'ORG' ? '客户组织' : '客户名称', '行业', '客户数量', '销售额区间', '当期销售额(万)', '同期销售额(万)', '销售额同比', '当期差价(万)', '同期差价(万)', '差价同比']
      const rows = this.tableData.map(item => [
        item.orgName,
        item.industry,
        item.customerCount,
        item.salesRange,
        (item.currentSales / 10000).toFixed(1),
        (item.lastYearSales / 10000).toFixed(1),
        (item.salesYoYRate / 10000).toFixed(1),
        (item.currentProfit / 10000).toFixed(1),
        (item.lastYearProfit / 10000).toFixed(1),
        (item.profitYoYRate / 10000).toFixed(1)
      ])

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `客户分析_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
    },

    formatWan(value) {
      if (value == null || isNaN(value)) return '0'
      return Math.round(value / 10000).toLocaleString('zh-CN')
    },

    formatPercent(value) {
      if (value == null || isNaN(value)) return '0%'
      const percent = value / 10000
      return Math.abs(percent).toFixed(1) + '%'
    },
    formatCurrency(value) {
      if (value == null || isNaN(value)) return '0'
      const wan = value / 10000
      return wan.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-analysis {
  padding: 15px;
  background-color: rgb(240, 242, 245);
  min-height: calc(100vh - 84px);
}

.filter-bar {
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,.08);

  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-radio-button) {
    .el-radio-button__inner {
      border-radius: 4px;
    }
    &:first-child .el-radio-button__inner {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    &:last-child .el-radio-button__inner {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }
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

.kpi-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
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

  &.profit-value {
    color: #009688;
  }

  &.customer-value {
    color: #409eff;
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
        color: #f56c6c;
      }
    }

    &.negative {
      .detail-value {
        color: #67c23a;
      }
    }
  }
}

.kpi-change {
  font-size: 15px;
  font-weight: 600;

  &.positive {
    color: #f56c6c;
  }

  &.negative {
    color: #67c23a;
  }

  .arrow {
    margin-right: 2px;
  }

  .period {
    color: #909399;
    font-weight: normal;
    margin-left: 4px;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.charts-row {
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
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th.el-table__cell) {
  background: #f5f7fa !important;
  font-weight: 600;
  color: #606266;
}

:deep(.el-table td.el-table__cell) {
  padding: 12px 0;
}

:deep(.table-row-hover:hover > td.el-table__cell) {
  background: #ecf5ff !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: #fafafa !important;
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

  .charts-grid,
  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div class="customer-analysis">
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
          <span class="filter-label">客户属性：</span>
          <el-radio-group v-model="customerType" size="small" @change="handleCustomerTypeChange">
            <el-radio-button label="ORG">客户组织</el-radio-button>
            <el-radio-button label="CUSTOMER">客户</el-radio-button>
          </el-radio-group>
        </div>
        <div class="filter-item">
          <span class="filter-label">行业：</span>
          <el-select
            v-model="selectedIndustries"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="全部行业"
            size="small"
            style="width: 200px;"
            @change="handleFilterChange"
          >
            <el-option
              v-for="industry in availableIndustries"
              :key="industry"
              :label="industry"
              :value="industry"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">销售额区间：</span>
          <el-select
            v-model="selectedRanges"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="全部区间"
            size="small"
            style="width: 280px;"
            @change="handleFilterChange"
          >
            <el-option
              v-for="range in availableRanges"
              :key="range"
              :label="range"
              :value="range"
            />
          </el-select>
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

    <div class="kpi-cards">
      <el-card class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-label">总销售额</div>
          <div class="kpi-value">{{ formatCurrency(kpiData.totalSales) }}万</div>
          <div class="kpi-change" :class="kpiData.salesYoY >= 0 ? 'positive' : 'negative'">
            <span class="arrow">{{ kpiData.salesYoY >= 0 ? '↑' : '↓' }}</span>
            {{ Math.abs(kpiData.salesYoY).toFixed(1) }}%
            <span class="period">同比</span>
          </div>
        </div>
      </el-card>
      <el-card class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-label">{{ customerType === 'ORG' ? '客户组织数' : '客户总数' }}</div>
          <div class="kpi-value">{{ kpiData.totalCustomers }}</div>
        </div>
      </el-card>
      <el-card class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-label">总差价</div>
          <div class="kpi-value">{{ formatCurrency(kpiData.totalProfit) }}万</div>
          <div class="kpi-change" :class="kpiData.profitYoY >= 0 ? 'positive' : 'negative'">
            <span class="arrow">{{ kpiData.profitYoY >= 0 ? '↑' : '↓' }}</span>
            {{ Math.abs(kpiData.profitYoY).toFixed(1) }}%
            <span class="period">同比</span>
          </div>
        </div>
      </el-card>
      <el-card class="kpi-card">
        <div class="kpi-content">
          <div class="kpi-label">平均{{ customerType === 'ORG' ? '组织' : '客' }}单价</div>
          <div class="kpi-value">{{ formatCurrency(kpiData.avgDealSize) }}万</div>
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
        :default-sort="{ prop: 'currentSales', order: 'descending' }"
      >
        <el-table-column prop="orgName" :label="customerType === 'ORG' ? '客户组织' : '客户名称'" width="220" />
        <el-table-column prop="industry" label="行业" width="80" />
        <el-table-column prop="customerCount" label="客户数量" width="90" align="center" />
        <el-table-column prop="salesRange" label="销售额区间" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getSalesRangeTagType(scope.row.salesRange)" size="small">
              {{ scope.row.salesRange }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentSales" label="当期销售额" width="140" align="right" sortable>
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: bold;">{{ formatCurrency(scope.row.currentSales) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastYearSales" label="同期销售额" width="140" align="right" sortable>
          <template #default="scope">
            <span style="color: #909399;">{{ formatCurrency(scope.row.lastYearSales) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="salesYoYRate" label="销售额同比" width="140" sortable align="center">
          <template #default="scope">
            <span :style="{ color: scope.row.salesYoYRate <= 0 ? '#67c23a' : '#f56c6c', fontWeight: '600' }">
              {{ formatCurrency(scope.row.salesYoYRate) >= 0 ? '+' : '' }}{{ formatCurrency(scope.row.salesYoYRate) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="currentProfit" label="当期差价" width="140" align="right" sortable>
          <template #default="scope">
            <span style="color: #009688; font-weight: bold;">{{ formatCurrency(scope.row.currentProfit) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastYearProfit" label="同期差价" width="140" align="right" sortable>
          <template #default="scope">
            <span style="color: #909399;">{{ formatCurrency(scope.row.lastYearProfit) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profitYoYRate" label="差价同比" width="140" sortable align="center">
          <template #default="scope">
            <span :style="{ color: scope.row.profitYoYRate <= 0 ? '#67c23a' : '#f56c6c', fontWeight: '600' }">
              {{ formatCurrency(scope.row.profitYoYRate) >= 0 ? '+' : '' }}{{ formatCurrency(scope.row.profitYoYRate) }}
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
        const currentProfit = this.getFieldValue(item, '差价', 'current')
        const lastYearProfit = this.getFieldValue(item, '差价', 'last')
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
          currentProfit,
          lastYearProfit,
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
      const field = keys.find(key => key.includes(keyword) && (key.includes('当期') || key.includes('当年')))
      return field
    },

    getLastYearField(item, keyword) {
      const keys = Object.keys(item)
      const field = keys.find(key => key.includes(keyword) && (key.includes('同期') || key.includes('去年')))
      return field
    },

    getFieldValue(item, keyword, type = 'current') {
      if (type === 'current') {
        const field = this.getCurrentYearField(item, keyword)
        return field ? (parseFloat(item[field]) || 0) : 0
      } else {
        const field = this.getLastYearField(item, keyword)
        return field ? (parseFloat(item[field]) || 0) : 0
      }
    },

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

      let salesPerson = employeeName

      if (this.selectedStaffs && this.selectedStaffs.length > 0) {
        salesPerson = this.selectedStaffs.join(',')
      }

      const [currentStart, currentEnd] = this.dateRange || []

      const params = {
        customerType: this.customerType,
        reportType: this.customerType,
        startDate: currentStart,
        endDate: currentEnd
      }

      if (permissionValue !== 'ALL' || (this.selectedStaffs && this.selectedStaffs.length > 0)) {
        params.salesPerson = salesPerson
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
        return industry !== '个人'
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

    updateKPI() {
      const currentTotalSales = this.filteredData.reduce((sum, item) => sum + this.getFieldValue(item, '销售额', 'current'), 0)
      const lastYearTotalSales = this.filteredData.reduce((sum, item) => sum + this.getFieldValue(item, '销售额', 'last'), 0)
      const currentTotalProfit = this.filteredData.reduce((sum, item) => sum + this.getFieldValue(item, '差价', 'current'), 0)
      const lastYearTotalProfit = this.filteredData.reduce((sum, item) => sum + this.getFieldValue(item, '差价', 'last'), 0)

      // 根据customerType计算客户数：
      // - ORG: 累加item['客户数量']
      // - CUSTOMER: 直接使用数据行数
      const totalCustomers = this.customerType === 'ORG'
        ? this.filteredData.reduce((sum, item) => sum + (item['客户数量'] || 0), 0)
        : this.filteredData.length

      const avgDealSize = lastYearTotalSales > 0 && totalCustomers > 0 ? lastYearTotalSales / totalCustomers : 0

      this.kpiData = {
        totalSales: lastYearTotalSales,
        totalCustomers,
        totalProfit: lastYearTotalProfit,
        avgDealSize,
        currentTotalSales,
        currentTotalProfit,
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

      const industryMap = new Map()

      this.filteredData.forEach(item => {
        const industry = item['行业'] || '未知'
        const sales = this.getFieldValue(item, '销售额', 'current')
        industryMap.set(industry, (industryMap.get(industry) || 0) + sales)
      })

      const industryData = Array.from(industryMap.entries())
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
            name: '行业分布',
            type: 'pie',
            radius: '60%',
            center: ['60%', '50%'],
            data: industryData,
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
      const countMap = new Map()
      rangeOrder.forEach(r => {
        salesMap.set(r, 0)
        profitMap.set(r, 0)
        countMap.set(r, 0)
      })

      this.filteredData.forEach(item => {
        const range = item['销售额区间'] || '未知'
        if (salesMap.has(range)) {
          const sales = this.getFieldValue(item, '销售额', 'current')
          const profit = this.getFieldValue(item, '差价', 'current')
          const count = item['客户数量'] || 0
          salesMap.set(range, salesMap.get(range) + sales)
          profitMap.set(range, profitMap.get(range) + profit)
          countMap.set(range, countMap.get(range) + count)
        }
      })

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            if (!params || params.length === 0) return ''
            const range = params[0].name
            const sales = params[0]?.value || 0
            const profit = params[1]?.value || 0
            const count = params[2]?.value || 0
            return `${range}<br/>销售额: ${this.formatWan(sales)}万<br/>差价: ${this.formatWan(profit)}万<br/>客户数: ${count}`
          }
        },
        legend: {
          data: ['销售额', '差价', '客户数'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: rangeOrder
        },
        yAxis: [
          {
            type: 'value',
            name: '金额(万)'
          },
          {
            type: 'value',
            name: '客户数'
          }
        ],
        series: [
          {
            name: '销售额',
            type: 'bar',
            data: rangeOrder.map(r => salesMap.get(r)),
            itemStyle: { color: '#409eff' }
          },
          {
            name: '差价',
            type: 'bar',
            data: rangeOrder.map(r => profitMap.get(r)),
            itemStyle: { color: '#009688' }
          },
          {
            name: '客户数',
            type: 'bar',
            yAxisIndex: 1,
            data: rangeOrder.map(r => countMap.get(r)),
            itemStyle: { color: '#e6a23c' }
          }
        ]
      }

      this.rangeDistChart.setOption(option)
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

      industries.forEach(industry => {
        ranges.forEach(range => {
          const items = this.filteredData.filter(item =>
            (item['行业'] || '') === industry &&
            (item['销售额区间'] || '') === range
          )
          const sales = items.reduce((sum, item) => sum + this.getFieldValue(item, '销售额', 'current'), 0)
          totalSales += sales
          rawData.push({ range, industry, sales })
        })
      })

      const heatmapData = rawData.map(item => {
        const percent = totalSales > 0 ? (item.sales / totalSales * 100) : 0
        return [item.range, item.industry, item.sales, percent]
      })

      const option = {
        tooltip: {
          formatter: (params) => {
            const [range, industry, sales, percent] = params.value
            return `${industry} - ${range}<br/>销售额: ${this.formatWan(sales)}万<br/>占比: ${percent.toFixed(1)}%`
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
    },

    updateRankChart() {
      if (!this.rankChart) return

      if (!this.filteredData || this.filteredData.length === 0) {
        this.rankChart.clear()
        return
      }

      // 根据customerType选择正确的客户名称字段
      const nameField = this.customerType === 'ORG' ? '组织' : '客户'

      const sortedData = [...this.filteredData]
        .map(item => ({
          name: item[nameField] || '',
          value: this.getFieldValue(item, '销售额', 'current')
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            const data = sortedData[params[0].dataIndex]
            return `${data.name}<br/>销售额: ${this.formatWan(data.value)}万`
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
            formatter: (value) => {
              return Math.round(value / 10000)
            }
          },
          splitNumber: 5
        },
        yAxis: {
          type: 'category',
          data: sortedData.map(d => d.name).reverse(),
          inverse: true
        },
        series: [{
          name: '销售额',
          type: 'bar',
          data: sortedData.map(d => d.value).reverse(),
          itemStyle: {
            color: (params) => {
              const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#ffb6c1']
              return colors[params.dataIndex % colors.length]
            }
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params) => `${this.formatWan(params.value)}万`
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
      return value.toFixed(1) + '%'
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

.kpi-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
}

.kpi-change {
  font-size: 14px;
  font-weight: 600;

  &.positive {
    color: #67c23a;
  }

  &.negative {
    color: #f56c6c;
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

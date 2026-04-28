<template>
  <div class="sales-overview">
    <div class="filter-container">
      <div class="filter-section">
        <div class="filter-label">时间维度：</div>
        <el-select v-model="timeDimension" size="small" style="width: 120px;" @change="handleTimeDimensionChange">
          <el-option label="周" value="week" />
          <el-option label="月" value="month" />
          <el-option label="季度" value="quarter" />
          <el-option label="年度" value="year" />
          <el-option label="累计当前" value="cumulative" />
        </el-select>
      </div>
      <div v-if="timeDimension === 'month'" class="filter-section">
        <div class="filter-label">选择月份：</div>
        <el-select v-model="selectedMonth" size="small" style="width: 120px;" @change="handleTimeDimensionChange">
          <el-option v-for="m in 12" :key="m" :label="`${m}月`" :value="m" />
        </el-select>
      </div>
      <div v-if="timeDimension === 'quarter'" class="filter-section">
        <div class="filter-label">选择季度：</div>
        <el-select v-model="selectedQuarter" size="small" style="width: 120px;" @change="handleTimeDimensionChange">
          <el-option label="一季度" :value="1" />
          <el-option label="二季度" :value="2" />
          <el-option label="三季度" :value="3" />
          <el-option label="四季度" :value="4" />
        </el-select>
      </div>
      <div v-if="timeDimension === 'year'" class="filter-section">
        <div class="filter-label">选择年份：</div>
        <el-select v-model="selectedYear" size="small" style="width: 120px;" @change="handleTimeDimensionChange">
          <el-option v-for="y in yearOptions" :key="y" :label="`${y}年`" :value="y" />
        </el-select>
      </div>
      <div class="filter-section">
        <div class="filter-label">统计维度：</div>
        <el-radio-group v-model="summaryDimension" size="small" @change="handleDimensionChange">
          <el-radio-button value="staff">按业务员</el-radio-button>
          <el-radio-button value="parentDept">按父级部门</el-radio-button>
          <el-radio-button value="department">按部门</el-radio-button>
          <el-radio-button value="business">按业务线</el-radio-button>
          <el-radio-button value="branch">按分支机构</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="staffList.length > 0" class="filter-section">
        <div class="filter-label">业务员：</div>
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

    <div class="summary-cards">
      <el-card class="summary-card sales-card">
        <template #header>
          <div class="card-title">销售额</div>
        </template>
        <div class="summary-content">
          <div class="main-value">{{ formatCurrency(summaryData.totalSales) }}万</div>
          <div class="comparison-section">
            <div class="comparison-item">
              <span class="label">去年同期:</span>
              <span class="value">{{ formatCurrency(summaryData.lastYearSales) }}万</span>
              <span :class="summaryData.lastYearSalesDiff >= 0 ? 'diff-positive' : 'diff-negative'">
                {{ summaryData.lastYearSalesDiff >= 0 ? '+' : '' }}{{ formatCurrency(Math.abs(summaryData.lastYearSalesDiff)) }}万
                {{ summaryData.lastYearSalesRate >= 0 ? '+' : '' }}{{ summaryData.lastYearSalesRate.toFixed(2) }}%
              </span>
            </div>
            <div class="comparison-item">
              <span class="label">前年同期:</span>
              <span class="value">{{ formatCurrency(summaryData.twoYearsAgoSales) }}万</span>
              <span :class="summaryData.twoYearsAgoSalesDiff >= 0 ? 'diff-positive' : 'diff-negative'">
                {{ summaryData.twoYearsAgoSalesDiff >= 0 ? '+' : '' }}{{ formatCurrency(Math.abs(summaryData.twoYearsAgoSalesDiff)) }}万
                {{ summaryData.twoYearsAgoSalesRate >= 0 ? '+' : '' }}{{ summaryData.twoYearsAgoSalesRate.toFixed(2) }}%
              </span>
            </div>
          </div>
          <div class="target-section">
            <div class="target-item">
              <span class="label">当前目标系数:</span>
              <span class="value target-coefficient">{{ currentTargetCoefficient.toFixed(3) }}</span>
            </div>
            <div class="target-item">
              <span class="label">目标销售额:</span>
              <span class="value target-value">{{ formatCurrency(summaryData.targetSales) }}万</span>
            </div>
            <div class="target-item">
              <span class="label">目标差异:</span>
              <span :class="summaryData.targetSalesDiff >= 0 ? 'diff-positive' : 'diff-negative'">
                {{ summaryData.targetSalesDiff >= 0 ? '+' : '' }}{{ formatCurrency(summaryData.targetSalesDiff) }}万
              </span>
            </div>
            <div class="target-item">
              <span class="label">目标完成率:</span>
              <span class="value completion-rate">{{ summaryData.targetSalesRate.toFixed(2) }}%</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="summary-card profit-card">
        <template #header>
          <div class="card-title">差价</div>
        </template>
        <div class="summary-content">
          <div class="main-value">{{ formatCurrency(summaryData.totalProfit) }}万</div>
          <div class="comparison-section">
            <div class="comparison-item">
              <span class="label">去年同期:</span>
              <span class="value">{{ formatCurrency(summaryData.lastYearProfit) }}万</span>
              <span :class="summaryData.lastYearProfitDiff >= 0 ? 'diff-positive' : 'diff-negative'">
                {{ summaryData.lastYearProfitDiff >= 0 ? '+' : '' }}{{ formatCurrency(Math.abs(summaryData.lastYearProfitDiff)) }}万
                {{ summaryData.lastYearProfitRate >= 0 ? '+' : '' }}{{ summaryData.lastYearProfitRate.toFixed(2) }}%
              </span>
            </div>
            <div class="comparison-item">
              <span class="label">前年同期:</span>
              <span class="value">{{ formatCurrency(summaryData.twoYearsAgoProfit) }}万</span>
              <span :class="summaryData.twoYearsAgoProfitDiff >= 0 ? 'diff-positive' : 'diff-negative'">
                {{ summaryData.twoYearsAgoProfitDiff >= 0 ? '+' : '' }}{{ formatCurrency(Math.abs(summaryData.twoYearsAgoProfitDiff)) }}万
                {{ summaryData.twoYearsAgoProfitRate >= 0 ? '+' : '' }}{{ summaryData.twoYearsAgoProfitRate.toFixed(2) }}%
              </span>
            </div>
          </div>
          <div class="target-section">
            <div class="target-item">
              <span class="label">当前目标系数:</span>
              <span class="value target-coefficient">{{ currentTargetCoefficient.toFixed(4) }}</span>
            </div>
            <div class="target-item">
              <span class="label">目标差价:</span>
              <span class="value target-value">{{ formatCurrency(summaryData.targetProfit) }}万</span>
            </div>
            <div class="target-item">
              <span class="label">目标差异:</span>
              <span :class="summaryData.targetProfitDiff >= 0 ? 'diff-positive' : 'diff-negative'">
                {{ summaryData.targetProfitDiff >= 0 ? '+' : '' }}{{ formatCurrency(summaryData.targetProfitDiff) }}万
              </span>
            </div>
            <div class="target-item">
              <span class="label">目标完成率:</span>
              <span class="value completion-rate">{{ summaryData.targetProfitRate.toFixed(2) }}%</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="chart-section">
      <h3 class="section-title">{{ getDimensionLabel }}销售数据</h3>
      <div ref="chartRef" class="chart-container" />
    </div>

    <div class="completion-rate-section">
      <h3 class="section-title">销售完成率情况</h3>
      <el-table :data="tableData" border stripe style="width: 100%; margin-top: 15px;">
        <el-table-column prop="category" :label="getDimensionLabel" width="130" />
        <el-table-column prop="mbSales" label="年销售额目标" width="110">
          <template #default="scope">
            <span style="color: #000000; ">{{ formatCurrency(scope.row.mbSales) }}万</span>
          </template>
        </el-table-column>
        <el-table-column prop="mbProfit" label="年差价目标" width="110">
          <template #default="scope">
            <span style="color: #000000; ">{{ formatCurrency(scope.row.mbProfit) }}万</span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销售额" width="110">
          <template #default="scope">
            <span style="font-weight: bold; color: #f56c6c;">{{ formatCurrency(scope.row.sales) }}万</span>
          </template>
        </el-table-column>
        <el-table-column prop="profit" label="差价" width="100">
          <template #default="scope">
            <span style="font-weight: bold; color: #009688;">{{ formatCurrency(scope.row.profit) }}万</span>
          </template>
        </el-table-column>
        <el-table-column label="销售额达标" width="110" align="center">
          <template #default="scope">
            <div>
              <span :style="{ color: (scope.row.salesCompletionRate / 100 - scope.row.salesDiffBase) >= 0 ? '#f56c6c' : '#303133', fontWeight: '600' }">
                {{ (scope.row.salesCompletionRate / 100 - scope.row.salesDiffBase) >= 0 ? '达标' : '未达标' }}
              </span>
              <div style="font-size: 12px; margin-top: 4px;">
                <span :style="{ color: (scope.row.salesCompletionRate / 100 - scope.row.salesDiffBase) >= 0 ? '#f56c6c' : '#909399', fontWeight: '700' }">
                  {{ (scope.row.salesCompletionRate / 100 - scope.row.salesDiffBase) >= 0 ? '+' : '' }}{{ ((scope.row.salesCompletionRate / 100 - scope.row.salesDiffBase) * 100).toFixed(2) }}%
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="差价达标" width="110" align="center">
          <template #default="scope">
            <div>
              <span :style="{ color: (scope.row.profitCompletionRate / 100 - scope.row.profitDiffBase) >= 0 ? '#f56c6c' : '#303133', fontWeight: '600' }">
                {{ (scope.row.profitCompletionRate / 100 - scope.row.profitDiffBase) >= 0 ? '达标' : '未达标' }}
              </span>
              <div style="font-size: 12px; margin-top: 4px;">
                <span :style="{ color: (scope.row.profitCompletionRate / 100 - scope.row.profitDiffBase) >= 0 ? '#f56c6c' : '#909399', fontWeight: '700' }">
                  {{ (scope.row.profitCompletionRate / 100 - scope.row.profitDiffBase) >= 0 ? '+' : '' }}{{ ((scope.row.profitCompletionRate / 100 - scope.row.profitDiffBase) * 100).toFixed(2) }}%
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="当前系数" width="90" align="center">
          <template #default="scope">
            <span style="color: #e6a23c;">{{ currentTargetCoefficient.toFixed(3) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="targetSales" label="目标销售额" width="110">
          <template #default="scope">
            <span style="color: #000000;">{{ formatCurrency(scope.row.targetSales) }}万</span>
          </template>
        </el-table-column>
        <el-table-column prop="targetProfit" label="目标差价" width="100">
          <template #default="scope">
            <span style="color: #000000;">{{ formatCurrency(scope.row.targetProfit) }}万</span>
          </template>
        </el-table-column>
        <el-table-column prop="salesCompletionRate" label="销售额完成率" width="110" align="center">
          <template #default="scope">
            <span :style="{ color: scope.row.salesCompletionRate >= 100 ? '#f56c6c' : '#67c23a', fontWeight: '600' }">
              {{ scope.row.salesCompletionRate.toFixed(2) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="profitCompletionRate" label="差价完成率" width="100" align="center">
          <template #default="scope">
            <span :style="{ color: scope.row.profitCompletionRate >= 100 ? '#f56c6c' : '#67c23a', fontWeight: '600' }">
              {{ scope.row.profitCompletionRate.toFixed(2) }}%
            </span>
          </template>
        </el-table-column>

      </el-table>
    </div>

    <div v-if="!hasData && !listLoading" class="no-data-tip">
      <el-empty description="暂无数据" />
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getSalesTarget, getSalesProfitReport } from '@/api/dataPlatform'
import { getAssessmentTargets } from '@/api/enterprise/user'
import { isAdmin, getCurrentUserName, getDataPermissions, getFirstDataPermissionName } from '@/utils/permission'

export default {
  name: 'SalesOverview',
  data() {
    return {
      summaryDimension: 'staff',
      timeDimension: 'cumulative',
      coefficientType: 'year',
      listLoading: false,
      currentData: [],
      lastYearData: [],
      twoYearsAgoData: [],
      displayData: [],
      hasData: false,
      currentTargetCoefficient: 1,
      chartRef: null,
      chartInstance: null,
      apiData: {
        chartData: []
      },
      selectedMonth: new Date().getMonth() + 1,
      selectedQuarter: Math.ceil((new Date().getMonth() + 1) / 3),
      selectedYear: new Date().getFullYear(),
      summaryData: {
        totalSales: 0,
        lastYearSales: 0,
        twoYearsAgoSales: 0,
        lastYearSalesDiff: 0,
        twoYearsAgoSalesDiff: 0,
        lastYearSalesRate: 0,
        twoYearsAgoSalesRate: 0,
        targetSales: 0,
        targetSalesDiff: 0,
        targetSalesRate: 0,
        totalProfit: 0,
        lastYearProfit: 0,
        twoYearsAgoProfit: 0,
        lastYearProfitDiff: 0,
        twoYearsAgoProfitDiff: 0,
        lastYearProfitRate: 0,
        twoYearsAgoProfitRate: 0,
        targetProfit: 0,
        targetProfitDiff: 0,
        targetProfitRate: 0
      },
      staffList: [],
      selectedStaffs: [],
      // 常量定义
      DIMENSION_KEY_MAP: {
        staff: '业务员',
        parentDept: '父级部门',
        department: '部门',
        business: '业务线',
        branch: '分支机构'
      },
      QUARTER_COEFFICIENTS: [0.17, 0.23, 0.27, 0.33],
      QUARTER_DAYS: [89, 92, 92, 92],
      TOOLTIP_COLORS: {
        sales: '#ff7875',
        profit: '#69c0ff',
        positive: '#ff4d4f',
        negative: '#73d13d',
        muted: '#888',
        light: '#aaa',
        text: '#fff',
        border: '#555',
        bg: 'rgba(50, 50, 50, 0.95)'
      }
    }
  },
  computed: {
    yearOptions() {
      const currentYear = new Date().getFullYear()
      const years = []
      for (let y = currentYear; y >= 2018; y--) {
        years.push(y)
      }
      return years
    },
    getDimensionLabel() {
      return this.DIMENSION_KEY_MAP[this.summaryDimension] || '业务员'
    },
    tableData() {
      const currentData = this.currentData || []
      const coefficient = this.currentTargetCoefficient || 0

      const dimensionKey = this.DIMENSION_KEY_MAP[this.summaryDimension] || '业务员'

      const groupedData = new Map()
      currentData.forEach(item => {
        const category = item.category || item[dimensionKey] || ''
        if (!category) return

        if (!groupedData.has(category)) {
          groupedData.set(category, {
            category,
            MB_sales: 0,
            MB_profit: 0,
            '含税销售额': 0,
            '不含税毛利差价': 0
          })
        }
        const group = groupedData.get(category)
        group.MB_sales += parseFloat(item.MB_sales) || parseFloat(item.mbSales) || 0
        group.MB_profit += parseFloat(item.MB_profit) || parseFloat(item.mbProfit) || 0
        group['含税销售额'] += parseFloat(item['含税销售额']) || 0
        group['不含税毛利差价'] += parseFloat(item['不含税毛利差价']) || 0
      })

      let processedData = Array.from(groupedData.values()).map(item => {
        const mbSales = item.MB_sales
        const mbProfit = item.MB_profit
        const targetSales = coefficient * mbSales
        const targetProfit = coefficient * mbProfit
        const sales = item['含税销售额']
        const profit = item['不含税毛利差价']
        let salesCompletionRate = 0
        let profitCompletionRate = 0

        if (this.timeDimension === 'cumulative') {
          // 累计当前维度：当前销售额/年销售额目标，当年差价/年差价目标，差值基数用 currentTargetCoefficient
          salesCompletionRate = mbSales > 0 ? (sales / mbSales) * 100 : 0
          profitCompletionRate = mbProfit > 0 ? (profit / mbProfit) * 100 : 0
        } else {
          // 其他维度：当前销售额/目标销售额，当年差价/目标差价，差值基数用 1 (即100%)
          salesCompletionRate = targetSales > 0 ? (sales / targetSales) * 100 : 0
          profitCompletionRate = targetProfit > 0 ? (profit / targetProfit) * 100 : 0
        }

        const diffBase = this.timeDimension === 'cumulative' ? this.currentTargetCoefficient : 1

        return {
          ...item,
          category: item.category,
          mbSales,
          mbProfit,
          targetSales,
          targetProfit,
          sales,
          profit,
          salesCompletionRate,
          profitCompletionRate,
          salesDiffBase: diffBase,
          profitDiffBase: diffBase
        }
      })

      processedData = processedData.filter(item => item.sales > 0 || item.profit > 0)
      processedData.sort((a, b) => b.sales - a.sales)
      return processedData
    }
  },
  mounted() {
    this.fetchData()
    this.calculateCoefficient()
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.dispose()
    }
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      const currentUserName = getCurrentUserName()
      const admin = isAdmin()
      const dataPermissions = getDataPermissions()
      let employeeName = ''
      let permissionValue = ''
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

      if (permissionValue === 'ALL') {
        try {
          const res = await getAssessmentTargets()
          const data = res.data || res
          const targets = data.list || data.items || (Array.isArray(data) ? data : [])
          employeeName = targets.map(item => item.realName || item.name || item.loginName).filter(n => n).join(',')
        } catch (err) {
          console.error('获取考核对象列表失败:', err)
        }
      }

      let staffName = employeeName

      if (this.selectedStaffs && this.selectedStaffs.length > 0) {
        staffName = this.selectedStaffs.join(',')
      } else if (!employeeName && permissionValue !== 'ALL') {
        staffName = currentUserName
      }

      this.staffList = employeeName ? employeeName.split(',').map(n => n.trim()).filter(n => n) : []

      const { startDate, endDate } = this.getDateRange()

      let currentYear = new Date().getFullYear()
      let lastYearStartDate = ''
      let lastYearEndDate = ''
      let twoYearsAgoStartDate = ''
      let twoYearsAgoEndDate = ''

      if (this.timeDimension === 'year') {
        const selectedYear = this.selectedYear
        currentYear = selectedYear
        lastYearStartDate = `${selectedYear - 1}-01-01`
        lastYearEndDate = `${selectedYear - 1 + 1}-01-01`
        twoYearsAgoStartDate = `${selectedYear - 2}-01-01`
        twoYearsAgoEndDate = `${selectedYear - 2 + 1}-01-01`
      } else {
        lastYearStartDate = `${currentYear - 1}-${startDate.substring(5)}`
        lastYearEndDate = `${currentYear - 1}-${endDate.substring(5)}`
        twoYearsAgoStartDate = `${currentYear - 2}-${startDate.substring(5)}`
        twoYearsAgoEndDate = `${currentYear - 2}-${endDate.substring(5)}`
      }

      const currentParams = {
        startDate,
        endDate
      }

      if (permissionValue !== 'ALL' && staffName) {
        currentParams.staffName = staffName
      } else if (this.selectedStaffs && this.selectedStaffs.length > 0) {
        currentParams.staffName = staffName
      }

      const lastYearParams = {
        startDate: lastYearStartDate,
        endDate: lastYearEndDate
      }

      if (permissionValue !== 'ALL' && staffName) {
        lastYearParams.staffName = staffName
      } else if (this.selectedStaffs && this.selectedStaffs.length > 0) {
        lastYearParams.staffName = staffName
      }

      const twoYearsAgoParams = {
        startDate: twoYearsAgoStartDate,
        endDate: twoYearsAgoEndDate
      }

      if (permissionValue !== 'ALL' && staffName) {
        twoYearsAgoParams.staffName = staffName
      } else if (this.selectedStaffs && this.selectedStaffs.length > 0) {
        twoYearsAgoParams.staffName = staffName
      }

      try {
        const [currentResponse, lastYearResponse, twoYearsAgoResponse] = await Promise.all([
          getSalesProfitReport(currentParams),
          getSalesProfitReport(lastYearParams),
          getSalesProfitReport(twoYearsAgoParams)
        ])

        this.processAndMergeData(currentResponse, lastYearResponse, twoYearsAgoResponse)
      } catch (error) {
        console.error('获取销售数据失败:', error)
      } finally {
        this.listLoading = false
      }
    },

    processAndMergeData(currentResponse, lastYearResponse, twoYearsAgoResponse) {
      const currentUserName = getCurrentUserName()
      const admin = isAdmin()
      const dataPermissions = getDataPermissions()

      let employeeRealName = ''
      let permissionValue = ''
      for (let i = 0; i < dataPermissions.length; i++) {
        const dataPerm = dataPermissions[i]
        if (dataPerm.permissions && Array.isArray(dataPerm.permissions)) {
          for (let j = 0; j < dataPerm.permissions.length; j++) {
            const perm = dataPerm.permissions[j]
            if (perm.permissionType && perm.permissionType.toLowerCase() === 'employee') {
              employeeRealName = perm.permissionName || ''
              permissionValue = perm.permissionValue || ''
              break
            }
          }
          if (employeeRealName) break
        }
        if (dataPerm.permissionType && dataPerm.permissionType.toLowerCase() === 'employee') {
          employeeRealName = dataPerm.permissionName || ''
          permissionValue = dataPerm.permissionValue || ''
          break
        }
      }

      const currentUserRealName = employeeRealName || currentUserName

      const dimensionKey = this.DIMENSION_KEY_MAP[this.summaryDimension] || '业务员'

      const processData = (data) => {
        if (!data) {
          console.log('processData: no data')
          return []
        }
        let dataArray = null
        if (Array.isArray(data)) {
          dataArray = data
        } else if (data.data && Array.isArray(data.data)) {
          dataArray = data.data
        }
        if (!dataArray) {
          console.log('processData: no array found')
          return []
        }

        const userNameList = currentUserRealName.split(',').map(n => n.trim()).filter(n => n)

        return dataArray.filter(item => {
          if (admin || permissionValue === 'ALL') return true
          if (this.summaryDimension === 'staff') {
            const salesStaff = item['业务员'] || ''
            return userNameList.includes(salesStaff) || item['业务员'] === currentUserName
          } else if (this.summaryDimension === 'parentDept') {
            return item['父级部门']
          } else if (this.summaryDimension === 'department') {
            return item['部门'] || item['父级部门']
          } else if (this.summaryDimension === 'business') {
            return item['业务线']
          } else if (this.summaryDimension === 'branch') {
            return item['分支机构']
          }
          return true
        }).map(item => ({
          ...item,
          category: item[dimensionKey] || ''
        }))
      }

      this.currentData = processData(currentResponse)
      this.lastYearData = processData(lastYearResponse)
      this.twoYearsAgoData = processData(twoYearsAgoResponse)
      this.mergeAndDisplayData()
      this.calculateSummaryData()
      this.$nextTick(() => {
        this.updateChart()
      })
    },

    mergeAndDisplayData() {
      const currentUserName = getCurrentUserName()
      const admin = isAdmin()
      const dataPermissions = getDataPermissions()

      let employeeRealName = ''
      for (let i = 0; i < dataPermissions.length; i++) {
        const dataPerm = dataPermissions[i]
        if (dataPerm.permissions && Array.isArray(dataPerm.permissions)) {
          for (let j = 0; j < dataPerm.permissions.length; j++) {
            const perm = dataPerm.permissions[j]
            if (perm.permissionType && perm.permissionType.toLowerCase() === 'employee') {
              employeeRealName = perm.permissionName || ''
              break
            }
          }
          if (employeeRealName) break
        }
        if (dataPerm.permissionType && dataPerm.permissionType.toLowerCase() === 'employee') {
          employeeRealName = dataPerm.permissionName || ''
          break
        }
      }

      const currentUserRealName = employeeRealName || currentUserName

      const dimensionKey = this.DIMENSION_KEY_MAP[this.summaryDimension]

      if (this.summaryDimension === 'parentDept') {
        const parentDeptMap = new Map()
        const processParentDeptData = (dataList) => {
          dataList.forEach(item => {
            const parentDeptName = item['父级部门'] || ''
            if (!parentDeptName) return
            if (!admin && !item['staffList']?.includes(currentUserRealName) && !item['staffList']?.includes(currentUserName)) {
              return
            }
            if (!parentDeptMap.has(parentDeptName)) {
              parentDeptMap.set(parentDeptName, {
                '父级部门': parentDeptName,
                '含税销售额': 0, '未税销售额': 0,
                '含税毛利': 0, '未税毛利+': 0,
                '不含税毛利调整-': 0, '折扣-': 0,
                '年底补税差-': 0, '平台抽点费-': 0,
                '不含税毛利差价': 0,
                staffList: new Set()
              })
            }
            const parentDeptItem = parentDeptMap.get(parentDeptName)
            parentDeptItem['含税销售额'] += (parseFloat(item['含税销售额']) || 0)
            parentDeptItem['未税销售额'] += (parseFloat(item['未税销售额']) || 0)
            parentDeptItem['含税毛利'] += (parseFloat(item['含税毛利']) || 0)
            parentDeptItem['未税毛利+'] += (parseFloat(item['未税毛利+']) || 0)
            parentDeptItem['不含税毛利调整-'] += (parseFloat(item['不含税毛利调整-']) || 0)
            parentDeptItem['折扣-'] += (parseFloat(item['折扣-']) || 0)
            parentDeptItem['年底补税差-'] += (parseFloat(item['年底补税差-']) || 0)
            parentDeptItem['平台抽点费-'] += (parseFloat(item['平台抽点费-']) || 0)
            parentDeptItem['不含税毛利差价'] += (parseFloat(item['不含税毛利差价']) || 0)
            if (item['业务员']) {
              parentDeptItem.staffList.add(item['业务员'])
            }
          })
        }
        processParentDeptData(this.currentData)
        this.displayData = Array.from(parentDeptMap.values()).map(item => ({
          ...item,
          staffList: Array.from(item.staffList)
        }))
      } else if (this.summaryDimension === 'department') {
        const deptMap = new Map()
        const processDeptData = (dataList) => {
          dataList.forEach(item => {
            const deptName = item['部门'] || item['父级部门'] || ''
            if (!deptName) return
            if (!admin && !item['staffList']?.includes(currentUserRealName) && !item['staffList']?.includes(currentUserName)) {
              return
            }
            if (!deptMap.has(deptName)) {
              deptMap.set(deptName, {
                '部门': deptName,
                '含税销售额': 0, '未税销售额': 0,
                '含税毛利': 0, '未税毛利+': 0,
                '不含税毛利调整-': 0, '折扣-': 0,
                '年底补税差-': 0, '平台抽点费-': 0,
                '不含税毛利差价': 0,
                staffList: new Set()
              })
            }
            const deptItem = deptMap.get(deptName)
            deptItem['含税销售额'] += (parseFloat(item['含税销售额']) || 0)
            deptItem['未税销售额'] += (parseFloat(item['未税销售额']) || 0)
            deptItem['含税毛利'] += (parseFloat(item['含税毛利']) || 0)
            deptItem['未税毛利+'] += (parseFloat(item['未税毛利+']) || 0)
            deptItem['不含税毛利调整-'] += (parseFloat(item['不含税毛利调整-']) || 0)
            deptItem['折扣-'] += (parseFloat(item['折扣-']) || 0)
            deptItem['年底补税差-'] += (parseFloat(item['年底补税差-']) || 0)
            deptItem['平台抽点费-'] += (parseFloat(item['平台抽点费-']) || 0)
            deptItem['不含税毛利差价'] += (parseFloat(item['不含税毛利差价']) || 0)
            if (item['业务员']) {
              deptItem.staffList.add(item['业务员'])
            }
          })
        }
        processDeptData(this.currentData)
        this.displayData = Array.from(deptMap.values()).map(item => ({
          ...item,
          staffList: Array.from(item.staffList)
        }))
      } else if (this.summaryDimension === 'business') {
        const businessMap = new Map()
        const processBusinessData = (dataList) => {
          dataList.forEach(item => {
            const businessLine = item['业务线'] || ''
            if (!businessLine) return
            if (!admin && !item['staffList']?.includes(currentUserRealName) && !item['staffList']?.includes(currentUserName)) {
              return
            }
            if (!businessMap.has(businessLine)) {
              businessMap.set(businessLine, {
                '业务线': businessLine,
                '含税销售额': 0, '未税销售额': 0,
                '含税毛利': 0, '未税毛利+': 0,
                '不含税毛利调整-': 0, '折扣-': 0,
                '年底补税差-': 0, '平台抽点费-': 0,
                '不含税毛利差价': 0,
                staffList: new Set()
              })
            }
            const bizItem = businessMap.get(businessLine)
            bizItem['含税销售额'] += (parseFloat(item['含税销售额']) || 0)
            bizItem['未税销售额'] += (parseFloat(item['未税销售额']) || 0)
            bizItem['含税毛利'] += (parseFloat(item['含税毛利']) || 0)
            bizItem['未税毛利+'] += (parseFloat(item['未税毛利+']) || 0)
            bizItem['不含税毛利调整-'] += (parseFloat(item['不含税毛利调整-']) || 0)
            bizItem['折扣-'] += (parseFloat(item['折扣-']) || 0)
            bizItem['年底补税差-'] += (parseFloat(item['年底补税差-']) || 0)
            bizItem['平台抽点费-'] += (parseFloat(item['平台抽点费-']) || 0)
            bizItem['不含税毛利差价'] += (parseFloat(item['不含税毛利差价']) || 0)
            if (item['业务员']) {
              bizItem.staffList.add(item['业务员'])
            }
          })
        }
        processBusinessData(this.currentData)
        this.displayData = Array.from(businessMap.values()).map(item => ({
          ...item,
          staffList: Array.from(item.staffList)
        }))
      } else if (this.summaryDimension === 'branch') {
        const branchMap = new Map()
        const processBranchData = (dataList) => {
          dataList.forEach(item => {
            const branchName = item['分支机构'] || ''
            if (!branchName) return
            if (!admin && !item['staffList']?.includes(currentUserRealName) && !item['staffList']?.includes(currentUserName)) {
              return
            }
            if (!branchMap.has(branchName)) {
              branchMap.set(branchName, {
                '分支机构': branchName,
                '含税销售额': 0, '未税销售额': 0,
                '含税毛利': 0, '未税毛利+': 0,
                '不含税毛利调整-': 0, '折扣-': 0,
                '年底补税差-': 0, '平台抽点费-': 0,
                '不含税毛利差价': 0,
                staffList: new Set()
              })
            }
            const branchItem = branchMap.get(branchName)
            branchItem['含税销售额'] += (parseFloat(item['含税销售额']) || 0)
            branchItem['未税销售额'] += (parseFloat(item['未税销售额']) || 0)
            branchItem['含税毛利'] += (parseFloat(item['含税毛利']) || 0)
            branchItem['未税毛利+'] += (parseFloat(item['未税毛利+']) || 0)
            branchItem['不含税毛利调整-'] += (parseFloat(item['不含税毛利调整-']) || 0)
            branchItem['折扣-'] += (parseFloat(item['折扣-']) || 0)
            branchItem['年底补税差-'] += (parseFloat(item['年底补税差-']) || 0)
            branchItem['平台抽点费-'] += (parseFloat(item['平台抽点费-']) || 0)
            branchItem['不含税毛利差价'] += (parseFloat(item['不含税毛利差价']) || 0)
            if (item['业务员']) {
              branchItem.staffList.add(item['业务员'])
            }
          })
        }
        processBranchData(this.currentData)
        this.displayData = Array.from(branchMap.values()).map(item => ({
          ...item,
          staffList: Array.from(item.staffList)
        }))
      } else {
        const staffMap = new Map()
        const processStaffData = (dataList) => {
          dataList.forEach(item => {
            const staffName = item['业务员'] || ''
            if (!staffName) return
            if (!admin && staffName !== currentUserRealName && staffName !== currentUserName) {
              return
            }
            if (!staffMap.has(staffName)) {
              staffMap.set(staffName, {
                '业务员': staffName,
                '含税销售额': 0, '未税销售额': 0,
                '含税毛利': 0, '未税毛利+': 0,
                '不含税毛利调整-': 0, '折扣-': 0,
                '年底补税差-': 0, '平台抽点费-': 0,
                '不含税毛利差价': 0
              })
            }
            const staffItem = staffMap.get(staffName)
            staffItem['含税销售额'] += (parseFloat(item['含税销售额']) || 0)
            staffItem['未税销售额'] += (parseFloat(item['未税销售额']) || 0)
            staffItem['含税毛利'] += (parseFloat(item['含税毛利']) || 0)
            staffItem['未税毛利+'] += (parseFloat(item['未税毛利+']) || 0)
            staffItem['不含税毛利调整-'] += (parseFloat(item['不含税毛利调整-']) || 0)
            staffItem['折扣-'] += (parseFloat(item['折扣-']) || 0)
            staffItem['年底补税差-'] += (parseFloat(item['年底补税差-']) || 0)
            staffItem['平台抽点费-'] += (parseFloat(item['平台抽点费-']) || 0)
            staffItem['不含税毛利差价'] += (parseFloat(item['不含税毛利差价']) || 0)
          })
        }
        processStaffData(this.currentData)
        this.displayData = Array.from(staffMap.values())
      }

      this.hasData = this.displayData && this.displayData.length > 0
    },

    calculateSummaryData() {
      const currentData = this.currentData || []
      const coefficient = this.currentTargetCoefficient || 0

      let totalMbSales = 0
      let totalMbProfit = 0
      let totalSales = 0
      let totalProfit = 0
      let lastYearSales = 0
      let lastYearProfit = 0
      let twoYearsAgoSales = 0
      let twoYearsAgoProfit = 0

      currentData.forEach(item => {
        totalMbSales += (parseFloat(item.MB_sales) || parseFloat(item.mbSales) || 0)
        totalMbProfit += (parseFloat(item.MB_profit) || parseFloat(item.mbProfit) || 0)
        totalSales += (parseFloat(item['含税销售额']) || parseFloat(item.sales) || 0)
        totalProfit += (parseFloat(item['不含税毛利差价']) || parseFloat(item.profit) || 0)
      })

      const targetSales = coefficient * totalMbSales
      const targetProfit = coefficient * totalMbProfit

      if (this.lastYearData && Array.isArray(this.lastYearData)) {
        this.lastYearData.forEach(item => {
          lastYearSales += (parseFloat(item['含税销售额']) || parseFloat(item.sales) || 0)
          lastYearProfit += (parseFloat(item['不含税毛利差价']) || parseFloat(item.profit) || 0)
        })
      }

      if (this.twoYearsAgoData && Array.isArray(this.twoYearsAgoData)) {
        this.twoYearsAgoData.forEach(item => {
          twoYearsAgoSales += (parseFloat(item['含税销售额']) || parseFloat(item.sales) || 0)
          twoYearsAgoProfit += (parseFloat(item['不含税毛利差价']) || parseFloat(item.profit) || 0)
        })
      }

      this.summaryData = {
        totalSales,
        lastYearSales,
        twoYearsAgoSales,
        lastYearSalesDiff: totalSales - lastYearSales,
        twoYearsAgoSalesDiff: totalSales - twoYearsAgoSales,
        lastYearSalesRate: lastYearSales > 0 ? ((totalSales - lastYearSales) / lastYearSales) * 100 : 0,
        twoYearsAgoSalesRate: twoYearsAgoSales > 0 ? ((totalSales - twoYearsAgoSales) / twoYearsAgoSales) * 100 : 0,
        targetSales,
        targetSalesDiff: totalSales - targetSales,
        targetSalesRate: targetSales > 0 ? (totalSales / targetSales) * 100 : 0,
        totalProfit,
        lastYearProfit,
        twoYearsAgoProfit,
        lastYearProfitDiff: totalProfit - lastYearProfit,
        twoYearsAgoProfitDiff: totalProfit - twoYearsAgoProfit,
        lastYearProfitRate: lastYearProfit > 0 ? ((totalProfit - lastYearProfit) / lastYearProfit) * 100 : 0,
        twoYearsAgoProfitRate: twoYearsAgoProfit > 0 ? ((totalProfit - twoYearsAgoProfit) / twoYearsAgoProfit) * 100 : 0,
        targetProfit,
        targetProfitDiff: totalProfit - targetProfit,
        targetProfitRate: targetProfit > 0 ? (totalProfit / targetProfit) * 100 : 0
      }
    },

    handleDimensionChange() {
      this.fetchData()
    },

    handleTimeDimensionChange() {
      this.calculateCoefficient()
      this.fetchData()
    },

    handleStaffChange() {
      this.fetchData()
    },
    /**
     * 计算当前时间维度的系数
     */
    calculateCoefficient() {
      const today = new Date()
      const currentMonth = today.getMonth() + 1
      const currentDay = today.getDate()

      const selectedMonth = this.selectedMonth
      const selectedQuarter = this.selectedQuarter
      const selectedYear = this.selectedYear

      // 季度系数（全年为1）
      const qc = this.QUARTER_COEFFICIENTS
      // 各季度天数（近似值）
      const qd = this.QUARTER_DAYS

      let quarterCoefficient = 0

      if (currentMonth >= 1 && currentMonth <= 3) {
        quarterCoefficient = qc[0]
      } else if (currentMonth >= 4 && currentMonth <= 6) {
        quarterCoefficient = qc[1]
      } else if (currentMonth >= 7 && currentMonth <= 9) {
        quarterCoefficient = qc[2]
      } else {
        quarterCoefficient = qc[3]
      }

      const monthCoefficient = quarterCoefficient / 3
      const weekCoefficient = monthCoefficient / 4
      const weekCoefficientFixed = quarterCoefficient / 3 / 4

      // 累计当前系数
      const q1Coeff = qc[0]
      const q2Coeff = qc[1]
      const q3Coeff = qc[2]
      const q4Coeff = qc[3]

      let cumulativeCoefficient = 0
      if (currentMonth >= 1 && currentMonth <= 3) {
        cumulativeCoefficient = q1Coeff / qd[0] * currentDay
      } else if (currentMonth >= 4 && currentMonth <= 6) {
        cumulativeCoefficient = q1Coeff + q2Coeff / qd[1] * currentDay
      } else if (currentMonth >= 7 && currentMonth <= 9) {
        cumulativeCoefficient = q1Coeff + q2Coeff + (q3Coeff / qd[2] * currentDay)
      } else {
        cumulativeCoefficient = q1Coeff + q2Coeff + q3Coeff + (q4Coeff / qd[3] * currentDay)
      }

      // 月系数：根据选择的月份计算
      const getMonthCoefficientByMonth = (month) => {
        const monthQuarter = Math.ceil(month / 3)
        const monthInQuarter = ((month - 1) % 3) + 1
        return qc[monthQuarter - 1] / 3
      }

      // 季度系数：根据选择的季度计算
      const getQuarterCoefficientByQuarter = (quarter) => {
        return qc[quarter - 1]
      }
      // 计算当前时间维度的系数
      switch (this.timeDimension) {
        case 'year':
          this.currentTargetCoefficient = 1
          break
        case 'quarter':
          this.currentTargetCoefficient = getQuarterCoefficientByQuarter(selectedQuarter)
          break
        case 'month':
          this.currentTargetCoefficient = getMonthCoefficientByMonth(selectedMonth)
          break
        case 'week':
          this.currentTargetCoefficient = weekCoefficientFixed
          break
        case 'cumulative':
          this.currentTargetCoefficient = cumulativeCoefficient
          break
        default:
          this.currentTargetCoefficient = 1
      }
      this.calculateSummaryData()
    },

    getDateRange() {
      const today = new Date()
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() + 1
      const currentDay = today.getDate()
      const dayOfWeek = today.getDay()

      let startDate = ''
      let endDate = ''

      const useYear = this.timeDimension === 'year' ? this.selectedYear : currentYear

      switch (this.timeDimension) {
        case 'week':
          const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
          const monday = new Date(today)
          monday.setDate(today.getDate() + mondayOffset)
          const sunday = new Date(monday)
          sunday.setDate(monday.getDate() + 6)
          startDate = monday.toISOString().split('T')[0]
          endDate = sunday.toISOString().split('T')[0]
          break
        case 'month':
          const selectedMonth = this.selectedMonth
          const nextMonth = selectedMonth + 1
          startDate = `${useYear}-${String(selectedMonth).padStart(2, '0')}-01`
          const lastDayOfMonth = new Date(useYear, selectedMonth, 0).getDate()
          endDate = `${useYear}-${String(nextMonth).padStart(2, '0')}-01`
          break
        case 'quarter':
          const selectedQuarter = this.selectedQuarter
          const quarterStartMonth = (selectedQuarter - 1) * 3 + 1
          startDate = `${useYear}-${String(quarterStartMonth).padStart(2, '0')}-01`
          const nextQuarterStartMonth = quarterStartMonth + 3
          endDate = `${useYear}-${String(nextQuarterStartMonth).padStart(2, '0')}-01`
          break
        case 'year':
          const selectedYear = this.selectedYear
          startDate = `${selectedYear}-01-01`
          endDate = `${selectedYear + 1}-01-01`
          break
        case 'cumulative':
          startDate = `${currentYear}-01-01`
          const tomorrow = new Date(today)
          tomorrow.setDate(today.getDate() + 1)
          endDate = tomorrow.toISOString().split('T')[0]
          break
        default:
          startDate = `${currentYear}-01-01`
          endDate = `${currentYear + 1}-01-01`
      }

      return { startDate, endDate }
    },
    /**
     * 格式化数字，保留2位小数，超过10000时添加万
     */
    formatNumber(value) {
      if (value === null || value === undefined || isNaN(value)) {
        return '-'
      }
      const num = parseFloat(value)
      if (num >= 10000) {
        return (num / 10000).toFixed(2) + ' 万'
      }
      return num.toFixed(2)
    },
    /**
     * 初始化图表
     */
    initChart() {
      this.chartRef = this.$refs.chartRef
      if (!this.chartRef) return

      // 销毁旧实例
      if (this.chartInstance) {
        this.chartInstance.dispose()
        this.chartInstance = null
      }

      this.chartInstance = echarts.init(this.chartRef)
      this.chartInstance.on('click', this.handleChartClick)

      // 延迟调用 updateChart
      this.$nextTick(() => {
        this.updateChart()
      })

      window.addEventListener('resize', () => {
        if (this.chartInstance) {
          this.chartInstance.resize()
        }
      })
    },
    /**
     * 更新图表
     */
    updateChart() {
      if (!this.chartInstance || !this.tableData || this.tableData.length === 0) return

      // 保存到局部变量，避免 ECharts formatter 中 this 上下文问题
      const tableData = this.tableData
      const timeDimension = this.timeDimension
      const currentTargetCoefficient = this.currentTargetCoefficient

      const timeDimensionLabel = {
        week: '周',
        month: '月',
        quarter: '季度',
        year: '年',
        cumulative: '累计'
      }
      const currentTimeLabel = timeDimensionLabel[timeDimension] || '期'
      const data = tableData.slice(0, 10)
      const categories = data.map(item => item.category || '-')
      const diffBase = timeDimension === 'cumulative' ? currentTargetCoefficient : 1

      // 提取 tooltip 数据，只计算一次
      const tooltipDataList = data.map(item => {
        const sales = item.sales || 0
        const profit = item.profit || 0
        const targetSales = item.targetSales || 0
        const targetProfit = item.targetProfit || 0
        const salesCompletionRate = item.salesCompletionRate || 0
        const profitCompletionRate = item.profitCompletionRate || 0
        return {
          category: item.category || '',
          sales,
          profit,
          targetSales,
          targetProfit,
          salesCompletionRate,
          profitCompletionRate,
          salesDiff: salesCompletionRate / 100 - diffBase,
          profitDiff: profitCompletionRate / 100 - diffBase
        }
      })

      // 复用 tooltip 数据
      const salesData = data.map((item, i) => ({
        value: (item.sales || 0) / 10000,
        _tooltip: tooltipDataList[i]
      }))
      const profitData = data.map((item, i) => ({
        value: (item.profit || 0) / 10000,
        _tooltip: tooltipDataList[i]
      }))

      const option = {
        tooltip: {
          show: true,
          trigger: 'item',
          z: 1000,
          backgroundColor: this.TOOLTIP_COLORS.bg,
          borderColor: '#333',
          borderWidth: 1,
          textStyle: {
            color: this.TOOLTIP_COLORS.text,
            fontSize: 13
          },
          formatter: function(params) {
            var tooltipData = params.data._tooltip
            if (!tooltipData) return params.name + ': ' + params.value

            var salesDiff = tooltipData.sales - tooltipData.targetSales
            var profitDiff = tooltipData.profit - tooltipData.targetProfit
            var salesRateDiff = tooltipData.salesCompletionRate / 100 - currentTargetCoefficient
            var profitRateDiff = tooltipData.profitCompletionRate / 100 - currentTargetCoefficient
            var c = this.TOOLTIP_COLORS

            var html = '<div style="font-size:14px;font-weight:bold;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid ' + c.border + ';">' + tooltipData.category + '</div>'

            html += '<div style="margin-bottom:6px;">'
            html += '<span style="color:' + c.sales + ';font-weight:bold;">销售额</span>'
            html += '<span style="margin-left:8px;">' + (tooltipData.sales / 10000).toFixed(2) + ' 万</span>'
            html += '<span style="margin-left:8px;color:' + c.muted + ';">|</span>'
            html += '<span style="margin-left:8px;color:' + c.light + ';">目标: ' + (tooltipData.targetSales / 10000).toFixed(2) + ' 万</span>'
            html += '<span style="margin-left:8px;">差值: <span style="color:' + (salesDiff >= 0 ? c.positive : c.negative) + ';font-weight:bold;">' + (salesDiff >= 0 ? '+' : '') + (salesDiff / 10000).toFixed(2) + ' 万</span></span>'
            html += '</div>'

            html += '<div style="margin-bottom:6px;">'
            html += '<span style="color:' + c.profit + ';font-weight:bold;">差价</span>'
            html += '<span style="margin-left:8px;">' + (tooltipData.profit / 10000).toFixed(2) + ' 万</span>'
            html += '<span style="margin-left:8px;color:' + c.muted + ';">|</span>'
            html += '<span style="margin-left:8px;color:' + c.light + ';">目标: ' + (tooltipData.targetProfit / 10000).toFixed(2) + ' 万</span>'
            html += '<span style="margin-left:8px;">差值: <span style="color:' + (profitDiff >= 0 ? c.positive : c.negative) + ';font-weight:bold;">' + (profitDiff >= 0 ? '+' : '') + (profitDiff / 10000).toFixed(2) + ' 万</span></span>'
            html += '</div>'

            html += '<div style="border-top:1px solid ' + c.border + ';margin:8px 0;padding-top:8px;">'
            html += '<span style="color:' + c.light + ';font-size:12px;">目标系数: <span style="color:' + c.text + ';font-weight:bold;">' + currentTargetCoefficient.toFixed(4) + '</span></span>'
            html += '</div>'

            html += '<div style="margin-bottom:4px;">'
            html += '<span style="color:' + c.light + ';">销售完成率:</span>'
            html += '<span style="margin-left:8px;font-weight:bold;color:' + (salesRateDiff >= 0 ? c.positive : c.negative) + ';">' + tooltipData.salesCompletionRate.toFixed(2) + '%</span>'
            html += '<span style="margin-left:6px;font-size:12px;color:' + (salesRateDiff >= 0 ? c.sales : c.profit) + ';">(' + (salesRateDiff >= 0 ? '+' : '') + (salesRateDiff * 100).toFixed(2) + '%)</span>'
            html += '</div>'

            html += '<div>'
            html += '<span style="color:' + c.light + ';">差价完成率:</span>'
            html += '<span style="margin-left:8px;font-weight:bold;color:' + (profitRateDiff >= 0 ? c.positive : c.negative) + ';">' + tooltipData.profitCompletionRate.toFixed(2) + '%</span>'
            html += '<span style="margin-left:6px;font-size:12px;color:' + (profitRateDiff >= 0 ? c.sales : c.profit) + ';">(' + (profitRateDiff >= 0 ? '+' : '') + (profitRateDiff * 100).toFixed(2) + '%)</span>'
            html += '</div>'

            return html
          }.bind(this)
        },
        legend: {
          data: [`${currentTimeLabel}销售额`, `${currentTimeLabel}差价`],
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
          data: categories,
          axisLabel: {
            rotate: 45,
            interval: 0,
            fontSize: 13,
            fontWeight: 'bold'
          }
        },
        yAxis: {
          type: 'value',
          name: '金额 (万)',
          nameTextStyle: {
            fontSize: 12,
            fontWeight: 'bold'
          },
          axisLabel: {
            formatter: (value) => value.toFixed(0)
          }
        },
        series: [
          {
            name: `${currentTimeLabel}销售额`,
            type: 'bar',
            data: salesData,
            itemStyle: { color: '#f56c6c' },
            barWidth: '25%',
            label: {
              show: true,
              position: 'center',
              formatter: function(params) {
                var val = typeof params.value === 'object' ? params.value.value : params.value
                return val.toFixed(1) + '万'
              },
              fontSize: 12,
              fontWeight: 'bold',
              offset: [0, -30]
            }
          },
          {
            name: `${currentTimeLabel}差价`,
            type: 'bar',
            data: profitData,
            itemStyle: { color: '#409eff' },
            barWidth: '25%',
            label: {
              show: true,
              position: 'bottom',
              formatter: function(params) {
                var val = typeof params.value === 'object' ? params.value.value : params.value
                return val.toFixed(1) + '万'
              },
              fontSize: 12,
              fontWeight: 'bold',
              offset: [0, -30]
            }
          }
          // {
          //   name: `${currentTimeLabel}目标差价`,
          //   type: 'bar',
          //   data: targetProfitData,
          //   itemStyle: { color: '#e6a23c' },
          //   barWidth: '15%',
          //   label: {
          //     show: true,
          //     position: 'top',
          //     formatter: (params) => params.value.toFixed(1) + '万',
          //     fontSize: 10,
          //     offset: [0, -45]
          //   }
          // }
        ]
      }

      this.chartInstance.setOption(option)
    },

    handleChartClick(params) {
      const category = params.name
      const dimension = this.summaryDimension
      const dimensionLabel = this.getDimensionLabel

      let queryParams = {}

      if (dimension === 'staff') {
        queryParams = {
          staffName: category,
          parentDepartment: '',
          department: '',
          businessLine: '',
          branch: ''
        }
      } else if (dimension === 'parentDept') {
        queryParams = {
          staffName: '',
          parentDepartment: category,
          department: '',
          businessLine: '',
          branch: ''
        }
      } else if (dimension === 'department') {
        queryParams = {
          staffName: '',
          parentDepartment: '',
          department: category,
          businessLine: '',
          branch: ''
        }
      } else if (dimension === 'business') {
        queryParams = {
          staffName: '',
          parentDepartment: '',
          department: '',
          businessLine: category,
          branch: ''
        }
      } else if (dimension === 'branch') {
        queryParams = {
          staffName: '',
          parentDepartment: '',
          department: '',
          businessLine: '',
          branch: category
        }
      }

      this.$router.push({
        path: '/data-platform/detail',
        query: {
          ...queryParams,
          summaryDimension: dimension,
          dimensionLabel,
          timeDimension: this.timeDimension,
          startDate: this.getDateRange().startDate,
          endDate: this.getDateRange().endDate
        }
      })
    },

    formatCurrency(value) {
      if (value === null || value === undefined || isNaN(value)) {
        return '-'
      }
      const num = parseFloat(value)
      return (num / 10000).toFixed(2)
    }
  }
}
</script>

<style lang="scss" scoped>
.sales-overview {
  .filter-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 24px;
    padding: 20px 24px;
    background: #fff;
    border-radius: 14px;
    border: 1px solid #f0f2f7;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  .filter-section {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filter-label {
    font-size: 14px;
    color: #5a6275;
    font-weight: 500;
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
  }

  .chart-section {
    margin-bottom: 24px;
    padding: 24px;
    background: #fff;
    border-radius: 14px;
    border: 1px solid #f0f2f7;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f2f7;
    }

    .chart-container {
      width: 100%;
      height: 380px;
    }
  }

  .summary-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #f0f2f7;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    }

    :deep(.el-card__header) {
      padding: 18px 24px;
      border-bottom: none;
      background: transparent;
    }

    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a2e;
      display: flex;
      align-items: center;
      gap: 8px;

      &::before {
        content: '';
        width: 4px;
        height: 18px;
        border-radius: 2px;
      }
    }

    .summary-content {
      padding: 8px 24px 24px;
    }

    .main-value {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 20px;
      letter-spacing: -0.5px;
    }

    .comparison-section {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f0f2f7;
    }

    .comparison-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      font-size: 13px;

      .label {
        color: #909399;
        min-width: 70px;
      }

      .value {
        color: #606266;
        min-width: 85px;
        font-weight: 500;
      }
    }

    .target-section {
      .target-item {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        font-size: 13px;

        .label {
          color: #909399;
          min-width: 90px;
        }

        .value {
          color: #606266;
          min-width: 100px;
          font-weight: 500;
        }

        .target-coefficient {
          color: #e6a23c;
          font-weight: 600;
        }

        .target-value {
          color: #409eff;
          font-weight: 600;
        }

        .completion-rate {
          color: #67c23a;
          font-weight: 600;
        }
      }
    }
  }

  .sales-card {
    .card-title::before {
      background: linear-gradient(180deg, #f56c6c, #e65d6e);
    }
    .main-value {
      color: #f56c6c;
    }
  }

  .profit-card {
    .card-title::before {
      background: linear-gradient(180deg, #30b08f, #28a078);
    }
    .main-value {
      color: #30b08f;
    }
  }

  .diff-positive {
    color: #f56c6c;
    font-weight: 500;
  }

  .diff-negative {
    color: #67c23a;
    font-weight: 500;
  }

  .completion-rate-section {
    margin-top: 24px;
    padding: 24px;
    background: #fff;
    border-radius: 14px;
    border: 1px solid #f0f2f7;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f2f7;
    }
  }

  .no-data-tip {
    padding: 40px 0;
    text-align: center;
  }
}
</style>

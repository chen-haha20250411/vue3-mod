<template>
  <div class="sales-overview">
    <div class="filter-container">
      <div class="filter-section">
        <div class="filter-label">时间维度：</div>
        <el-radio-group v-model="timeDimension" size="small" @change="handleTimeDimensionChange">
          <el-radio-button label="week">周</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
          <el-radio-button label="quarter">季度</el-radio-button>
          <el-radio-button label="year">年度</el-radio-button>
          <el-radio-button label="cumulative">累计当前</el-radio-button>
        </el-radio-group>
      </div>
      <div class="filter-section">
        <div class="filter-label">统计维度：</div>
        <el-radio-group v-model="summaryDimension" size="small" @change="handleDimensionChange">
          <el-radio-button label="staff">按业务员</el-radio-button>
          <el-radio-button label="parentDept">按父级部门</el-radio-button>
          <el-radio-button label="department">按部门</el-radio-button>
          <el-radio-button label="business">按业务线</el-radio-button>
          <el-radio-button label="branch">按分支机构</el-radio-button>
        </el-radio-group>
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
              <span class="value target-coefficient">{{ currentTargetCoefficient.toFixed(4) }}</span>
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
        <el-table-column prop="category" :label="getDimensionLabel" width="140" />
        <el-table-column prop="mbSales" label="年销售额目标" width="120">
          <template #default="scope">
            <span style="color: #1c9099;">{{ formatCurrency(scope.row.mbSales) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="mbProfit" label="年差价目标" width="120">
          <template #default="scope">
            <span style="color: #1c9099;">{{ formatCurrency(scope.row.mbProfit) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销售额" width="110">
          <template #default="scope">
            <span style="font-weight: bold; color: #f56c6c;">{{ formatCurrency(scope.row.sales) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profit" label="差价" width="100">
          <template #default="scope">
            <span style="font-weight: bold; color: #009688;">{{ formatCurrency(scope.row.profit) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="销售额达标" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.salesCompletionRate >= 100 ? 'success' : 'warning'" size="small">
              {{ scope.row.salesCompletionRate >= 100 ? '达标' : '未达标' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="差价达标" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.profitCompletionRate >= 100 ? 'success' : 'warning'" size="small">
              {{ scope.row.profitCompletionRate >= 100 ? '达标' : '未达标' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前系数" width="100" align="center">
          <template #default="scope">
            <span style="color: #e6a23c;">{{ currentTargetCoefficient.toFixed(4) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="targetSales" label="目标销售额" width="110">
          <template #default="scope">
            <span style="color: #409eff;">{{ formatCurrency(scope.row.targetSales) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="targetProfit" label="目标差价" width="100">
          <template #default="scope">
            <span style="color: #409eff;">{{ formatCurrency(scope.row.targetProfit) }}</span>
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
      }
    }
  },
  computed: {
    getDimensionLabel() {
      const labels = {
        staff: '业务员',
        parentDept: '父级部门',
        department: '部门',
        business: '业务线',
        branch: '分支机构'
      }
      return labels[this.summaryDimension] || '业务员'
    },
    tableData() {
      const currentData = this.currentData || []
      const coefficient = this.currentTargetCoefficient || 0

      const dimensionKeyMap = {
        staff: '业务员',
        parentDept: '父级部门',
        department: '部门',
        business: '业务线',
        branch: '分支机构'
      }
      const dimensionKey = dimensionKeyMap[this.summaryDimension] || '业务员'

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
        const salesCompletionRate = targetSales > 0 ? (sales / targetSales) * 100 : 0
        const profitCompletionRate = targetProfit > 0 ? (profit / targetProfit) * 100 : 0

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
          profitCompletionRate
        }
      })

      processedData = processedData.filter(item => item.sales > 0 || item.profit > 0)
      processedData.sort((a, b) => b.targetSales - a.targetSales)
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

      const staffName = employeeName || currentUserName

      const { startDate, endDate } = this.getDateRange()

      const currentYear = new Date().getFullYear()
      const lastYearStartDate = `${currentYear - 1}-${startDate.substring(5)}`
      const lastYearEndDate = `${currentYear - 1}-${endDate.substring(5)}`
      const twoYearsAgoStartDate = `${currentYear - 2}-${startDate.substring(5)}`
      const twoYearsAgoEndDate = `${currentYear - 2}-${endDate.substring(5)}`

      const currentParams = {
        startDate,
        endDate
      }

      if (permissionValue !== 'ALL') {
        currentParams.staffName = staffName
      }

      const lastYearParams = {
        startDate: lastYearStartDate,
        endDate: lastYearEndDate
      }

      if (permissionValue !== 'ALL') {
        lastYearParams.staffName = staffName
      }

      const twoYearsAgoParams = {
        startDate: twoYearsAgoStartDate,
        endDate: twoYearsAgoEndDate
      }

      if (permissionValue !== 'ALL') {
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

      const dimensionKeyMap = {
        staff: '业务员',
        parentDept: '父级部门',
        department: '部门',
        business: '业务线',
        branch: '分支机构'
      }

      const dimensionKey = dimensionKeyMap[this.summaryDimension] || '业务员'

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
          if (admin) return true
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

      const dimensionKeyMap = {
        staff: '业务员',
        parentDept: '父级部门',
        department: '部门',
        business: '业务线',
        branch: '分支机构'
      }

      const dimensionKey = dimensionKeyMap[this.summaryDimension]

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

    calculateCoefficient() {
      const today = new Date()
      const currentMonth = today.getMonth() + 1
      let quarterCoefficient = 0

      if (currentMonth >= 1 && currentMonth <= 3) {
        quarterCoefficient = 0.17
      } else if (currentMonth >= 4 && currentMonth <= 6) {
        quarterCoefficient = 0.23
      } else if (currentMonth >= 7 && currentMonth <= 9) {
        quarterCoefficient = 0.27
      } else {
        quarterCoefficient = 0.33
      }

      const monthCoefficient = quarterCoefficient / 3
      const weekCoefficient = monthCoefficient / 4

      // 周系数: 季度系数/3/4
      const weekCoefficientFixed = quarterCoefficient / 3 / 4

      // 累计当前系数: 1月1日到当前日期+1天 占全年的比例
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      const endDate = new Date(today)
      endDate.setDate(today.getDate() + 1)
      const daysInYear = ((today.getFullYear() % 4 === 0 && today.getFullYear() % 100 !== 0) || today.getFullYear() % 400 === 0) ? 366 : 365
      const cumulativeDays = Math.floor((endDate - startOfYear) / (1000 * 60 * 60 * 24))
      const cumulativeCoefficient = cumulativeDays / daysInYear

      switch (this.timeDimension) {
        case 'year':
          this.currentTargetCoefficient = 1
          break
        case 'quarter':
          this.currentTargetCoefficient = quarterCoefficient
          break
        case 'month':
          this.currentTargetCoefficient = monthCoefficient
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
      const year = today.getFullYear()
      const month = today.getMonth() + 1
      const date = today.getDate()
      const dayOfWeek = today.getDay()

      let startDate = ''
      let endDate = ''

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
          startDate = `${year}-${String(month).padStart(2, '0')}-01`
          const lastDayOfMonth = new Date(year, month, 0).getDate()
          endDate = `${year}-${String(month).padStart(2, '0')}-${lastDayOfMonth}`
          break
        case 'quarter':
          let quarterStartMonth = 0
          if (month <= 3) quarterStartMonth = 1
          else if (month <= 6) quarterStartMonth = 4
          else if (month <= 9) quarterStartMonth = 7
          else quarterStartMonth = 10
          startDate = `${year}-${String(quarterStartMonth).padStart(2, '0')}-01`
          const quarterEndMonth = quarterStartMonth + 2
          const lastDayOfQuarter = new Date(year, quarterEndMonth, 0).getDate()
          endDate = `${year}-${String(quarterEndMonth).padStart(2, '0')}-${lastDayOfQuarter}`
          break
        case 'year':
          startDate = `${year}-01-01`
          endDate = `${year}-12-31`
          break
        case 'cumulative':
          startDate = `${year}-01-01`
          const tomorrow = new Date(today)
          tomorrow.setDate(today.getDate() + 1)
          endDate = tomorrow.toISOString().split('T')[0]
          break
        default:
          startDate = `${year}-01-01`
          endDate = `${year}-12-31`
      }

      return { startDate, endDate }
    },

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

    initChart() {
      this.chartRef = this.$refs.chartRef
      if (!this.chartRef) return

      this.chartInstance = echarts.init(this.chartRef)
      this.chartInstance.on('click', this.handleChartClick)
      this.updateChart()

      window.addEventListener('resize', () => {
        if (this.chartInstance) {
          this.chartInstance.resize()
        }
      })
    },

    updateChart() {
      if (!this.chartInstance || !this.tableData || this.tableData.length === 0) return

      const timeDimensionLabel = {
        week: '周',
        month: '月',
        quarter: '季度',
        year: '年',
        cumulative: '累计'
      }

      const currentTimeLabel = timeDimensionLabel[this.timeDimension] || '期'

      const data = this.tableData.slice(0, 10)
      const categories = data.map(item => item.category || '-')
      const salesData = data.map(item => (item.sales || 0) / 10000)
      const targetSalesData = data.map(item => (item.targetSales || 0) / 10000)
      const profitData = data.map(item => (item.profit || 0) / 10000)
      const targetProfitData = data.map(item => (item.targetProfit || 0) / 10000)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params) => {
            let result = `<div><strong>${params[0].name}</strong></div>`
            params.forEach(param => {
              result += `<div>${param.seriesName}: ${param.value.toFixed(2)} 万</div>`
            })
            return result
          }
        },
        legend: {
          data: [`${currentTimeLabel}销售额`, `${currentTimeLabel}目标销售额`, `${currentTimeLabel}差价`, `${currentTimeLabel}目标差价`],
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
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '金额 (万)',
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
            barWidth: '15%'
          },
          {
            name: `${currentTimeLabel}目标销售额`,
            type: 'bar',
            data: targetSalesData,
            itemStyle: { color: '#409eff' },
            barWidth: '15%'
          },
          {
            name: `${currentTimeLabel}差价`,
            type: 'bar',
            data: profitData,
            itemStyle: { color: '#009688' },
            barWidth: '15%'
          },
          {
            name: `${currentTimeLabel}目标差价`,
            type: 'bar',
            data: targetProfitData,
            itemStyle: { color: '#e6a23c' },
            barWidth: '15%'
          }
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
    margin-bottom: 20px;
    padding: 15px;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #ebeef5;
  }

  .filter-section {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filter-label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .chart-section {
    margin-bottom: 20px;
    padding: 15px;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #ebeef5;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 15px;
    }

    .chart-container {
      width: 100%;
      height: 400px;
    }
  }

  .summary-card {
    :deep(.el-card__header) {
      padding: 12px 20px;
      border-bottom: 2px solid #f0f2f5;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .summary-content {
      padding: 5px 0;
    }

    .main-value {
      font-size: 28px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 15px;
    }

    .comparison-section {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px dashed #dcdfe6;
    }

    .comparison-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 13px;

      .label {
        color: #909399;
        min-width: 70px;
      }

      .value {
        color: #606266;
        min-width: 80px;
      }
    }

    .target-section {
      .target-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 13px;

        .label {
          color: #909399;
          min-width: 90px;
        }

        .value {
          color: #606266;
          min-width: 100px;
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
    .main-value {
      color: #f56c6c;
    }
  }

  .profit-card {
    .main-value {
      color: #009688;
    }
  }

  .diff-positive {
    color: #f56c6c;
  }

  .diff-negative {
    color: #67c23a;
  }

  .completion-rate-section {
    margin-top: 20px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 15px;
    }
  }

  .no-data-tip {
    padding: 40px 0;
    text-align: center;
  }
}
</style>

<template>
  <div class="detail-container">
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>{{ salespersonName }} - 销售详情（日期：{{ startDate }}至{{ endDate }}）</span>
          <el-button type="primary" plain @click="goBack">返回</el-button>
        </div>
      </template>
      
      <div class="detail-content">
        <div class="section">
          <h3 class="section-title">{{ selectedYear }} 年度目标</h3>
          <div class="target-cards">
            <el-card class="target-card sales-card">
              <template #header>
                <div class="card-title sales-title">年销售额目标</div>
              </template>
              <div class="card-details">
                <div class="detail-item">
                  <span class="label">目标值:</span>
                  <span class="value sales-value">{{ formatCurrency(targets.yearSales) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">当前完成:</span>
                  <span class="value sales-value highlight">{{ formatCurrency(currentData.sales) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">差值:</span>
                  <span class="value sales-value" :class="salesDiff >= 0 ? 'positive' : 'negative'">
                    {{ salesDiff >= 0 ? '+' : '' }}{{ formatCurrency(salesDiff) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">完成率:</span>
                  <span class="value completion-rate sales-value" :class="salesCompletionRate >= 100 ? 'positive' : ''">
                    {{ salesCompletionRate }}%
                  </span>
                </div>
              </div>
            </el-card>
            
            <el-card class="target-card profit-card">
              <template #header>
                <div class="card-title profit-title">年差价目标</div>
              </template>
              <div class="card-details">
                <div class="detail-item">
                  <span class="label">目标值:</span>
                  <span class="value profit-value">{{ formatCurrency(targets.yearProfit) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">当前完成:</span>
                  <span class="value profit-value highlight">{{ formatCurrency(currentData.profit) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">差值:</span>
                  <span class="value profit-value" :class="profitDiff >= 0 ? 'positive' : 'negative'">
                    {{ profitDiff >= 0 ? '+' : '' }}{{ formatCurrency(profitDiff) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">完成率:</span>
                  <span class="value completion-rate profit-value" :class="profitCompletionRate >= 100 ? 'positive' : ''">
                    {{ profitCompletionRate }}%
                  </span>
                </div>
              </div>
            </el-card>
            
            <el-card class="target-card value-added-card">
              <template #header>
                <div class="card-title value-added-title">增值业绩目标</div>
              </template>
              <div class="card-details">
                <div class="detail-item">
                  <span class="label">目标值:</span>
                  <span class="value value-added-value">{{ formatCurrency(targets.valueAdded) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">当前完成:</span>
                  <span class="value value-added-value highlight">{{ formatCurrency(currentData.valueAdded) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">差值:</span>
                  <span class="value value-added-value" :class="valueAddedDiff >= 0 ? 'positive' : 'negative'">
                    {{ valueAddedDiff >= 0 ? '+' : '' }}{{ formatCurrency(valueAddedDiff) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">完成率:</span>
                  <span class="value completion-rate value-added-value" :class="valueAddedCompletionRate >= 100 ? 'positive' : ''">
                    {{ valueAddedCompletionRate }}%
                  </span>
                </div>
              </div>
            </el-card>
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">同期对比</h3>
          <div class="comparison-charts">
            <div class="chart-container">
              <h4>销售额同比</h4>
              <div ref="salesComparisonChartRef" class="chart" style="height: 300px; width: 100%"></div>
            </div>
            <div class="chart-container">
              <h4>差价同比</h4>
              <div ref="profitComparisonChartRef" class="chart" style="height: 300px; width: 100%"></div>
            </div>
            <div class="chart-container">
              <h4>增值业务同比</h4>
              <div ref="valueAddedComparisonChartRef" class="chart" style="height: 300px; width: 100%"></div>
            </div>
          </div>
        </div>
        
        <div class="section" v-if="staffDetailData.length > 0">
          <h3 class="section-title">业务员明细（单位：万元）</h3>
          <div class="table-container">
            <el-table :data="staffDetailData" style="width: 100%">
              <el-table-column prop="staffName" label="业务员" width="80" />
              <el-table-column prop="sales" label="销售额" width="80">
                <template #default="scope">
                  <span class="table-sales-value">{{ formatWan(scope.row.sales) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="taxFreeDiff" label="未税毛利" width="80">
                <template #default="scope">
                  {{ formatWan(scope.row.taxFreeDiff) }}
                </template>
              </el-table-column>
              <el-table-column prop="taxFreeGrossAdjust" label="毛利调整" width="80">
                <template #default="scope">
                  {{ formatWan(scope.row.taxFreeGrossAdjust) }}
                </template>
              </el-table-column>
              <el-table-column prop="discount" label="折扣" width="60">
                <template #default="scope">
                  {{ formatWan(scope.row.discount) }}
                </template>
              </el-table-column>
              <el-table-column prop="realTransferGross" label="调拨毛利" width="80">
                <template #default="scope">
                  {{ formatWan(scope.row.realTransferGross) }}
                </template>
              </el-table-column>
              <el-table-column prop="externalInternalTransfer" label="内部调拨" width="80">
                <template #default="scope">
                  {{ formatWan(scope.row.externalInternalTransfer) }}
                </template>
              </el-table-column>
              <el-table-column prop="accruedCost" label="预提成本" width="80">
                <template #default="scope">
                  {{ formatWan(scope.row.accruedCost) }}
                </template>
              </el-table-column>
              <el-table-column prop="badDebtExpense" label="坏账支出" width="80">
                <template #default="scope">
                  {{ formatWan(scope.row.badDebtExpense) }}
                </template>
              </el-table-column>
              <el-table-column prop="otherCost1" label="其他成本" width="80">
                <template #default="scope">
                  {{ formatWan(scope.row.otherCost1) }}
                </template>
              </el-table-column>
              <el-table-column prop="otherCost1Operation" label="成本运作" width="80">
                <template #default="scope">
                  {{ formatWan(scope.row.otherCost1Operation) }}
                </template>
              </el-table-column>
              <el-table-column prop="uninvoicedDiscount" label="未到票折扣" width="95">
                <template #default="scope">
                  {{ formatWan(scope.row.uninvoicedDiscount) }}
                </template>
              </el-table-column>
              <el-table-column prop="uninvoicedDiscountReversal" label="折扣冲回" width="80">
                <template #default="scope">
                  {{ formatWan(scope.row.uninvoicedDiscountReversal) }}
                </template>
              </el-table-column>
              <el-table-column prop="yearEndTaxDiff" label="补税差" width="75">
                <template #default="scope">
                  {{ formatWan(scope.row.yearEndTaxDiff) }}
                </template>
              </el-table-column>
              <el-table-column prop="platformFee" label="平台费" width="75">
                <template #default="scope">
                  {{ formatWan(scope.row.platformFee) }}
                </template>
              </el-table-column>
              <el-table-column prop="taxFreeGrossDiff" label="最终差价" width="80">
                <template #default="scope">
                  <span class="table-profit-value">{{ formatWan(scope.row.taxFreeGrossDiff) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getSalesProfitReport, getValueAddedBusinessNew } from '@/api/dataPlatform'
import { isAdmin, getCurrentUserName, getDataPermissionNames, getDataPermissionValues, getDataPermissions } from '@/utils/permission'

export default {
  name: 'SalesDetail',
  data() {
    return {
      salesperson: '',
      staffList: [],
      summaryDimension: '',
      timeDimension: 'month',
      selectedYear: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      staffName: '',
      parentDepartment: '',
      department: '',
      businessLine: '',
      branch: '',
      salesComparisonChart: null,
      profitComparisonChart: null,
      valueAddedComparisonChart: null,
      loading: false,
      error: null,
      targets: {
        yearSales: 90000000,
        yearProfit: 13500000,
        valueAdded: 5000000
      },
      currentData: {
        sales: 0,
        profit: 0,
        valueAdded: 0
      },
      staffDetailData: [],
      comparisonData: [
        {
          period: '当年累计',
          sales: 62000000,
          profit: 9300000,
          gap: '-'
        },
        {
          period: '去年同期',
          sales: 58000000,
          profit: 8700000,
          gap: 6.9
        },
        {
          period: '前年同期',
          sales: 52000000,
          profit: 7800000,
          gap: 19.2
        }
      ],
      debounceTimer: null,
      dataCache: {},
      isRequesting: false
    }
  },
  computed: {
    salespersonName() {
      return decodeURIComponent(this.salesperson) || '未知业务员'
    },
    salesCompletionRate() {
      if (this.targets.yearSales === 0) return 0
      return Math.round((this.currentData.sales / this.targets.yearSales) * 100)
    },
    profitCompletionRate() {
      if (this.targets.yearProfit === 0) return 0
      return Math.round((this.currentData.profit / this.targets.yearProfit) * 100)
    },
    valueAddedCompletionRate() {
      if (this.targets.valueAdded === 0) return 0
      return Math.round((this.currentData.valueAdded / this.targets.valueAdded) * 100)
    },
    salesDiff() {
      return this.currentData.sales - this.targets.yearSales
    },
    profitDiff() {
      return this.currentData.profit - this.targets.yearProfit
    },
    valueAddedDiff() {
      return this.currentData.valueAdded - this.targets.valueAdded
    }
  },
  mounted() {
    this.salesperson = this.$route.query.salesperson || ''
    this.staffList = this.$route.query.staffList ? JSON.parse(decodeURIComponent(this.$route.query.staffList)) : []
    this.summaryDimension = this.$route.query.summaryDimension || 'staff'
    this.timeDimension = this.$route.query.timeDimension || 'month'
    this.selectedYear = this.$route.query.selectedYear ? parseInt(this.$route.query.selectedYear) : new Date().getFullYear()
    
    this.staffName = this.$route.query.staffName || ''
    this.parentDepartment = this.$route.query.parentDepartment || ''
    this.department = this.$route.query.department || ''
    this.businessLine = this.$route.query.businessLine || ''
    this.branch = this.$route.query.branch || ''
    
    const now = new Date()
    const currentYear = now.getFullYear()
    const selectedDate = new Date(this.selectedYear, now.getMonth(), now.getDate())
    const tomorrow = new Date(selectedDate)
    tomorrow.setDate(selectedDate.getDate() + 1)
    
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    if (this.selectedYear === currentYear) {
      this.startDate = `${this.selectedYear}-01-01`
      this.endDate = formatDate(tomorrow)
    } else {
      this.startDate = `${this.selectedYear}-01-01`
      this.endDate = `${this.selectedYear + 1}-01-01`
    }
    
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
    
    if (!this.salesperson) {
      this.salesperson = encodeURIComponent(currentUserRealName)
      this.staffList = [currentUserRealName]
    }
    
    this.initSalesComparisonChart()
    this.initProfitComparisonChart()
    this.initValueAddedComparisonChart()
    this.loadData()
    this.loadStaffDetailData()
    window.addEventListener('resize', this.handleResize)
  },
  methods: {
    async loadSalesTargetData() {
      try {
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
        
        const yearStartDate = `${this.selectedYear}-01-01`
        const yearEndDate = `${this.selectedYear}-12-31`
        
        const params = this.buildQueryParams(yearStartDate, yearEndDate, '', currentUserRealName, admin)
        const response = await getSalesProfitReport(params)
        
        console.log('Target data response:', response)
        
        if (response && response.data) {
          const dataArray = Array.isArray(response.data) ? response.data : (response.data.data || [])
          
          let totalMB_sales = 0
          let totalMB_profit = 0
          let totalMB_sales_zz = 0
          
          dataArray.forEach(item => {
            totalMB_sales += parseFloat(item.MB_sales) || parseFloat(item['MB_sales']) || 0
            totalMB_profit += parseFloat(item.MB_profit) || parseFloat(item['MB_profit']) || 0
            totalMB_sales_zz += parseFloat(item.MB_sales_zz) || parseFloat(item['MB_sales_zz']) || 0
          })
          
          console.log('Target values:', { totalMB_sales, totalMB_profit, totalMB_sales_zz })
          
          this.targets = {
            yearSales: totalMB_sales,
            yearProfit: totalMB_profit,
            valueAdded: totalMB_sales_zz
          }
        }
      } catch (error) {
        console.error('Failed to load target data:', error)
      }
    },
    
    async loadData() {
      if (this.isRequesting) {
        return
      }
      
      this.loading = true
      this.error = null
      this.isRequesting = true
      
      try {
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
        
        const now = new Date()
        const selectedDate = new Date(this.selectedYear, now.getMonth(), now.getDate())
        const tomorrow = new Date(selectedDate)
        tomorrow.setDate(selectedDate.getDate() + 1)
        
        const formatDate = (date) => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }
        
        const currentYear = new Date().getFullYear()

        if (this.selectedYear === currentYear) {
          this.startDate = `${this.selectedYear}-01-01`
          this.endDate = formatDate(tomorrow)
        } else {
          this.startDate = `${this.selectedYear}-01-01`
          this.endDate = `${this.selectedYear + 1}-01-01`
        }
        
        const yearRanges = []
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
        const currentDay = String(now.getDate()).padStart(2, '0')
        
        for (let i = 0; i < 5; i++) {
          const year = this.selectedYear - i
          let endDate
          
          if (this.selectedYear === currentYear) {
            endDate = year === currentYear ? formatDate(tomorrow) : `${year}-${currentMonth}-${currentDay}`
          } else {
            endDate = `${year + 1}-01-01`
          }
          
          yearRanges.push({
            year: year,
            startDate: `${year}-01-01`,
            endDate: endDate
          })
        }
        
        const cacheKeys = yearRanges.map(range => 
          `${this.timeDimension}_${this.salesperson}_${range.year}_${range.startDate}_${range.endDate}_${currentUserName}`
        )
        
        const cachedResponses = cacheKeys.map(key => this.getCacheData(key))
        
        const requests = []
        const requestCacheKeys = []
        
        cachedResponses.forEach((response, index) => {
          if (!response) {
            const range = yearRanges[index]
            const params = this.buildQueryParams(range.startDate, range.endDate, '', currentUserRealName, admin)
            requests.push(getSalesProfitReport(params))
            requestCacheKeys.push(cacheKeys[index])
          }
        })
        
        if (requests.length > 0) {
          const results = await Promise.allSettled(requests)
          
          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              const response = result.value
              this.setCacheData(requestCacheKeys[index], response)
              
              const cacheKeyIndex = cacheKeys.indexOf(requestCacheKeys[index])
              if (cacheKeyIndex !== -1) {
                cachedResponses[cacheKeyIndex] = response
              }
            } else {
              console.error(`Failed to load data for ${requestCacheKeys[index]}:`, result.reason)
            }
          })
        }
        
        this.processAndMergeData(cachedResponses, yearRanges)
      } catch (error) {
        console.error('Failed to load detail data:', error)
        this.error = '数据加载失败，请稍后重试'
      } finally {
        this.loading = false
        this.isRequesting = false
      }
    },
    
    processAndMergeData(cachedResponses, yearRanges) {
      try {
        const yearlyData = yearRanges.map((range, index) => {
          const response = cachedResponses[index]
          return {
            year: range.year,
            ...this.calculateTotalFromResponse(response || {})
          }
        })

        const currentYearData = yearlyData[0] || { sales: 0, profit: 0, valueAdded: 0 }
        this.currentData = {
          sales: currentYearData.sales,
          profit: currentYearData.profit,
          valueAdded: currentYearData.valueAdded
        }

        this.comparisonData = yearlyData.map(data => ({
          period: data.year.toString(),
          sales: data.sales || null,
          profit: data.profit || null,
          valueAdded: data.valueAdded || null
        }))

        const lastYearData = yearlyData[0]
        console.log('lastYearData (most recent year):', lastYearData)
        console.log('cachedResponses length:', cachedResponses.length)
        console.log('cachedResponses first (most recent):', cachedResponses[0])
        if (lastYearData && cachedResponses[0]) {
          const lastYearResponse = cachedResponses[0]
          console.log('lastYearResponse (most recent):', lastYearResponse)
          
          let dataArray = null
          if (Array.isArray(lastYearResponse)) {
            dataArray = lastYearResponse
          } else if (lastYearResponse && lastYearResponse.data) {
            dataArray = lastYearResponse.data
          }
          
          console.log('dataArray:', dataArray)
          
          if (dataArray && Array.isArray(dataArray)) {
            console.log('dataArray is array, length:', dataArray.length)
            let totalMB_sales = 0
            let totalMB_profit = 0
            let totalMB_sales_zz = 0
            
            dataArray.forEach(item => {
              totalMB_sales += parseFloat(item.MB_sales) || parseFloat(item['MB_sales']) || 0
              totalMB_profit += parseFloat(item.MB_profit) || parseFloat(item['MB_profit']) || 0
              totalMB_sales_zz += parseFloat(item.MB_sales_zz) || parseFloat(item['MB_sales_zz']) || 0
            })
            
            console.log('Target values from most recent year:', { totalMB_sales, totalMB_profit, totalMB_sales_zz })
            
            this.targets = {
              yearSales: totalMB_sales,
              yearProfit: totalMB_profit,
              valueAdded: totalMB_sales_zz
            }
          } else {
            console.log('dataArray is not array or empty:', dataArray)
          }
        } else {
          console.log('Condition failed: lastYearData =', lastYearData, 'cachedResponses first =', cachedResponses[0])
        }

        this.updateSalesComparisonChart()
        this.updateProfitComparisonChart()
        this.updateValueAddedComparisonChart()
        this.loadValueAddedBusinessData()
      } catch (error) {
        console.error('Error processing and merging data:', error)
      }
    },
    
    calculateTotalFromResponse(response) {
      let totalSales = 0
      let totalProfit = 0
      let totalValueAdded = 0
      
      let actualData = response
      if (response && typeof response === 'object' && response.data) {
        actualData = response.data
      }
      
      if (actualData && Array.isArray(actualData)) {
        actualData.forEach(item => {
          const sales = parseFloat(item['含税销售额']) || parseFloat(item.sales) || 0
          const profit = parseFloat(item['不含税毛利差价']) || parseFloat(item.profit) || 0
          const valueAdded = parseFloat(item.valueAdded) || 0
          
          totalSales += sales
          totalProfit += profit
          totalValueAdded += valueAdded
        })
      }
      
      return {
        sales: totalSales,
        profit: totalProfit,
        valueAdded: totalValueAdded
      }
    },
    
    calculateGap(current, previous) {
      if (previous === 0) return 0
      return Math.round(((current - previous) / previous) * 100)
    },
    
    goBack() {
      this.$router.push('/data-platform')
    },
    
    formatCurrency(value) {
      return new Intl.NumberFormat('zh-CN', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    },
    
    formatWan(value) {
      const wan = value / 10000
      return wan.toFixed(1) 
    },
    
    initSalesComparisonChart() {
      this.salesComparisonChart = echarts.init(this.$refs.salesComparisonChartRef)
      this.updateSalesComparisonChart()
    },
    
    updateSalesComparisonChart() {
      if (!this.salesComparisonChart) return

      const categories = this.comparisonData.map(item => item.period)
      const salesData = this.comparisonData.map(item => item.sales)

      const dimensionColors = {
        staff: '#409EFF',
        department: '#F56C6C',
        parentDepartment: '#722ED1',
        businessLine: '#1890FF',
        branch: '#722ED1'
      }

      const color = dimensionColors[this.summaryDimension] || '#409EFF'

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: (params) => {
            let result = params[0].name + '年<br/>'
            params.forEach(param => {
              if (param.value !== null && param.value !== undefined) {
                result += `${param.marker} ${param.seriesName}: ${this.formatCurrency(param.value)}<br/>`
              }
            })
            return result
          }
        },
        grid: {
          left: '60px',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: [30, 30],
          data: categories
        },
        yAxis: {
          type: 'value',
          name: '金额',
          axisLabel: {
            formatter: (value) => {
              return (value / 10000).toFixed(0) + '万'
            }
          }
        },
        series: [
          {
            name: '销售额',
            type: 'bar',
            data: salesData,
            barWidth: 40,
            barCategoryGap: '30px',
            itemStyle: {
              color: color
            },
            label: {
              show: true,
              position: 'top',
              formatter: (params) => {
                if (params.value === null || params.value === undefined) return '-'
                return (params.value / 10000).toFixed(0) + '万'
              }
            }
          }
        ]
      }

      this.salesComparisonChart.setOption(option)
    },
    
    initProfitComparisonChart() {
      this.profitComparisonChart = echarts.init(this.$refs.profitComparisonChartRef)
      this.updateProfitComparisonChart()
    },
    
    initValueAddedComparisonChart() {
      this.valueAddedComparisonChart = echarts.init(this.$refs.valueAddedComparisonChartRef)
      this.updateValueAddedComparisonChart()
    },
    
    updateProfitComparisonChart() {
      if (!this.profitComparisonChart) return

      const categories = this.comparisonData.map(item => item.period)
      const profitData = this.comparisonData.map(item => item.profit)

      const dimensionColors = {
        staff: '#67C23A',
        department: '#909399',
        parentDepartment: '#13C2C2',
        businessLine: '#52C41A',
        branch: '#13C2C2'
      }

      const color = dimensionColors[this.summaryDimension] || '#67C23A'

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: (params) => {
            let result = params[0].name + '年<br/>'
            params.forEach(param => {
              if (param.value !== null && param.value !== undefined) {
                result += `${param.marker} ${param.seriesName}: ${this.formatCurrency(param.value)}<br/>`
              }
            })
            return result
          }
        },
        grid: {
          left: '60px',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: [30, 30],
          data: categories
        },
        yAxis: {
          type: 'value',
          name: '金额',
          axisLabel: {
            formatter: (value) => {
              return (value / 10000).toFixed(0) + '万'
            }
          }
        },
        series: [
          {
            name: '差价',
            type: 'bar',
            data: profitData,
            barWidth: 40,
            barCategoryGap: '30px',
            itemStyle: {
              color: color
            },
            label: {
              show: true,
              position: 'top',
              formatter: (params) => {
                if (params.value === null || params.value === undefined) return '-'
                return (params.value / 10000).toFixed(0) + '万'
              }
            }
          }
        ]
      }

      this.profitComparisonChart.setOption(option)
    },
    
    updateValueAddedComparisonChart() {
      if (!this.valueAddedComparisonChart) return

      const categories = this.comparisonData.map(item => item.period)
      const valueAddedData = this.comparisonData.map(item => item.valueAdded)

      const dimensionColors = {
        staff: '#E6A23C',
        department: '#909399',
        parentDepartment: '#FAAD14',
        businessLine: '#FAAD14',
        branch: '#FAAD14'
      }

      const color = dimensionColors[this.summaryDimension] || '#E6A23C'

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: (params) => {
            let result = params[0].name + '年<br/>'
            params.forEach(param => {
              if (param.value !== null && param.value !== undefined) {
                result += `${param.marker} ${param.seriesName}: ${this.formatCurrency(param.value)}<br/>`
              }
            })
            return result
          }
        },
        grid: {
          left: '60px',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: [30, 30],
          data: categories
        },
        yAxis: {
          type: 'value',
          name: '金额',
          axisLabel: {
            formatter: (value) => {
              return (value / 10000).toFixed(0) + '万'
            }
          }
        },
        series: [
          {
            name: '增值业务',
            type: 'bar',
            data: valueAddedData,
            barWidth: 40,
            barCategoryGap: '30px',
            itemStyle: {
              color: color
            },
            label: {
              show: true,
              position: 'top',
              formatter: (params) => {
                if (params.value === null || params.value === undefined) return '-'
                return (params.value / 10000).toFixed(0) + '万'
              }
            }
          }
        ]
      }

      this.valueAddedComparisonChart.setOption(option)
    },
    
    handleResize() {
      if (this.salesComparisonChart) {
        this.salesComparisonChart.resize()
      }
      if (this.profitComparisonChart) {
        this.profitComparisonChart.resize()
      }
      if (this.valueAddedComparisonChart) {
        this.valueAddedComparisonChart.resize()
      }
    },
    
    getCacheData(key) {
      const cacheItem = this.dataCache[key]
      if (!cacheItem) {
        return null
      }
      
      const now = Date.now()
      if (now - cacheItem.timestamp > 30000) {
        delete this.dataCache[key]
        return null
      }
      
      return cacheItem.data
    },
    
    setCacheData(key, data) {
      this.dataCache[key] = {
        data: data,
        timestamp: Date.now()
      }
    },
    
    async loadValueAddedBusinessData() {
      try {
        console.log('loadValueAddedBusinessData called')
        const currentUserName = getCurrentUserName()
        const currentYear = new Date().getFullYear()
        let startDate, endDate
        
        if (this.selectedYear === currentYear) {
          const now = new Date()
          const selectedDate = new Date(this.selectedYear, now.getMonth(), now.getDate())
          const tomorrow = new Date(selectedDate)
          tomorrow.setDate(selectedDate.getDate() + 1)
          startDate = `${this.selectedYear}-01-01`
          endDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
        } else {
          startDate = `${this.selectedYear}-01-01`
          endDate = `${this.selectedYear + 1}-01-01`
        }
        
        const params = {
          startDate: startDate,
          endDate: endDate
        }
        
        const targetValue = this.salesperson ? decodeURIComponent(this.salesperson) : ''
        
        switch (this.summaryDimension) {
          case 'staff':
            params.personNameList = targetValue
            break
          case 'parentDepartment':
            params.deptGroupList = targetValue
            break
          case 'department':
            params.orgNameList = targetValue
            break
          case 'branch':
            let branchValue = targetValue
            switch (targetValue) {
              case '管理平台':
                branchValue = '1'
                break
              case '营销平台':
                branchValue = '2'
                break
              case '新业务平台':
                branchValue = '3'
                break
              case '弱电平台':
                branchValue = '5'
                break
            }
            params.subOrgIdList = branchValue
            break
          case 'businessLine':
            params.sGroupList = targetValue
            break
        }
        
        console.log('Value Added Business params:', params)
        
        const cacheKey = `value_added_${this.summaryDimension}_${this.selectedYear}_${targetValue}_${currentUserName}`
        const cachedData = this.getCacheData(cacheKey)
        
        if (cachedData) {
          console.log('Using cached value added data:', cachedData)
          this.currentData.valueAdded = cachedData
          return
        }
        
        console.log('Calling getValueAddedBusiness API...')
        const response = await getValueAddedBusinessNew(params)
        console.log('Value Added Business response:', response)
        
        if (response && Array.isArray(response)) {
          let totalValueAdded = 0
          response.forEach(item => {
            const amount = parseFloat(item['总换算合计金额']) || 0
            totalValueAdded += amount
          })
          this.currentData.valueAdded = totalValueAdded
          this.setCacheData(cacheKey, totalValueAdded)
          console.log('Value added data loaded:', totalValueAdded)
        }
      } catch (error) {
        console.error('Failed to load value added business data:', error)
      }
    },
    
    async loadStaffDetailData() {
      try {
        const currentUserName = getCurrentUserName()
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
        
        const now = new Date()
        const currentYear = now.getFullYear()
        let currentStartDate, currentEndDate
        
        const formatDate = (date) => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }
        
        if (this.selectedYear === currentYear) {
          const selectedDate = new Date(this.selectedYear, now.getMonth(), now.getDate())
          const tomorrow = new Date(selectedDate)
          tomorrow.setDate(selectedDate.getDate() + 1)
          currentStartDate = `${this.selectedYear}-01-01`
          currentEndDate = formatDate(tomorrow)
        } else {
          currentStartDate = `${this.selectedYear}-01-01`
          currentEndDate = `${this.selectedYear + 1}-01-01`
        }
        
        const params = this.buildQueryParams(currentStartDate, currentEndDate, '', currentUserRealName, false)
        const cacheKey = `${this.summaryDimension}_staff_detail_full_${currentStartDate}_${currentEndDate}_${this.salesperson}_${currentUserName}`
        
        const cachedData = this.getCacheData(cacheKey)
        if (cachedData) {
          this.staffDetailData = cachedData
          return
        }
        
        const response = await getSalesProfitReport(params)
        
        if (response && Array.isArray(response)) {
          const rawData = response.map(item => {
            const staffName = item['业务员'] || item.staffName || '未知'
            const department = item['部门'] || item.department || item['DEPT'] || ''
            const sales = parseFloat(item['含税销售额']) || parseFloat(item.sales) || 0
            const taxFreeDiff = parseFloat(item['未税毛利+']) || 0
            const taxFreeGrossAdjust = parseFloat(item['不含税毛利调整-']) || 0
            const discount = parseFloat(item['折扣-']) || 0
            const realTransferGross = parseFloat(item['真实调拨毛利+']) || 0
            const externalInternalTransfer = parseFloat(item['系统外内部调拨-']) || 0
            const accruedCost = parseFloat(item['预提成本-']) || 0
            const badDebtExpense = parseFloat(item['坏账支出-']) || 0
            const otherCost1 = parseFloat(item['其他成本一-']) || 0
            const otherCost1Operation = parseFloat(item['其他成本一运作-']) || 0
            const uninvoicedDiscount = parseFloat(item['未到票折扣-']) || 0
            const uninvoicedDiscountReversal = parseFloat(item['未到票折扣冲回-']) || 0
            const yearEndTaxDiff = parseFloat(item['年底补税差-']) || 0
            const platformFee = parseFloat(item['平台抽点费-']) || 0
            const taxFreeGrossDiff = parseFloat(item['不含税毛利差价']) || parseFloat(item.profit) || 0
            
            return {
              staffName,
              department,
              sales,
              taxFreeDiff,
              taxFreeGrossAdjust,
              discount,
              realTransferGross,
              externalInternalTransfer,
              accruedCost,
              badDebtExpense,
              otherCost1,
              otherCost1Operation,
              uninvoicedDiscount,
              uninvoicedDiscountReversal,
              yearEndTaxDiff,
              platformFee,
              taxFreeGrossDiff
            }
          }).filter(item => item.sales > 0 || item.taxFreeGrossDiff > 0)
          
          this.setCacheData(cacheKey, rawData)
          this.staffDetailData = rawData
        }
      } catch (error) {
        console.error('Failed to load staff detail data:', error)
        this.staffDetailData = []
      }
    },
    
    filterByDepartmentPermission(data, departmentPermissionNames, hasAllPermission, isAdminUser) {
      if (isAdminUser || hasAllPermission) {
        return data
      }
      
      if (!departmentPermissionNames || departmentPermissionNames.length === 0) {
        return data
      }
      
      return data.filter(item => {
        if (!item.department) {
          return false
        }
        return departmentPermissionNames.some(permName => 
          item.department.includes(permName) || permName.includes(item.department)
        )
      })
    },
    
    buildQueryParams(startDate, endDate, _staffName, currentUserName, admin) {
      const params = {
        startDate: startDate,
        endDate: endDate,
        parentDepartment: this.parentDepartment || '',
        department: this.department || '',
        businessLine: this.businessLine || '',
        branch: this.branch || '',
        staffName: this.staffName || ''
      }
      
      return params
    },
    
    cleanExpiredCache() {
      const now = Date.now()
      for (const key in this.dataCache) {
        if (this.dataCache.hasOwnProperty(key)) {
          const cacheItem = this.dataCache[key]
          if (now - cacheItem.timestamp > 30000) {
            delete this.dataCache[key]
          }
        }
      }
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    if (this.salesComparisonChart) {
      this.salesComparisonChart.dispose()
      this.salesComparisonChart = null
    }
    if (this.profitComparisonChart) {
      this.profitComparisonChart.dispose()
      this.profitComparisonChart = null
    }
    if (this.valueAddedComparisonChart) {
      this.valueAddedComparisonChart.dispose()
      this.valueAddedComparisonChart = null
    }
    this.dataCache = {}
  }
}
</script>

<style>
.detail-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.detail-content .section {
  margin-bottom: 30px;
}

.detail-content .section .section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.detail-content .target-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.detail-content .target-cards .target-card {
  transition: all 0.3s ease;
}

.detail-content .target-cards .target-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.detail-content .target-cards .target-card .card-title {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
}

.detail-content .target-cards .target-card .card-details {
  margin-top: 10px;
}

.detail-content .target-cards .target-card .card-details .detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-content .target-cards .target-card .card-details .detail-item .label {
  color: #909399;
}

.detail-content .target-cards .target-card .card-details .detail-item .value {
  color: #303133;
  font-weight: 500;
}

.detail-content .target-cards .target-card .card-details .detail-item .value.completion-rate {
  font-weight: bold;
}

.detail-content .target-cards .target-card .card-details .detail-item .value.completion-rate.positive {
  color: #67C23A;
}

.detail-content .target-cards .sales-card {
  border-left: 4px solid #409EFF;
}

.detail-content .target-cards .sales-card .sales-title {
  color: #409EFF;
  font-size: 16px;
}

.detail-content .target-cards .sales-card .sales-value {
  color: #409EFF;
  font-weight: 600;
}

.detail-content .target-cards .sales-card .highlight {
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, #409EFF 0%, #66B1FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.detail-content .target-cards .profit-card {
  border-left: 4px solid #67C23A;
}

.detail-content .target-cards .profit-card .profit-title {
  color: #67C23A;
  font-size: 16px;
}

.detail-content .target-cards .profit-card .profit-value {
  color: #67C23A;
  font-weight: 600;
}

.detail-content .target-cards .profit-card .highlight {
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.detail-content .target-cards .value-added-card {
  border-left: 4px solid #E6A23C;
}

.detail-content .target-cards .value-added-card .value-added-title {
  color: #E6A23C;
  font-size: 16px;
}

.detail-content .target-cards .value-added-card .value-added-value {
  color: #E6A23C;
  font-weight: 600;
}

.detail-content .target-cards .value-added-card .highlight {
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, #E6A23C 0%, #F7BA5B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.table-sales-value {
  color: #409EFF;
  font-weight: bold;
  font-size: 14px;
}

.table-profit-value {
  color: #67C23A;
  font-weight: bold;
  font-size: 14px;
}

.detail-content .comparison-charts {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.detail-content .comparison-charts .chart-container {
  flex: 1;
  max-width: 450px;
}

.detail-content .comparison-charts .chart-container h4 {
  text-align: center;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #606266;
}

.detail-content .chart {
  margin-top: 20px;
}

.detail-content .table-container {
  overflow-x: auto;
  margin-top: 20px;
}

.detail-content .table-container ::v-deep .el-table {
  min-width: 1200px;
}

.positive {
  color: #67C23A;
  font-weight: bold;
}

.negative {
  color: #F56C6C;
  font-weight: bold;
}
</style>

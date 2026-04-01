<template>
  <div class="value-added-business">
    <div class="filter-container">
      <div class="filter-section">
        <div class="filter-label" width="120px">时间维度：</div>
        <el-select v-model="selectedYear" size="small" @change="handleYearChange">
          <el-option label="2026年度" :value="2026" />
          <el-option label="2025年度" :value="2025" />
          <el-option label="2024年度" :value="2024" />
          <el-option label="2023年度" :value="2023" />
          <el-option label="2022年度" :value="2022" />
        </el-select>
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

    <el-table v-loading="listLoading" :data="tableData" border stripe style="width: 100%; margin-top: 15px;">
      <el-table-column prop="category" :label="getDimensionLabel" width="140" />
      <el-table-column prop="salesAmount" label="含税销售额" width="130" align="right">
        <template #default="scope">
          <span style="color: #f56c6c; font-weight: bold;">{{ formatCurrency(scope.row.salesAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="targetValueAddedAmount" label="增值业务目标" width="140" align="right">
        <template #default="scope">
          <span style="color: #1c9099; font-weight: bold;">{{ formatCurrency(scope.row.targetValueAddedAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="valueAddedAmount" label="增值业务金额" width="140" align="right">
        <template #default="scope">
          <span style="color: #e6a23c; font-weight: bold;">{{ formatCurrency(scope.row.valueAddedAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="completionRate" label="完成率" width="100" align="center">
        <template #default="scope">
          <span :style="{ color: scope.row.completionRate >= 100 ? '#f56c6c' : '#67c23a', fontWeight: '600' }">
            {{ scope.row.completionRate ? scope.row.completionRate.toFixed(2) + '%' : '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="valueAddedRate" label="增值业务占比" width="110" align="center">
        <template #default="scope">
          <span style="color: #e6a23c;">{{ scope.row.valueAddedRate ? scope.row.valueAddedRate.toFixed(2) + '%' : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否达标" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.completionRate >= 100 ? 'success' : 'warning'" size="small">
            {{ scope.row.completionRate >= 100 ? '达标' : '未达标' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="tableData.length > 0" class="summary-section">
      <div class="summary-title">汇总统计</div>
      <div class="summary-content">
        <div class="summary-item">
          <span class="summary-label">含税销售额:</span>
          <span class="summary-value sales">{{ formatCurrency(summaryData.totalSalesAmount) }}万</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">增值业务目标:</span>
          <span class="summary-value target">{{ formatCurrency(summaryData.totalTargetValueAddedAmount) }}万</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">增值业务金额:</span>
          <span class="summary-value actual">{{ formatCurrency(summaryData.totalValueAddedAmount) }}万</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">整体完成率:</span>
          <span class="summary-value" :style="{ color: summaryData.overallCompletionRate >= 100 ? '#67c23a' : '#e6a23c' }">{{ summaryData.overallCompletionRate.toFixed(2) }}%</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">整体占比:</span>
          <span class="summary-value rate">{{ summaryData.overallValueAddedRate.toFixed(2) }}%</span>
        </div>
      </div>
    </div>

    <div v-if="!hasData && !listLoading" class="no-data-tip">
      <el-empty description="暂无数据" />
    </div>
  </div>
</template>

<script>
import { getValueAddedBusinessNew, getSalesProfitReport } from '@/api/dataPlatform'
import { getDataPermissions } from '@/utils/permission'

export default {
  name: 'ValueAddedBusiness',
  data() {
    return {
      selectedYear: new Date().getFullYear(),
      summaryDimension: 'staff',
      timeDimension: 'year',
      listLoading: false,
      tableData: [],
      hasData: false,
      salesData: [],
      valueAddedData: []
    }
  },
  computed: {
    getDimensionLabel() {
      const labels = {
        staff: '人员名称',
        parentDept: '父级部门',
        department: '部门',
        business: '业务线',
        branch: '分支机构'
      }
      return labels[this.summaryDimension] || '人员名称'
    },
    summaryData() {
      const totalSalesAmount = this.tableData.reduce((sum, item) => sum + (item.salesAmount || 0), 0)
      const totalTargetValueAddedAmount = this.tableData.reduce((sum, item) => sum + (item.targetValueAddedAmount || 0), 0)
      const totalValueAddedAmount = this.tableData.reduce((sum, item) => sum + (item.valueAddedAmount || 0), 0)
      const overallCompletionRate = totalTargetValueAddedAmount > 0 ? (totalValueAddedAmount / totalTargetValueAddedAmount) * 100 : 0
      const overallValueAddedRate = totalSalesAmount > 0 ? (totalValueAddedAmount / totalSalesAmount) * 100 : 0
      return {
        totalSalesAmount,
        totalTargetValueAddedAmount,
        totalValueAddedAmount,
        overallCompletionRate,
        overallValueAddedRate
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true

      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      const currentDay = new Date().getDate() + 1

      const startDate = `${currentYear}-01-01`
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`

      const dataPermissions = getDataPermissions()
      let permissionName = ''
      for (let i = 0; i < dataPermissions.length; i++) {
        const dataPerm = dataPermissions[i]
        if (dataPerm.permissions && Array.isArray(dataPerm.permissions)) {
          for (let j = 0; j < dataPerm.permissions.length; j++) {
            const perm = dataPerm.permissions[j]
            if (perm.permissionType && perm.permissionType.toLowerCase() === 'employee') {
              permissionName = perm.permissionName || ''
              break
            }
          }
        }
        if (dataPerm.permissionType && dataPerm.permissionType.toLowerCase() === 'employee') {
          permissionName = dataPerm.permissionName || ''
          break
        }
      }

      const salesParams = {
        startDate,
        endDate
      }
      if (permissionName !== 'ALL') {
        salesParams.staffName = permissionName
      }

      const valueAddedParams = {
        startDate,
        endDate,
        personNameList: permissionName !== 'ALL' ? permissionName : undefined
      }

      try {
        const [salesResponse, valueAddedResponse] = await Promise.all([
          getSalesProfitReport(salesParams),
          getValueAddedBusinessNew(valueAddedParams)
        ])
        this.processSalesData(salesResponse)
        this.processValueAddedData(valueAddedResponse)
        this.mergeData()
      } catch (error) {
        console.error('获取增值业务数据失败:', error)
      } finally {
        this.listLoading = false
      }
    },

    processSalesData(response) {
      if (!response) {
        this.salesData = []
        return
      }

      const dataArray = Array.isArray(response) ? response : (Array.isArray(response.data) ? response.data : (response.data?.data || []))

      const isGroupDimension = ['business', 'branch'].includes(this.summaryDimension)

      if (isGroupDimension) {
        const groupedMap = new Map()
        dataArray.forEach(item => {
          const category = this.summaryDimension === 'business'
            ? (item['业务线'] || '')
            : (item['分支机构'] || '')
          if (!category) return

          if (!groupedMap.has(category)) {
            groupedMap.set(category, {
              category,
              salesAmount: 0,
              targetValueAddedAmount: 0
            })
          }
          const grouped = groupedMap.get(category)
          grouped.salesAmount += parseFloat(item['含税销售额']) || 0
          grouped.targetValueAddedAmount += parseFloat(item['MB_sales_zz']) || parseFloat(item['MB_sales_zz业务目标']) || 0
        })
        this.salesData = Array.from(groupedMap.values())
      } else {
        const dimensionKey = this.getDimensionKey()
        this.salesData = dataArray.map(item => ({
          category: item[dimensionKey] || item['人员名称'] || item['业务员'] || '',
          salesAmount: parseFloat(item['含税销售额']) || 0,
          targetValueAddedAmount: parseFloat(item['MB_sales_zz']) || parseFloat(item['MB_sales_zz业务目标']) || 0
        }))
      }
    },

    processValueAddedData(response) {
      if (!response) {
        this.valueAddedData = []
        return
      }
      const dataArray = Array.isArray(response) ? response : (Array.isArray(response.data) ? response.data : (response.data?.data || []))

      const isGroupDimension = ['business', 'branch'].includes(this.summaryDimension)

      if (isGroupDimension) {
        const groupedMap = new Map()
        dataArray.forEach(item => {
          const category = this.summaryDimension === 'business'
            ? (item['业务线'] || '')
            : (item['分支机构'] || '')
          if (!category) return

          if (!groupedMap.has(category)) {
            groupedMap.set(category, {
              category,
              valueAddedAmount: 0
            })
          }
          const grouped = groupedMap.get(category)
          grouped.valueAddedAmount += parseFloat(item['总换算合计金额']) || parseFloat(item['总换算合计']) || 0
        })
        this.valueAddedData = Array.from(groupedMap.values())
      } else {
        const dimensionKey = this.getDimensionKey()
        const groupedData = new Map()
        dataArray.forEach(item => {
          const category = item[dimensionKey] || item['人员名称'] || item['业务员'] || ''
          if (!groupedData.has(category)) {
            groupedData.set(category, {
              category,
              valueAddedAmount: 0
            })
          }
          const grouped = groupedData.get(category)
          grouped.valueAddedAmount += parseFloat(item['总换算合计金额']) || parseFloat(item['总换算合计']) || 0
        })
        this.valueAddedData = Array.from(groupedData.values())
      }
    },

    mergeData() {
      const salesMap = new Map()
      this.salesData.forEach(item => {
        salesMap.set(item.category, item)
      })

      const vaMap = new Map()
      this.valueAddedData.forEach(item => {
        vaMap.set(item.category, item)
      })
      const allCategories = new Set([...salesMap.keys(), ...vaMap.keys()])
      this.tableData = Array.from(allCategories).map(category => {
        const salesItem = salesMap.get(category) || {}
        const vaItem = vaMap.get(category) || {}
        const salesAmount = salesItem.salesAmount || 0
        const targetValueAddedAmount = salesItem.targetValueAddedAmount || 0
        const valueAddedAmount = vaItem.valueAddedAmount || 0
        const completionRate = targetValueAddedAmount > 0 ? (valueAddedAmount / targetValueAddedAmount) * 100 : 0
        const valueAddedRate = salesAmount > 0 ? (valueAddedAmount / salesAmount) * 100 : 0

        return {
          category,
          salesAmount,
          targetValueAddedAmount,
          valueAddedAmount,
          completionRate,
          valueAddedRate
        }
      })

      this.tableData = this.tableData.filter(item => item.salesAmount > 0 || item.valueAddedAmount > 0)
      this.tableData.sort((a, b) => b.targetValueAddedAmount - a.targetValueAddedAmount)
      this.hasData = this.tableData.length > 0
      console.log('Merged table data:', this.tableData)
    },

    getDimensionKey() {
      const dimensionKeyMap = {
        staff: '人员名称',
        parentDept: '父级部门',
        department: '部门',
        business: '业务线',
        branch: '分支机构'
      }
      return dimensionKeyMap[this.summaryDimension] || '人员名称'
    },

    handleYearChange() {
      this.fetchData()
    },

    handleDimensionChange() {
      this.fetchData()
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
.value-added-business {
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
    flex-shrink: 0;
    padding-right: 8px;
  }

  .no-data-tip {
    padding: 40px 0;
    text-align: center;
  }

  .summary-section {
    margin-top: 20px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #ebeef5;
  }

  .summary-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e4e7ed;
  }

  .summary-content {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
  }

  .summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .summary-label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }

  .summary-value {
    font-size: 16px;
    font-weight: 600;
    color: #303133;

    &.sales {
      color: #f56c6c;
    }

    &.target {
      color: #1c9099;
    }

    &.actual {
      color: #e6a23c;
    }

    &.rate {
      color: #409eff;
    }
  }
}
</style>

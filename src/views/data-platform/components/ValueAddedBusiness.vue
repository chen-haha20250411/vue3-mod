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

    <el-table :data="tableData" border stripe style="width: 100%; margin-top: 15px;" v-loading="listLoading">
      <el-table-column prop="category" :label="getDimensionLabel" width="120"></el-table-column>
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
  mounted() {
    this.fetchData()
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
    }
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      const currentDay = new Date().getDate()+1
      
      const startDate = `${currentYear}-01-01`
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`

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

      const salesParams = {
        startDate,
        endDate
      }
      if (permissionValue !== 'ALL') {
        salesParams.staffName = employeeName
      }

      const valueAddedParams = {
        startDate,
        endDate,
        personNameList: permissionValue !== 'ALL' ? permissionValue : undefined
      }

      console.log('ValueAdded salesParams:', salesParams)
      console.log('ValueAdded valueAddedParams:', valueAddedParams)

      try {
        const [salesResponse, valueAddedResponse] = await Promise.all([
          getSalesProfitReport(salesParams),
          getValueAddedBusinessNew(valueAddedParams)
        ])

        console.log('Sales response:', salesResponse)
        console.log('ValueAdded response:', valueAddedResponse)

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
      
      this.salesData = dataArray.map(item => {
        const dimensionKey = this.getDimensionKey()
        return {
          category: item[dimensionKey] || item['人员名称'] || item['业务员'] || '',
          salesAmount: parseFloat(item['含税销售额']) || 0,
          targetValueAddedAmount: parseFloat(item['MB_sales_zz']) || parseFloat(item['MB_sales_zz业务目标']) || 0
        }
      })
    },

    processValueAddedData(response) {
      console.log('processValueAddedData - response:', response)
      if (!response) {
        this.valueAddedData = []
        return
      }
      
      const dataArray = Array.isArray(response) ? response : (Array.isArray(response.data) ? response.data : (response.data?.data || []))
      const dimensionKey = this.getDimensionKey()
      const groupedData = new Map()
      
      dataArray.forEach(item => {
        let category = item[dimensionKey] || item['人员名称'] || item['业务员'] || ''
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
}
</style>

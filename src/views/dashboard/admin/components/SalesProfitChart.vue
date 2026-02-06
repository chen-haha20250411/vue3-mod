<template>
  <div class="sales-profit-chart-container">
    <div class="chart-filter">
      <el-radio-group v-model="timeDimension" size="small" @change="handleDimensionChange">
        <el-radio-button label="week">周</el-radio-button>
        <el-radio-button label="month">月度</el-radio-button>
        <el-radio-button label="quarter">季度</el-radio-button>
        <el-radio-button label="year">年度</el-radio-button>
      </el-radio-group>
    </div>
    <div ref="chartRef" :style="{height: chartHeight, width: '100%'}" />
  </div>
</template>

<script>
var echarts = require('echarts')
require('echarts/theme/macarons')
var mapGetters = require('vuex').mapGetters
var getSalesProfitReport = require('@/api/salesProfit').getSalesProfitReport

module.exports = {
  name: 'SalesProfitChart',
  props: {
    height: {
      type: String,
      default: '500px'
    }
  },
  data: function() {
    return {
      chart: null,
      timeDimension: 'week',
      chartHeight: '500px',
      startDate: '',
      endDate: ''
    }
  },
  computed: Object.assign(
    mapGetters(['roles', 'name'])
  ),
  mounted: function() {
    var self = this
    self.initDateRange()
    self.$nextTick(function() {
      self.fetchData()
    })
    window.addEventListener('resize', self.handleResize)
  },
  beforeUnmount: function() {
    var self = this
    window.removeEventListener('resize', self.handleResize)
    if (self.chart) {
      self.chart.dispose()
      self.chart = null
    }
  },
  methods: {
    handleResize: function() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    initDateRange: function() {
      var now = new Date()
      var dayOfWeek = now.getDay()
      var diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      var monday = new Date(now)
      monday.setDate(now.getDate() + diffToMonday)
      var sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)

      this.startDate = this.formatDate(monday)
      this.endDate = this.formatDate(sunday)
    },
    formatDate: function(date) {
      var year = date.getFullYear()
      var month = String(date.getMonth() + 1).padStart(2, '0')
      var day = String(date.getDate()).padStart(2, '0')
      return year + '-' + month + '-' + day
    },
    getDateRangeByDimension: function(dimension) {
      var now = new Date()
      var start, end

      switch (dimension) {
        case 'week':
          var dayOfWeek = now.getDay()
          var diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
          start = new Date(now)
          start.setDate(now.getDate() + diffToMonday)
          end = new Date(start)
          end.setDate(start.getDate() + 6)
          break
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1)
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          break
        case 'quarter':
          var quarter = Math.floor(now.getMonth() / 3)
          start = new Date(now.getFullYear(), quarter * 3, 1)
          end = new Date(now.getFullYear(), quarter * 3 + 3, 0)
          break
        case 'year':
          start = new Date(now.getFullYear(), 0, 1)
          end = new Date(now.getFullYear(), 11, 31)
          break
      }

      this.startDate = this.formatDate(start)
      this.endDate = this.formatDate(end)
    },
    isAdmin: function() {
      var adminRoles = ['admin', '超级管理员', '管理员', 'role_1']
      var self = this
      
      console.log('当前用户角色数组:', self.roles)
      console.log('当前用户名称:', self.name)
      
      if (!self.roles || self.roles.length === 0) {
        console.warn('角色数据为空，可能还未加载完成')
        return false
      }
      
      return self.roles.some(function(role) {
        var roleName = role ? role.toLowerCase() : ''
        console.log('检查角色:', role, '->', roleName)
        return adminRoles.some(function(admin) {
          return roleName.indexOf(admin.toLowerCase()) !== -1
        })
      })
    },
    fetchData: function() {
      var self = this
      var params = {
        startDate: self.startDate,
        endDate: self.endDate
      }

      if (!self.isAdmin()) {
        params.staffName = self.name
      }

      console.log('请求参数:', params)
      
      getSalesProfitReport(params).then(function(response) {
        console.log('API响应:', response)
        if (response && response.success) {
          var chartData = self.processChartData(response.data || [])
          self.initChart(chartData)
        } else {
          console.error('API返回错误:', response)
        }
      }).catch(function(error) {
        console.error('获取销售利润报表失败:', error)
      })
    },
    processChartData: function(data) {
      console.log('原始数据:', data)
      
      var filtered = data.filter(function(item) {
        var sales = item['含税销售额'] || 0
        return sales >= 1
      })

      console.log('过滤后数据(销售额>=1元):', filtered)

      filtered.sort(function(a, b) {
        return (b['含税销售额'] || 0) - (a['含税销售额'] || 0)
      })

      var result = {
        categories: filtered.map(function(item) {
          return item['业务员'] || ''
        }),
        salesAmount: filtered.map(function(item) {
          return parseFloat(((item['含税销售额'] || 0) / 10000).toFixed(1))
        }),
        profitMargin: filtered.map(function(item) {
          return parseFloat(((item['不含税毛利差价'] || 0) / 10000).toFixed(1))
        })
      }

      console.log('处理后的图表数据:', result)
      return result
    },
    initChart: function(chartData) {
      var self = this
      var dataLength = chartData.categories.length
      var barWidth = 30
      var spacing = 30
      var categoryWidth = barWidth + spacing
      var chartWidth = Math.max(dataLength * categoryWidth, 500)

      self.chartWidth = '100%'

      var maxSales = 0
      chartData.salesAmount.forEach(function(val) {
        if (val > maxSales) maxSales = val
      })
      var maxValue = maxSales > 0 ? parseFloat((maxSales * 1.2).toFixed(1)) : 100

      setTimeout(function() {
        self.initChartOption(chartData, chartWidth, maxValue)
      }, 100)
    },
    initChartOption: function(chartData, chartWidth, maxValue) {
      var self = this

      if (!self.$refs.chartRef) {
        return
      }

      if (self.chart) {
        self.chart.dispose()
      }

      self.chart = echarts.init(self.$refs.chartRef, 'macarons')

      var dataLength = chartData.categories.length

      var option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            if (!params || params.length === 0) return ''
            var name = params[0].name
            var html = '<div style="font-weight:bold;margin-bottom:5px;">' + name + '</div>'
            for (var i = 0; i < params.length; i++) {
              var param = params[i]
              html += '<div>' + param.marker + param.seriesName + '：' + param.value + ' 万</div>'
            }
            return html
          }
        },
        legend: {
          data: ['含税销售额', '不含税毛利差价'],
          top: 10,
          textStyle: {
            color: '#000'
          }
        },
        grid: {
          top: 80,
          left: 40,
          right: 20,
          bottom: 30,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.categories,
          axisLabel: {
            interval: 0,
            rotate: dataLength > 8 ? 45 : 0,
            fontSize: 12,
            color: '#000'
          },
          axisTick: {
            alignWithLabel: true
          },
          axisLine: {
            lineStyle: {
              color: '#000'
            }
          }
        },
        yAxis: {
          type: 'value',
          max: maxValue,
          axisTick: {
            show: false
          },
          name: '金额（万）',
          axisLabel: {
            color: '#000'
          },
          axisLine: {
            lineStyle: {
              color: '#000'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          }
        },
        dataZoom: chartWidth > document.body.clientWidth - 100 ? [{
          type: 'slider',
          xAxisIndex: 0,
          start: 0,
          end: Math.min(100, Math.floor((document.body.clientWidth - 100) / chartWidth * 100))
        }] : [],
        series: [
          {
            name: '含税销售额',
            type: 'bar',
            barWidth: '30px',
            data: chartData.salesAmount,
            itemStyle: {
              color: '#87CEEB'
            },
            label: {
              show: true,
              position: 'top',
              formatter: function(params) {
                return params.value
              },
              fontSize: 12,
              color: '#000',
              fontWeight: 'bold'
            }
          },
          {
            name: '不含税毛利差价',
            type: 'bar',
            barWidth: '30px',
            data: chartData.profitMargin,
            itemStyle: {
              color: '#FFA07A'
            },
            label: {
              show: true,
              position: 'top',
              formatter: function(params) {
                return params.value
              },
              fontSize: 12,
              color: '#000',
              fontWeight: 'bold'
            }
          }
        ]
      }

      self.chart.setOption(option, true)
    },
    handleDimensionChange: function(value) {
      this.getDateRangeByDimension(value)
      this.fetchData()
    }
  }
}
</script>

<style lang="scss" scoped>
.sales-profit-chart-container {
  width: 100%;
  overflow-x: auto;
  background: #fff;
  padding: 16px;

  .chart-filter {
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
  }
}
</style>

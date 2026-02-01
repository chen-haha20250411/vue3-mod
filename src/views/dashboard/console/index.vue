<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-left">
        <h1 class="dashboard-title">
          <svg-icon icon-class="dashboard" class="title-icon" />
          数据中控平台
        </h1>
        <span class="dashboard-subtitle">Data Control Platform</span>
      </div>
      <div class="header-right">
        <div class="time-display">
          <span class="time">{{ currentTime }}</span>
          <span class="date">{{ currentDate }}</span>
        </div>
        <el-button type="primary" round size="small" @click="refreshData">
          <svg-icon icon-class="refresh" /> 刷新数据
        </el-button>
      </div>
    </div>

    <div class="dashboard-content">
      <el-row :gutter="20" class="stat-row">
        <el-col :xs="12" :sm="6" :lg="3" v-for="(stat, index) in statCards" :key="index">
          <div class="stat-card" :class="stat.color">
            <div class="stat-icon">
              <svg-icon :icon-class="stat.icon" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                <count-to :start-val="0" :end-val="stat.value" :duration="2000" />
              </div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
            <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
              <svg-icon :icon-class="stat.trend > 0 ? 'trend-up' : 'trend-down'" />
              {{ Math.abs(stat.trend) }}%
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :sm="24" :lg="16">
          <div class="chart-card main-chart">
            <div class="card-header">
              <h3>
                <svg-icon icon-class="chart-line" />
                实时数据趋势
              </h3>
              <div class="card-actions">
                <el-radio-group v-model="timeRange" size="small">
                  <el-radio-button label="week">周</el-radio-button>
                  <el-radio-button label="month">月</el-radio-button>
                  <el-radio-button label="year">年</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="chart-body">
              <line-chart :chart-data="lineChartData" height="350px" />
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-card">
            <div class="card-header">
              <h3>
                <svg-icon icon-class="chart-pie" />
                数据分布
              </h3>
            </div>
            <div class="chart-body">
              <pie-chart height="300px" />
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :sm="12" :lg="8">
          <div class="chart-card">
            <div class="card-header">
              <h3>
                <svg-icon icon-class="chart-bar" />
                业务统计
              </h3>
            </div>
            <div class="chart-body">
              <bar-chart height="280px" />
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8">
          <div class="chart-card">
            <div class="card-header">
              <h3>
                <svg-icon icon-class="chart-radar" />
                能力评估
              </h3>
            </div>
            <div class="chart-body">
              <raddar-chart height="280px" />
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-card">
            <div class="card-header">
              <h3>
                <svg-icon icon-class="warning" />
                告警信息
              </h3>
              <el-tag type="danger" size="small">3条未处理</el-tag>
            </div>
            <div class="chart-body alert-list">
              <div v-for="(alert, index) in alertList" :key="index" class="alert-item" :class="alert.level">
                <div class="alert-time">{{ alert.time }}</div>
                <div class="alert-content">
                  <svg-icon :icon-class="alert.icon" />
                  <span>{{ alert.message }}</span>
                </div>
                <el-button type="text" size="small" @click="handleAlert(alert)">处理</el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :sm="24" :lg="12">
          <div class="chart-card">
            <div class="card-header">
              <h3>
                <svg-icon icon-class="table" />
                最新动态
              </h3>
              <el-button type="text" size="small">查看更多</el-button>
            </div>
            <div class="chart-body">
              <el-timeline>
                <el-timeline-item v-for="(activity, index) in activities" :key="index" :timestamp="activity.time" placement="top" :type="activity.type">
                  <p>{{ activity.content }}</p>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="12">
          <div class="chart-card">
            <div class="card-header">
              <h3>
                <svg-icon icon-class="progress" />
                任务进度
              </h3>
            </div>
            <div class="chart-body task-list">
              <div v-for="(task, index) in taskList" :key="index" class="task-item">
                <div class="task-header">
                  <span class="task-name">{{ task.name }}</span>
                  <span class="task-percent">{{ task.percent }}%</span>
                </div>
                <el-progress :percentage="task.percent" :status="task.status" :stroke-width="8" />
                <div class="task-meta">
                  <span>预计完成: {{ task.deadline }}</span>
                  <span>{{ task.assignee }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import CountTo from '@/components/CountTo'
import LineChart from '../admin/components/LineChart'
import PieChart from '../admin/components/PieChart'
import BarChart from '../admin/components/BarChart'
import RaddarChart from '../admin/components/RaddarChart'

export default {
  name: 'DashboardConsole',
  components: {
    CountTo,
    LineChart,
    PieChart,
    BarChart,
    RaddarChart
  },
  setup() {
    const currentTime = ref('')
    const currentDate = ref('')
    const timeRange = ref('week')
    let timer = null

    const statCards = ref([
      { icon: 'peoples', label: '用户总数', value: 12896, trend: 12.5, color: 'blue' },
      { icon: 'money', label: '交易金额', value: 856000, trend: 8.2, color: 'green' },
      { icon: 'shopping', label: '订单数量', value: 3847, trend: -2.3, color: 'orange' },
      { icon: 'message', label: '消息数', value: 5621, trend: 15.7, color: 'purple' },
      { icon: 'eye', label: '访问量', value: 89234, trend: 23.1, color: 'cyan' },
      { icon: 'component', label: '活跃度', value: 78, trend: 5.4, color: 'pink' },
      { icon: 'documentation', label: '文档数', value: 126, trend: 2.1, color: 'yellow' },
      { icon: 'star', label: '收藏量', value: 4532, trend: 18.9, color: 'red' }
    ])

    const lineChartData = ref({
      expectedData: [820, 932, 901, 934, 1290, 1330, 1320],
      actualData: [820, 932, 901, 934, 1290, 1330, 1320].map(x => x + Math.random() * 200 - 100)
    })

    const alertList = ref([
      { time: '10:32:15', message: '服务器CPU使用率超过90%', icon: 'server', level: 'critical' },
      { time: '10:28:43', message: '数据库连接数接近上限', icon: 'database', level: 'warning' },
      { time: '10:15:22', message: '用户登录失败次数异常', icon: 'user', level: 'info' }
    ])

    const activities = ref([
      { time: '10:30', content: '新用户注册: 张三', type: 'primary' },
      { time: '10:25', content: '订单完成: #20240131001', type: 'success' },
      { time: '10:20', content: '系统告警: 内存使用率偏高', type: 'warning' },
      { time: '10:15', content: '数据备份完成', type: '' }
    ])

    const taskList = ref([
      { name: '首页改版开发', percent: 75, status: '', deadline: '2024-02-15', assignee: '前端团队' },
      { name: 'API接口优化', percent: 100, status: 'success', deadline: '2024-01-30', assignee: '后端团队' },
      { name: '数据迁移工作', percent: 45, status: 'exception', deadline: '2024-02-28', assignee: 'DBA团队' },
      { name: '安全漏洞修复', percent: 90, status: '', deadline: '2024-02-10', assignee: '安全组' }
    ])

    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
      currentDate.value = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    }

    const refreshData = () => {
      lineChartData.value.actualData = lineChartData.value.actualData.map(
        x => Math.max(500, Math.min(1500, x + Math.random() * 100 - 50))
      )
    }

    const handleAlert = (alert) => {
      alertList.value = alertList.value.filter(a => a !== alert)
    }

    onMounted(() => {
      updateTime()
      timer = setInterval(updateTime, 1000)
    })

    onUnmounted(() => {
      if (timer) clearInterval(timer)
    })

    return {
      currentTime,
      currentDate,
      timeRange,
      statCards,
      lineChartData,
      alertList,
      activities,
      taskList,
      refreshData,
      handleAlert
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  .header-left {
    .dashboard-title {
      font-size: 28px;
      font-weight: bold;
      color: #fff;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;

      .title-icon {
        font-size: 32px;
        color: #409eff;
      }
    }

    .dashboard-subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      margin-left: 44px;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 24px;

    .time-display {
      text-align: right;

      .time {
        display: block;
        font-size: 24px;
        font-weight: bold;
        color: #fff;
      }

      .date {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
}

.stat-row {
  margin-bottom: 24px;

  .stat-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.1);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #fff;
      }

      .stat-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 4px;
      }
    }

    .stat-trend {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;

      &.up {
        color: #67c23a;
      }

      &.down {
        color: #f56c6c;
      }
    }

    &.blue .stat-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    &.green .stat-icon { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    &.orange .stat-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    &.purple .stat-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    &.cyan .stat-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
    &.pink .stat-icon { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    &.yellow .stat-icon { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
    &.red .stat-icon { background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); }
  }
}

.chart-row {
  margin-bottom: 24px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;

  &.main-chart {
    min-height: 420px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    h3 {
      font-size: 16px;
      font-weight: 500;
      color: #fff;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .chart-body {
    padding: 20px;
  }

  &.alert-list {
    max-height: 300px;
    overflow-y: auto;

    .alert-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      gap: 12px;

      &.critical {
        background: rgba(245, 108, 108, 0.1);
        border-left: 3px solid #f56c6c;
      }

      &.warning {
        background: rgba(230, 162, 60, 0.1);
        border-left: 3px solid #e6a23c;
      }

      &.info {
        background: rgba(64, 158, 255, 0.1);
        border-left: 3px solid #409eff;
      }

      .alert-time {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        min-width: 80px;
      }

      .alert-content {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #fff;
        font-size: 13px;
      }
    }
  }

  &.task-list {
    .task-item {
      padding: 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      margin-bottom: 12px;

      .task-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .task-name {
          color: #fff;
          font-weight: 500;
        }

        .task-percent {
          color: #409eff;
          font-weight: bold;
        }
      }

      .task-meta {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}

::v-deep(.el-timeline-item__timestamp) {
  color: rgba(255, 255, 255, 0.6);
}

::v-deep(.el-timeline-item__content p) {
  color: #fff;
  margin: 8px 0 0;
}

::v-deep(.el-progress-bar__outer) {
  background: rgba(255, 255, 255, 0.1);
}

::v-deep(.el-radio-button__inner) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

::v-deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #409eff;
  border-color: #409eff;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;

    .header-left .dashboard-subtitle {
      margin-left: 0;
    }

    .header-right {
      flex-direction: column;
      gap: 12px;
    }
  }

  .stat-card {
    margin-bottom: 12px;
  }
}
</style>

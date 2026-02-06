<template>
  <div class="403-container">
    <div class="403-content">
      <div class="403-icon">
        <svg-icon icon-class="lock" />
      </div>
      <h1 class="403-title">403</h1>
      <p class="403-description">抱歉，您没有权限访问此页面</p>
      <div class="403-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: '403',
  methods: {
    goHome() {
      this.$router.push('/')
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
403-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

403-content {
  text-align: center;
}

403-icon {
  font-size: 80px;
  color: #e6a23c;
  margin-bottom: 20px;
}

403-title {
  font-size: 60px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 20px 0;
}

403-description {
  font-size: 18px;
  color: #606266;
  margin-bottom: 30px;
}

403-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>

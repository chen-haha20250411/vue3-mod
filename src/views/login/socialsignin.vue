<template>
  <el-popover placement="bottom" width="auto" trigger="click">
    <template #reference>
      <svg-icon icon-class="icon" class="social-sign-icon" />
    </template>
    <div class="social-login-options">
      <div class="social-login-title">第三方登录</div>
      <div class="social-login-buttons">
        <el-button type="primary" size="small" @click="handleSocialLogin('wechat')">
          微信
        </el-button>
        <el-button type="success" size="small" @click="handleSocialLogin('dingtalk')">
          钉钉
        </el-button>
      </div>
    </div>
  </el-popover>
</template>

<script>
export default {
  methods: {
    handleSocialLogin(provider) {
      console.log('Social login with:', provider)
      this.$message.info('暂未开放第三方登录')
    }
  }
}
</script>

<style scoped>
.social-sign-icon {
  font-size: 20px;
  cursor: pointer;
  color: #5a5a5a;
}
.social-sign-icon:hover {
  color: #409eff;
}
.social-login-options {
  text-align: center;
}
.social-login-title {
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}
.social-login-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>

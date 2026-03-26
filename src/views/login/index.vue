<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-image">
        <div class="image-content">
          <h2>欢迎回来</h2>
          <p>登录您的账户，开启精彩旅程</p>
        </div>
      </div>
      <div class="login-form">
        <div class="form-header">
          <h1>账户登录</h1>
        </div>
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" @submit.native.prevent="handleLogin">
          <el-form-item prop="username">
            <div class="input-wrapper">
              <el-icon class="input-icon"><User /></el-icon>
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                class="input-field"
              />
            </div>
          </el-form-item>
          <el-form-item prop="password">
            <div class="input-wrapper">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input
                v-model="loginForm.password"
                :type="passwordType"
                placeholder="请输入密码"
                class="input-field"
              >
                <template #suffix>
                  <el-icon class="show-pwd" @click="showPwd">
                    <View v-if="passwordType === 'password'" />
                    <Hide v-else />
                  </el-icon>
                </template>
              </el-input>
            </div>
          </el-form-item>
          <el-form-item prop="verifyCode">
            <div class="verify-wrapper">
              <div class="verify-input">
                <el-icon class="input-icon"><Grid /></el-icon>
                <el-input
                  v-model="loginForm.verifyCode"
                  placeholder="请输入验证码"
                  class="input-field"
                  @keyup.enter.native="handleLogin"
                />
              </div>
              <div class="captcha-box" @click="refreshCode">
                <span v-if="captchaText" class="captcha-text">{{ captchaText }}</span>
                <span v-else class="captcha-loading">
                  <el-icon class="loading-icon"><Loading /></el-icon>
                </span>
                <el-icon class="refresh-icon"><Refresh /></el-icon>
              </div>
            </div>
          </el-form-item>
          <el-button :loading="loading" type="primary" class="login-btn" @click="handleLogin">登 录</el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import * as api from '@/api/login'
import { User, Lock, View, Hide, Grid, Loading, Refresh } from '@element-plus/icons-vue'

export default {
  name: 'Login',
  components: {
    User,
    Lock,
    View,
    Hide,
    Grid,
    Loading,
    Refresh
  },
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        verifyCode: ''
      },
      loginRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        verifyCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
      },
      passwordType: 'password',
      loading: false,
      captchaText: '',
      captchaKey: ''
    }
  },
  created() {
    this.refreshCode()
  },
  methods: {
    showPwd() {
      this.passwordType = this.passwordType === 'password' ? '' : 'password'
    },
    refreshCode() {
      api.getCaptcha().then(response => {
        console.log('Captcha response:', response)
        if (response) {
          this.captchaKey = response.captchaKey || ''
          this.captchaText = response.captcha || ''
        } else {
          this.captchaKey = ''
          this.captchaText = ''
        }
      }).catch((err) => {
        console.error('Captcha error:', err)
        this.captchaKey = ''
        this.captchaText = ''
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const data = {
            username: this.loginForm.username,
            password: this.loginForm.password,
            code: this.loginForm.verifyCode,
            captchaKey: this.captchaKey
          }
          console.log('Login data:', data)
          this.$store.dispatch('user/LoginByUsername', data).then(() => {
            this.loading = false
            this.$router.push('/')
            this.refreshCode()
          }).catch(() => {
            this.loading = false
            this.refreshCode()
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: transparent;
}

.login-container {
  display: flex;
  width: 900px;
  height: 550px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.login-image {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-content {
  text-align: center;
  color: white;
  padding: 40px;
}

.image-content h2 {
  font-size: 32px;
  margin-bottom: 16px;
  font-weight: 600;
}

.image-content p {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.6;
}

.login-form {
  flex: 1;
  padding: 50px 45px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: 36px;
}

.form-header h1 {
  font-size: 26px;
  color: #1a1a1a;
  margin-bottom: 8px;
  font-weight: 600;
}

.login-form >>> .el-form-item {
  margin-bottom: 20px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  height: 46px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s;
}

.input-wrapper:hover {
  border-color: #c0c0c0;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-icon {
  width: 20px;
  height: 20px;
  margin-left: 15px;
  margin-right: 12px;
  color: #999;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.input-field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
}

.input-field .el-input__inner {
  border: none;
  outline: none;
  background: transparent;
  height: 44px;
  line-height: 44px;
  padding: 0 15px 0 0;
  font-size: 15px;
  color: #333;
}

.input-field .el-input__inner::placeholder {
  color: #bbb;
}

.show-pwd {
  cursor: pointer;
  color: #999;
  font-size: 16px;
  transition: color 0.3s;
  margin-right: 10px;
}

.show-pwd:hover {
  color: #667eea;
}

.verify-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.verify-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.verify-input:focus-within {
  border-color: #667eea;
}

.verify-input .input-icon {
  padding: 0 12px;
  color: #667eea;
  font-size: 18px;
}

.verify-input .input-field {
  flex: 1;
}

.verify-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: none;
  background: transparent;
}

.captcha-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 110px;
  height: 40px;
  padding: 0 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.captcha-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.captcha-text {
  color: white;
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 5px;
  user-select: none;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.captcha-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-icon {
  color: white;
  font-size: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.refresh-icon {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  transition: all 0.3s;
}

.captcha-box:hover .refresh-icon {
  color: white;
  transform: rotate(180deg);
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  height: 46px;
  margin-top: 10px;
  letter-spacing: 4px;
  transition: all 0.3s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
}

.login-btn:active {
  transform: translateY(0);
}
</style>

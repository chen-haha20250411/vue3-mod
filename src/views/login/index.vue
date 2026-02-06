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
            <div class="input-wrapper">
              <el-icon class="input-icon"><Grid /></el-icon>
              <el-input
                v-model="loginForm.verifyCode"
                placeholder="请输入验证码"
                class="input-field verify-field"
                @keyup.enter.native="handleLogin"
              />
              <img 
                v-if="captchaSrc" 
                class="captcha-img" 
                :src="captchaSrc" 
                alt="验证码" 
                @click="refreshCode"
                title="点击刷新验证码"
              >
              <span v-else class="captcha-placeholder" @click="refreshCode">加载中...</span>
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
import { User, Lock, View, Hide, Grid } from '@element-plus/icons-vue'

export default {
  name: 'Login',
  components: {
    User,
    Lock,
    View,
    Hide,
    Grid
  },
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        verifyCode: '',
        uucode: ''
      },
      loginRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        verifyCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
      },
      passwordType: 'password',
      loading: false,
      captchaSrc: ''
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
        this.loginForm.uucode = response.data.uucode
        const imgData = response.data.img
        if (imgData) {
          if (imgData.startsWith('data:image')) {
            this.captchaSrc = imgData
          } else if (imgData.startsWith('/9j') || imgData.length > 100) {
            this.captchaSrc = 'data:image/jpeg;base64,' + imgData
          } else {
            this.captchaSrc = imgData
          }
        }
      }).catch((err) => {
        console.error('Captcha error:', err)
        this.captchaSrc = ''
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const data = {
            userName: btoa(this.loginForm.username),
            password: btoa(this.loginForm.password),
            verifyCode: this.loginForm.verifyCode,
            uucode: this.loginForm.uucode
          }
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

.verify-field {
  flex: 1;
  min-width: 0;
}

.captcha-img {
  width: 100px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px 10px 5px 0;
  border: 1px solid #dcdfe6;
}

.captcha-img:hover {
  opacity: 0.8;
}

.captcha-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 36px;
  margin: 5px 10px 5px 0;
  background: #f5f7fa;
  border-radius: 4px;
  color: #909399;
  cursor: pointer;
  font-size: 12px;
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

<template>
  <div>
    <el-form ref="accountForm" :model="accountForm" :rules="accountRules" label-width="120px">
      <el-form-item label="Name" prop="name">
        <el-input v-model.trim="accountForm.name" />
      </el-form-item>
      <el-form-item label="Email" prop="email">
        <el-input v-model.trim="accountForm.email" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitAccount">Update</el-button>
      </el-form-item>
    </el-form>

    <el-divider />

    <el-form ref="passwordForm" :model="passwordForm" :rules="passwordRules" label-width="120px">
      <h3>修改密码</h3>
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入原密码" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitPassword">修改密码</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { updatePassword } from '@/api/enterprise/user'

export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          email: ''
        }
      }
    }
  },
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入新密码'))
      } else if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    return {
      accountForm: {
        name: '',
        email: ''
      },
      accountRules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ]
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    user: {
      handler(val) {
        this.accountForm = {
          name: val.name || '',
          email: val.email || ''
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    submitAccount() {
      this.$refs.accountForm.validate((valid) => {
        if (valid) {
          this.$message({
            message: 'User information has been updated successfully',
            type: 'success',
            duration: 5 * 1000
          })
        }
      })
    },
    submitPassword() {
      this.$refs.passwordForm.validate((valid) => {
        if (valid) {
          updatePassword({
            oldPassword: this.passwordForm.oldPassword,
            newPassword: this.passwordForm.newPassword
          }).then(res => {
            this.$message.success('密码修改成功')
            this.$refs.passwordForm.resetFields()
          }).catch(err => {
            this.$message.error('密码修改失败：' + (err.msg || err.message || '网络错误'))
          })
        }
      })
    }
  }
}
</script>

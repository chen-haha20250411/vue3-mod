<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.loginName" placeholder="登录名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.roleinfoId" placeholder="角色" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in roleList" :key="item.roleInfoId" :label="item.roleName" :value="item.roleInfoId" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;margin-top: 20px;">
      <el-table-column label="ID" prop="operatorId" align="center" width="80">
        <template v-slot="scope">
          <span>{{ scope.row.operatorId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="真实姓名" min-width="150px" align="center">
        <template v-slot="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.realName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="登录名" width="150px" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.loginName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="120px" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.phoneTel }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" width="180px" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.email || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="公司名称" width="180px" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.companyName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="法人" width="100px" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.corporate || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="经办人" width="100px" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.jbrxm || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="经办人电话" width="130px" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.jbrphone || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统一社会信用代码" width="160px" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.unifiedCode || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="120px" align="center">
        <template v-slot="scope">
          <el-tag>{{ scope.row.roleName || '未分配' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="添加时间" width="160px" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.addTime || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后登录时间" width="160px" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.lastTime || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280px" align="center" fixed="right">
        <template v-slot="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">
            编辑
          </el-button>
          <el-button type="warning" size="mini" @click="handleAssignRoles(scope.row)">
            分配角色
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page="listQuery.currPageNo" :limit="listQuery.limit" @pagination="handlePagination" />


    <el-dialog :title="textMap[dialogStatus]" v-model="dialogFormVisible">
  
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="temp.realName" />
        </el-form-item>
        <el-form-item label="登录名" prop="loginName">
          <el-input v-model="temp.loginName" :disabled="dialogStatus === 'update'" />
        </el-form-item>
        <el-form-item label="密码" prop="loginPwd" v-if="dialogStatus === 'create'">
          <el-input v-model="temp.loginPwd" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneTel">
          <el-input v-model="temp.phoneTel" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item label="角色" prop="roleinfoId" v-if="dialogStatus === 'create'">
          <el-select v-model="temp.roleinfoId" class="filter-item" style="width: 100%;">
            <el-option v-for="item in roleList" :key="item.roleInfoId" :label="item.roleName" :value="item.roleInfoId" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="分配角色" v-model="dialogRoleVisible">
  
      <el-form label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户">
          <span>{{ currentUser.realName }} ({{ currentUser.loginName }})</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-radio-group v-model="temp.roleinfoId">
            <el-radio v-for="role in roleList" :key="role.roleInfoId" :label="role.roleInfoId">
              {{ role.roleName }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogRoleVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateUserRoles">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUsers, getAllRoles, createUser, updateUser, deleteUser, grantUserRoles, resetPassword } from '@/api/user'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'UserManagement',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      roleList: [],
      listQuery: {
        currPageNo: 1,
        limit: 20,
        loginName: undefined,
        roleinfoId: undefined
      },
      temp: {
        operatorId: undefined,
        realName: '',
        loginName: '',
        loginPwd: '',
        phoneTel: '',
        email: '',
        roleinfoId: undefined
      },
      dialogFormVisible: false,
      dialogRoleVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑用户',
        create: '新增用户'
      },
      rules: {
        realName: [{ required: true, message: '真实姓名必填', trigger: 'blur' }],
        loginName: [{ required: true, message: '登录名必填', trigger: 'blur' }],
        loginPwd: [{ required: true, message: '密码必填', trigger: 'blur' }],
        phoneTel: [{ required: true, message: '手机号必填', trigger: 'blur' }]
      },
      currentUser: {}
    }
  },
  created() {
    this.getAllRoles()
    this.getList()
  },
  methods: {
    getAllRoles() {
      getAllRoles().then(res => {
        console.log('角色列表响应:', res)
        const data = res.data || res
        this.roleList = data.list || data.items || (Array.isArray(data) ? data : [])
        if (this.roleList.length === 0) {
          console.warn('角色列表为空')
        }
      }).catch(err => {
        console.error('获取角色列表失败:', err)
      })
    },
    getList() {
      this.listLoading = true
      const params = {
        currPageNo: this.listQuery.currPageNo,
        limit: this.listQuery.limit,
        ...(this.listQuery.loginName && this.listQuery.loginName.trim() && { loginName: this.listQuery.loginName.trim() }),
        ...(this.listQuery.roleinfoId && { roleinfoId: this.listQuery.roleinfoId })
      }
      console.log('请求用户列表，参数:', JSON.stringify(params))
      getUsers(params).then(res => {
        console.log('用户列表响应:', res)
        const data = res.data || res
        const listData = data.items || data.list || data
        this.list = Array.isArray(listData) ? listData : []
        this.total = data.total || (this.list.length || 0)
        this.listLoading = false
      }).catch(err => {
        console.error('获取用户列表失败:', err)
        this.listLoading = false
        this.list = []
        this.total = 0
      })
    },
    handleFilter() {
      this.listQuery.currPageNo = 1
      this.getList()
    },
    handlePagination(val) {
      this.listQuery.currPageNo = val.page
      this.listQuery.limit = val.limit
      this.getList()
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      console.log('handleUpdate row:', row)
      this.temp = {
        operatorId: row.operatorId,
        realName: row.realName,
        loginName: row.loginName,
        loginPwd: '',
        phoneTel: row.phoneTel,
        email: row.email,
        roleinfoId: row.roleinfoId
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      console.log('dialogFormVisible:', this.dialogFormVisible)
    },
    handleDelete(row) {
      this.$confirm('确认删除该用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(row.operatorId).then(res => {
          if (res.code === 200 || res.success) {
            this.$message.success(res.msg || '删除成功')
            this.getList()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        }).catch(err => {
          console.error('删除用户失败:', err)
          this.$message.error('删除失败: ' + (err.message || err))
        })
      })
    },
    handleAssignRoles(row) {
      console.log('handleAssignRoles 点击行数据:', row)
      this.currentUser = row
      this.temp.roleinfoId = row.roleinfoId
      this.dialogRoleVisible = true
      console.log('dialogRoleVisible 设置为:', this.dialogRoleVisible)
      console.log('当前角色列表:', this.roleList)
      console.log('当前角色ID:', this.temp.roleinfoId)
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createUser(this.temp).then(res => {
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.$message.success(res.msg || '创建成功')
              this.getList()
            } else {
              this.$message.error(res.msg || '创建失败')
            }
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateUser(this.temp).then(res => {
            if (res.code === 200) {
              this.dialogFormVisible = false
              this.$message.success(res.msg || '更新成功')
              this.getList()
            } else {
              this.$message.error(res.msg || '更新失败')
            }
          })
        }
      })
    },
    updateUserRoles() {
      console.log('分配角色参数:', {
        operatorId: this.currentUser.operatorId,
        roleinfoId: this.temp.roleinfoId
      })
      grantUserRoles({
        operatorId: this.currentUser.operatorId,
        roleinfoId: this.temp.roleinfoId
      }).then(res => {
        console.log('角色分配响应:', res)
        if (res.code === 200 || res.success) {
          this.dialogRoleVisible = false
          this.$message.success(res.msg || '角色分配成功')
          this.getList()
        } else {
          this.$message.error(res.msg || '角色分配失败')
        }
      }).catch(err => {
        console.error('角色分配失败:', err)
        this.$message.error('角色分配失败: ' + (err.message || err))
      })
    },
    resetTemp() {
      this.temp = {
        operatorId: undefined,
        realName: '',
        loginName: '',
        loginPwd: '',
        phoneTel: '',
        email: '',
        roleinfoId: undefined
      }
    }
  }
}
</script>

<style scoped>
.filter-item {
  margin-right: 10px;
}
</style>

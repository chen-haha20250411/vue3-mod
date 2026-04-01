<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.loginName" placeholder="登录名" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.roleinfoId" placeholder="角色" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in roleList" :key="item.roleInfoId" :label="item.roleName" :value="item.roleInfoId" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        新增
      </el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;margin-top: 20px;">
      <el-table-column label="ID" prop="operatorId" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.operatorId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="真实姓名" min-width="100px" align="center">
        <template #default="scope">
          <span>{{ scope.row.realName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="登录名" width="120px" align="center">
        <template #default="scope">
          <el-button type="text" @click="handleDetail(scope.row)">
            {{ scope.row.loginName }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="部门" width="150px" align="center">
        <template #default="scope">
          <span>{{ scope.row.deptName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分支机构" width="150px" align="center">
        <template #default="scope">
          <span>{{ getBranchName(scope.row) || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="功能角色" min-width="110px" align="center">
        <template #default="scope">
          <span>{{ scope.row.roleName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据角色" min-width="110px" align="center">
        <template #default="scope">
          <el-tag v-for="role in getDisplayDataRoles(scope.row)" :key="role" size="small" style="margin-right: 5px;" type="info">
            {{ role }}
          </el-tag>
          <span v-if="getDisplayDataRoles(scope.row).length === 0">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="400px" align="center" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">
            编辑
          </el-button>
          <el-button type="success" size="mini" @click="handleAssignRoles(scope.row)">
            功能角色
          </el-button>
          <el-button type="warning" size="mini" @click="handleAssignDataRoles(scope.row)">
            数据角色
          </el-button>
          <el-button type="warning" size="mini" @click="handleResetPassword(scope.row)">
            重置密码
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page="listQuery.currPageNo" :limit="listQuery.limit" @pagination="handlePagination" />

    <!-- 详情对话框 -->
    <el-dialog v-model="dialogDetailVisible" title="用户详情">
      <el-form :model="currentUser" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="真实姓名">
          <span>{{ currentUser.realName }}</span>
        </el-form-item>
        <el-form-item label="登录名">
          <span>{{ currentUser.loginName }}</span>
        </el-form-item>
        <el-form-item label="部门">
          <span>{{ currentUser.deptName || '-' }}</span>
        </el-form-item>
        <el-form-item label="分支机构">
          <span>{{ getBranchName(currentUser) || '-' }}</span>
        </el-form-item>
        <el-form-item label="角色">
          <span>{{ currentUser.roleName || '-' }}</span>
        </el-form-item>
        <el-form-item label="数据角色">
          <div>
            <el-tag v-for="role in getDisplayDataRoles(currentUser)" :key="role" size="small" style="margin-right: 5px;" type="info">
              {{ role }}
            </el-tag>
            <span v-if="getDisplayDataRoles(currentUser).length === 0">-</span>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogFormVisible" :title="textMap[dialogStatus]">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="temp.realName" />
        </el-form-item>
        <el-form-item label="登录名" prop="loginName">
          <el-input v-model="temp.loginName" :disabled="dialogStatus === 'update'" />
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'create'" label="密码" prop="loginPwd">
          <el-input v-model="temp.loginPwd" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneTel">
          <el-input v-model="temp.phoneTel" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-select v-model="temp.deptId" class="filter-item" style="width: 100%;" placeholder="请选择部门" clearable>
            <el-option v-for="item in deptList" :key="item.id" :label="item.deptName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="分支机构" prop="branchId">
          <el-select v-model="temp.branchId" class="filter-item" style="width: 100%;" placeholder="请选择分支机构" clearable>
            <el-option v-for="item in branchList" :key="item.id" :label="item.branchName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleinfoId">
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

    <!-- 角色分配对话框 -->
    <el-dialog v-model="dialogRoleVisible" title="分配功能角色">
      <el-form label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户">
          <span>{{ currentUser.realName }} ({{ currentUser.loginName }})</span>
        </el-form-item>
        <el-form-item label="功能角色">
          <el-radio-group v-model="temp.roleInfoId">
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

    <!-- 数据角色分配对话框 -->
    <el-dialog v-model="dialogDataRoleVisible" title="分配数据角色">
      <el-form label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户">
          <span>{{ currentUser.realName }} ({{ currentUser.loginName }})</span>
        </el-form-item>
        <el-form-item label="数据角色">
          <div style="margin-bottom: 10px; font-size: 12px; color: #666;">
            当前选中的角色ID: {{ temp.dataRoles }}
          </div>
          <el-checkbox-group v-model="temp.dataRoles">
            <el-checkbox v-for="role in dataRoleList" :key="getRoleId(role)" :label="getRoleId(role)">
              {{ role.roleName }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDataRoleVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateDataRoles">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUsers, createUser, updateUser, deleteUser, getUserDetail, getRoles, grantUserRoles, resetPassword, getDeptList, getBranchList, grantUserDataRoles } from '@/api/enterprise/user'
import { getDataRoleList, getUserDataPermissions } from '@/api/data-permission'
import Pagination from '@/components/Pagination'

export default {
  name: 'EnterpriseUserManagement',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      roleList: [],
      dataRoleList: [],
      deptList: [],
      branchList: [],
      listQuery: {
        currPageNo: 1,
        limit: 25,
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
        deptId: undefined,
        branchId: undefined,
        roleInfoId: undefined,
        dataRoles: []
      },
      currentUser: {},
      dialogDetailVisible: false,
      dialogFormVisible: false,
      dialogRoleVisible: false,
      dialogDataRoleVisible: false,
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
      }
    }
  },
  created() {
    this.getRoles()
    this.getDataRoles()
    this.getDeptList()
    this.getBranchList()
    this.getList()
  },
  methods: {
    getRoles() {
      getRoles().then(res => {
        const data = res.data || res
        this.roleList = data.list || data.items || (Array.isArray(data) ? data : [])
      }).catch(err => {
        console.error('获取角色列表失败:', err)
      })
    },
    getDataRoles() {
      return getDataRoleList().then(res => {
        const data = res.data || res
        console.log('获取数据角色原始数据:', data)
        this.dataRoleList = data.list || data.items || (Array.isArray(data) ? data : [])
        console.log('获取数据角色列表成功:', this.dataRoleList)
        // 打印每个角色对象的详细信息
        this.dataRoleList.forEach((role, index) => {
          console.log(`角色${index}的结构:`, role)
          console.log(`角色${index}的所有字段:`, Object.keys(role))
        })
      }).catch(err => {
        console.error('获取数据角色列表失败:', err)
        // 不显示错误提示，避免干扰用户
      })
    },
    getDeptList() {
      getDeptList().then(res => {
        const data = res.data || res
        this.deptList = data.list || data.items || (Array.isArray(data) ? data : [])
        console.log('获取部门列表成功:', this.deptList)
      }).catch(err => {
        console.error('获取部门列表失败:', err)
      })
    },
    getBranchList() {
      getBranchList().then(res => {
        const data = res.data || res
        this.branchList = data.list || data.items || (Array.isArray(data) ? data : [])
        console.log('获取分支机构列表成功:', this.branchList)
      }).catch(err => {
        console.error('获取分支机构列表失败:', err)
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
      getUsers(params).then(res => {
        const data = res.data || res
        const listData = data.items || data.list || data
        this.list = Array.isArray(listData) ? listData : []
        this.total = data.total || (this.list.length || 0)
        console.log('获取用户列表成功:', this.list)
        this.listLoading = false
      }).catch(err => {
        console.error('获取用户列表失败:', err)
        this.listLoading = false
        this.list = []
        this.total = 0
        this.$message.error('获取用户列表失败: ' + (err.msg || err.message || '网络错误'))
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
      this.temp = {
        operatorId: row.operatorId,
        realName: row.realName,
        loginName: row.loginName,
        loginPwd: '',
        phoneTel: row.phoneTel || '',
        email: row.email || '',
        deptId: row.deptId || row.department?.id,
        branchId: row.branchId || row.branch?.id,
        roleinfoId: row.roleinfoId,
        dataRoles: row.dataRoles || []
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    handleDelete(row) {
      this.$confirm('确认删除该用户？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(row.operatorId).then(res => {
          // 响应拦截器已经处理了 success 和 code 字段，能到这里说明成功
          this.$message.success('删除成功')
          this.getList()
        }).catch(err => {
          this.$message.error('删除失败：' + (err.msg || err.message || '网络错误'))
        })
      })
    },
    handleAssignRoles(row) {
      this.currentUser = row
      this.temp.roleInfoId = row.roleinfoId
      this.dialogRoleVisible = true
    },
    handleAssignDataRoles(row) {
      this.currentUser = row
      console.log('handleAssignDataRoles - 原始用户数据:', row)
      console.log('handleAssignDataRoles - row.dataRoles:', row.dataRoles)
      console.log('handleAssignDataRoles - row.dataRoles类型:', Array.isArray(row.dataRoles) ? '数组' : typeof row.dataRoles)

      // 确保dataRoles只包含ID，不包含对象
      let roleIds = []
      if (Array.isArray(row.dataRoles)) {
        roleIds = row.dataRoles.map(role => {
          console.log('处理角色:', role)
          console.log('角色类型:', typeof role)
          return this.getRoleId(role)
        })
      }

      // 过滤掉undefined和null
      roleIds = roleIds.filter(id => id !== undefined && id !== null)

      console.log('处理后的角色ID列表:', roleIds)
      this.temp.dataRoles = roleIds

      this.getDataRoles().then(() => {
        console.log('对话框打开时的temp.dataRoles:', this.temp.dataRoles)
        console.log('对话框打开时的dataRoleList:', this.dataRoleList)
        this.dialogDataRoleVisible = true
      }).catch(() => {
        this.dialogDataRoleVisible = true
      })
    },
    handleResetPassword(row) {
      this.$confirm('确认重置该用户密码为 123456?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetPassword(row.operatorId).then(res => {
          // 响应拦截器已经处理了 success 和 code 字段，能到这里说明成功
          console.log('重置密码响应:', res)
          this.$message.success('密码重置成功')
        }).catch(err => {
          this.$message.error('密码重置失败：' + (err.msg || err.message || '网络错误'))
        })
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createUser(this.temp).then(res => {
            // 响应拦截器已经处理了 success 和 code 字段，能到这里说明成功
            this.dialogFormVisible = false
            this.$message.success('创建成功')
            this.getList()
          }).catch(err => {
            this.$message.error('创建失败：' + (err.msg || err.message || '网络错误'))
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateUser(this.temp).then(res => {
            // 响应拦截器已经处理了 success 和 code 字段，能到这里说明成功
            this.dialogFormVisible = false
            this.$message.success('更新成功')
            this.getList()
          }).catch(err => {
            this.$message.error('更新失败：' + (err.msg || err.message || '网络错误'))
          })
        }
      })
    },
    updateUserRoles() {
      grantUserRoles(this.currentUser.operatorId, {
        roleInfoId: this.temp.roleInfoId
      }).then(res => {
        // 响应拦截器已经处理了 success 和 code 字段，能到这里说明成功
        this.dialogRoleVisible = false
        this.$message.success('功能角色分配成功')
        this.getList()
      }).catch(err => {
        this.$message.error('功能角色分配失败：' + (err.msg || err.message || '网络错误'))
      })
    },
    updateDataRoles() {
      // 构建正确的请求格式
      const finalRequestData = {
        userId: this.currentUser.operatorId,
        roleIds: this.temp.dataRoles
      }
      grantUserDataRoles(finalRequestData).then(res => {
        // 响应拦截器已经处理了 success 和 code 字段，能到这里说明成功
        this.dialogDataRoleVisible = false
        this.$message.success('数据角色分配成功')
        this.getList()
      }).catch(err => {
        this.$message.error('数据角色分配失败：' + (err.msg || err.message || '网络错误'))
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
        deptId: undefined,
        branchId: undefined,
        roleInfoId: undefined,
        dataRoles: []
      }
    },
    getRoleId(role) {
      if (typeof role === 'object' && role !== null) {
        if (role.roleInfoId !== undefined) {
          return role.roleInfoId
        }
        if (role.id !== undefined) {
          return role.id
        }
        if (role.roleId !== undefined) {
          return role.roleId
        }
      }
      return role
    },
    getDisplayDataRoles(row) {
      if (!row) return []
      if (Array.isArray(row.dataRoles)) {
        return row.dataRoles.map(role => {
          if (typeof role === 'object' && role.roleName) {
            return role.roleName
          }
          return role
        })
      } else if (row.dataRoleNames) {
        return Array.isArray(row.dataRoleNames) ? row.dataRoleNames : [row.dataRoleNames]
      } else if (row.dataRoleList) {
        return row.dataRoleList.map(role => role.name || role.roleName || role)
      } else if (row.dataRole) {
        if (typeof row.dataRole === 'object' && row.dataRole.roleName) {
          return [row.dataRole.roleName]
        }
        return [row.dataRole]
      }
      return []
    },

    getBranchName(row) {
      if (!row) return ''
      if (typeof row.branch === 'object' && row.branch.branchName) {
        return row.branch.branchName
      }
      return row.branchName || row.branch || ''
    },
    handleDetail(row) {
      getUserDetail(row.operatorId).then(res => {
        const data = res.data || res
        console.log('获取用户详情成功:', data)
        this.currentUser = data
        this.dialogDetailVisible = true
      }).catch(err => {
        console.error('获取用户详情失败:', err)
        this.$message.error('获取用户详情失败: ' + (err.msg || err.message || '网络错误'))
      })
    }
  }
}
</script>

<style scoped>
.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.filter-item {
  flex-shrink: 0;
}
</style>

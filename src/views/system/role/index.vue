<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.roleName" placeholder="角色名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;margin-top: 20px;">
      <el-table-column label="ID" prop="roleInfoId" align="center" width="80">
        <template v-slot="scope">
          <span>{{ scope.row.roleInfoId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色名称" min-width="150px" align="center">
        <template v-slot="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.roleName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="200px" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" width="150px" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.loginName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250px" align="center" fixed="right">
        <template v-slot="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">
            编辑
          </el-button>
          <el-button type="warning" size="mini" @click="handlePermission(scope.row)">
            权限
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
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="temp.roleName" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="temp.remark" type="textarea" :rows="3" />
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

    <el-dialog title="分配权限" v-model="dialogPermissionVisible" width="600px">
      <div style="margin-bottom: 15px;">
        <strong>角色：{{ currentRole.roleName }}</strong>
      </div>
      <el-tree
        v-if="permissionTreeData.length > 0"
        ref="permissionTree"
        :data="permissionTreeData"
        :props="defaultProps"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedPermissions"
        class="permission-tree"
      />
      <div v-else class="no-permission">
        暂无权限数据
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogPermissionVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateRolePermissions">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRoles, createRole, updateRole, deleteRole, getRoleTreeEdit } from '@/api/role'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'RoleManagement',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        currPageNo: 1,
        limit: 20,
        roleName: undefined
      },
      temp: {
        roleInfoId: undefined,
        roleName: '',
        remark: ''
      },
      dialogFormVisible: false,
      dialogPermissionVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑角色',
        create: '新增角色'
      },
      rules: {
        roleName: [{ required: true, message: '角色名称必填', trigger: 'blur' }]
      },
      currentRole: {},
      permissionTreeData: [],
      checkedPermissions: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getRoles(this.listQuery).then(res => {
        console.log('角色列表响应:', res)
        const data = res.data || res
        const listData = data.items || data.list || data
        this.list = Array.isArray(listData) ? listData : []
        this.total = data.total || (this.list.length || 0)
        this.listLoading = false
      }).catch(err => {
        console.error('获取角色列表失败:', err)
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
      this.temp = {
        roleInfoId: row.roleInfoId,
        roleName: row.roleName,
        remark: row.remark
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    handleDelete(row) {
      this.$confirm('确认删除该角色?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRole(row.roleInfoId).then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
      })
    },
    handlePermission(row) {
      this.currentRole = row
      this.checkedPermissions = []
      this.permissionTreeData = []
      this.dialogPermissionVisible = true

      getRoleTreeEdit(row.roleInfoId).then(res => {
        if (res.data && res.data.rootList) {
          this.permissionTreeData = this.buildTreeData(res.data.rootList)
          this.checkedPermissions = this.getCheckedKeys(res.data.rootList)
        }
      })
    },
    buildTreeData(data) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        children: item.children ? this.buildTreeData(item.children) : []
      }))
    },
    getCheckedKeys(data) {
      const keys = []
      const traverse = (nodes) => {
        nodes.forEach(node => {
          if (node.checked) {
            keys.push(node.id)
          }
          if (node.children) {
            traverse(node.children)
          }
        })
      }
      traverse(data)
      return keys
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createRole(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$message.success('创建成功')
            this.getList()
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateRole(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$message.success('更新成功')
            this.getList()
          })
        }
      })
    },
    updateRolePermissions() {
      const checkedKeys = this.$refs.permissionTree.getCheckedKeys()
      const halfCheckedKeys = this.$refs.permissionTree.getHalfCheckedKeys()
      const authStr = [...checkedKeys, ...halfCheckedKeys].join(',')

      updateRole({
        roleInfoId: this.currentRole.roleInfoId,
        roleName: this.currentRole.roleName,
        remark: this.currentRole.remark,
        authStr: authStr
      }).then(() => {
        this.dialogPermissionVisible = false
        this.$message.success('权限更新成功')
      })
    },
    resetTemp() {
      this.temp = {
        roleInfoId: undefined,
        roleName: '',
        remark: ''
      }
    }
  }
}
</script>

<style scoped>
.filter-item {
  margin-right: 10px;
}
.permission-tree {
  max-height: 400px;
  overflow-y: auto;
}
.no-permission {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>

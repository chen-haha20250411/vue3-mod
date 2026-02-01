<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.role_id" placeholder="选择角色" clearable class="filter-item" style="width: 200px">
        <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增规则
      </el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;margin-top: 20px;">
      <el-table-column label="ID" prop="id" align="center" width="80">
        <template v-slot="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="规则名称" min-width="150px" align="center">
        <template v-slot="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="规则Key" width="150px" align="center">
        <template v-slot="scope">
          <span>{{ scope.row.key }}</span>
        </template>
      </el-table-column>
      <el-table-column label="规则类型" width="120px" align="center">
        <template v-slot="scope">
          <el-tag :type="scopeRowType(scope.row.type)">
            {{ scopeRowTypeLabel(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="关联角色" width="150px" align="center">
        <template v-slot="scope">
          <el-tag v-for="role in scope.row.roles" :key="role.id" style="margin-right: 5px;">
            {{ role.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100px" align="center">
        <template v-slot="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200px" align="center" fixed="right">
        <template v-slot="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">
            编辑
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="listQuery.page" v-model:limit="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" v-model:visible="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 500px; margin-left:50px;">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="规则Key" prop="key">
          <el-input v-model="temp.key" :disabled="dialogStatus === 'update'" />
        </el-form-item>
        <el-form-item label="规则类型" prop="type">
          <el-select v-model="temp.type" class="filter-item">
            <el-option v-for="item in typeOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据范围" prop="data_scope">
          <el-select v-model="temp.data_scope" class="filter-item">
            <el-option v-for="item in dataScopeOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则值" prop="value">
          <el-input v-model="temp.value" type="textarea" :rows="3" placeholder="请输入规则值，多个值用逗号分隔" />
        </el-form-item>
        <el-form-item label="关联角色">
          <el-checkbox-group v-model="temp.role_ids">
            <el-checkbox v-for="role in roleList" :key="role.id" :label="role.id">
              {{ role.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item">
            <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
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
  </div>
</template>

<script>
import { getDataPermissions, createDataPermission, updateDataPermission, deleteDataPermission } from '@/api/dataPermission'
import { getRoles } from '@/api/role'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

const statusOptions = [
  { key: 1, label: '启用' },
  { key: 0, label: '禁用' }
]

const typeOptions = [
  { key: 'dept', label: '部门数据' },
  { key: 'user', label: '用户数据' },
  { key: 'custom', label: '自定义' }
]

const dataScopeOptions = [
  { key: 'all', label: '全部数据' },
  { key: 'dept', label: '本部门数据' },
  { key: 'dept_child', label: '本部门及以下数据' },
  { key: 'self', label: '仅本人数据' },
  { key: 'custom', label: '自定义数据' }
]

export default {
  name: 'DataPermissionManagement',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        role_id: undefined
      },
      roleList: [],
      temp: {
        id: undefined,
        name: '',
        key: '',
        type: 'dept',
        data_scope: 'self',
        value: '',
        role_ids: [],
        status: 1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑数据权限规则',
        create: '新增数据权限规则'
      },
      rules: {
        name: [{ required: true, message: '规则名称必填', trigger: 'blur' }],
        key: [{ required: true, message: '规则Key必填', trigger: 'blur' }]
      },
      statusOptions,
      typeOptions,
      dataScopeOptions
    }
  },
  created() {
    this.getRoles()
    this.getList()
  },
  methods: {
    getRoles() {
      getRoles({ status: 1 }).then(response => {
        this.roleList = response.data.items
      })
    },
    getList() {
      this.listLoading = true
      getDataPermissions(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
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
      this.temp = Object.assign({}, row)
      this.temp.role_ids = row.roles ? row.roles.map(r => r.id) : []
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该数据权限规则?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDataPermission(row.id).then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
      })
    },
    scopeRowType(type) {
      const typeMap = {
        'dept': 'success',
        'user': 'warning',
        'custom': 'info'
      }
      return typeMap[type] || 'info'
    },
    scopeRowTypeLabel(type) {
      const item = this.typeOptions.find(t => t.key === type)
      return item ? item.label : type
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createDataPermission(this.temp).then(() => {
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
          updateDataPermission(this.temp.id, this.temp).then(() => {
            this.dialogFormVisible = false
            this.$message.success('更新成功')
            this.getList()
          })
        }
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        key: '',
        type: 'dept',
        data_scope: 'self',
        value: '',
        role_ids: [],
        status: 1
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

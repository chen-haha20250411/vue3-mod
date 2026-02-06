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


  </div>
</template>

<script>
import { getRoles, deleteRole } from '@/api/role'
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
      // 跳转到角色授权页面（新增模式）
      this.$router.push('/system/role/auth')
    },
    handleUpdate(row) {
      // 跳转到角色授权页面（编辑模式）
      this.$router.push({
        path: '/system/role/auth',
        query: { roleInfoId: row.roleInfoId }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该角色?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('正在删除角色:', row.roleInfoId)
        deleteRole(row.roleInfoId).then(res => {
          console.log('删除响应:', res)
          if (res.code === 200 || res.success) {
            this.$message.success(res.msg || '删除成功')
            this.getList()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        }).catch(err => {
          console.error('删除错误:', err)
          // 显示详细错误信息
          let errorMsg = '删除失败'
          if (err.response) {
            // 服务器返回了错误状态码
            errorMsg = `服务器错误(${err.response.status}): ${err.response.statusText}`
          } else if (err.message && err.message.includes('Network')) {
            errorMsg = '网络异常，请检查网络连接或后端服务是否启动'
          } else if (err.msg) {
            errorMsg = err.msg
          } else if (err.message) {
            errorMsg = err.message
          }
          this.$message.error(errorMsg)
        })
      })
    },
    handlePermission(row) {
      // 跳转到角色授权页面
      this.$router.push({
        path: '/system/role/auth',
        query: { roleInfoId: row.roleInfoId }
      })
    }
  }
}
</script>

<style scoped>
.filter-item {
  margin-right: 10px;
}
</style>

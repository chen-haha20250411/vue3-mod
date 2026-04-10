<template>
  <div class="app-container">
    <div v-show="showList">
      <div class="filter-container">
        <el-input v-model="q.title" class="filter-item" placeholder="项目名称" style="width:180px" />
        <el-input v-model="q.customer" class="filter-item" placeholder="招标单位" style="width:180px" />
        <el-input v-model="q.winnerPrincipal" class="filter-item" placeholder="中标人" style="width:180px" />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="query">{{ $t('table.search') }}</el-button>
        <el-button v-if="isAdmin" class="filter-item" type="primary" icon="el-icon-edit" @click="add">{{ $t('table.add') }}</el-button>
        <el-button class="filter-item" type="primary" icon="el-icon-refresh" @click="handleResetQuery()">重置</el-button>
      </div>

      <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;height:auto;">
        <el-table-column label="发布日期" width="120" align="center">
          <template #default="scope">
            <span>{{ scope.row.publishDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="项目名称" min-width="200" align="center">
          <template #default="scope">
            <span>{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="招标单位" width="250" align="center">
          <template #default="scope">
            <span>{{ scope.row.customer || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="中标人" width="250" align="center">
          <template #default="scope">
            <span>{{ scope.row.winnerPrincipal || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="中标金额" width="120" align="center">
          <template #default="scope">
            <span>{{ scope.row.winnerAmount ? '¥' + scope.row.winnerAmount : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="详细内容" width="100" align="center">
          <template #default="scope">
            <el-button v-if="scope.row.html_url" type="text" size="mini" @click="viewDetail(scope.row)">查看详情</el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column v-if="isAdmin" label="操作" width="150" align="center">
          <template #default="scope">
            <el-button type="text" size="mini" @click="update(scope.row.id)">修改</el-button>
            <el-button type="text" size="mini" style="color: #F56C6C;" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show=" total>0" v-model:page="q.currPageNo" v-model:limit="q.limit" style="float:right" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" @pagination="getList" />
    </div>
    <el-card v-show="!showList && isAdmin">
      <span>{{ title }}</span>
      <el-row>
        <el-col :span="18">
          <el-form ref="formValidate" :model="showdata" :rules="ruleValidate" label-width="120">
            <el-form-item label="发布日期" prop="publishDate">
              <el-date-picker v-model="showdata.publishDate" type="date" placeholder="选择发布日期" value-format="yyyy-MM-dd" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="项目编号" prop="projectNo">
              <el-input v-model="showdata.projectNo" placeholder="请输入项目编号" />
            </el-form-item>
            <el-form-item label="项目名称" prop="title">
              <el-input v-model="showdata.title" placeholder="请输入项目名称" />
            </el-form-item>
            <el-form-item label="招标单位" prop="customer">
              <el-input v-model="showdata.customer" placeholder="请输入招标单位" />
            </el-form-item>
            <el-form-item label="中标人" prop="winnerPrincipal">
              <el-input v-model="showdata.winnerPrincipal" placeholder="请输入中标人" />
            </el-form-item>
            <el-form-item label="中标金额" prop="winnerAmount">
              <el-input v-model="showdata.winnerAmount" placeholder="请输入中标金额" />
            </el-form-item>
            <el-form-item label="公告类型" prop="noticeType">
              <el-input v-model="showdata.noticeType" placeholder="请输入公告类型" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="showdata.remark" placeholder="请输入备注" />
            </el-form-item>
            <el-form-item label="原文链接" prop="html_url">
              <el-input v-model="showdata.html_url" placeholder="请输入原文链接" />
            </el-form-item>
            <el-form-item label="详细内容" prop="html_content">
              <el-input v-model="showdata.html_content" type="textarea" :rows="6" placeholder="请输入详细内容" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="mini" @click="handleSubmit()">提交</el-button>
              <el-button type="warning" size="mini" style="margin-left: 8px" @click="reload()">返回</el-button>
              <el-button v-show="!isView" size="mini" style="margin-left: 8px" @click="handleReset()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import * as api from '@/api/zhongbiao/list'
import '@/utils/rulestools.js'
import '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'ZhongbiaoList',
  components: { Pagination },
  data() {
    return {
      tableHeight: window.innerHeight - 280,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: false,
      isAdmin: false,
      q: {
        currPageNo: 1,
        limit: 25,
        title: '',
        customer: '',
        winnerPrincipal: '',
        startDate: '',
        endDate: '',
        dateRange: null
      },
      showList: true,
      title: null,
      showdata: {},
      ruleValidate: {
        projectNo: [
          { required: true, message: '项目编号不能为空', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '项目名称不能为空', trigger: 'blur' }
        ]
      },
      isView: false
    }
  },
  created() {
    this.getList()
    this.checkAdminPermission()
  },
  methods: {
    checkAdminPermission() {
      const roles = this.$store.state.user.roles || []
      this.isAdmin = roles.includes('admin')
    },
    getList() {
      this.listLoading = true
      api.fetchList(this.q).then(response => {
        let listData = null
        let totalData = 0

        if (response.data && response.data.data && response.data.data.items) {
          // 格式: { data: { data: { items: [...] } } }
          listData = response.data.data.items
          totalData = response.data.data.total || 0
        } else if (response.data && response.data.items) {
          // 格式: { data: { items: [...] } }
          listData = response.data.items
          totalData = response.data.total || 0
        } else if (response.items) {
          // 格式: { items: [...] }
          listData = response.items
          totalData = response.total || 0
        } else if (response.data && Array.isArray(response.data)) {
          // 格式: { data: [...] }
          listData = response.data
          totalData = response.data.length || 0
        } else if (Array.isArray(response)) {
          // 格式: [...]
          listData = response
          totalData = response.length || 0
        } else {
          listData = []
        }

        if (!Array.isArray(listData)) {
          listData = []
        }

        console.log('处理后的数据:', {
          listData: listData,
          totalData: totalData
        })

        this.list = listData
        this.total = totalData
        this.listLoading = false
      }).catch(error => {
        console.error('API调用失败:', error)
        this.listLoading = false
      })
    },
    handleSizeChange(val) {
      this.q.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.q.currPageNo = val
      this.getList()
    },

    query() {
      this.q.currPageNo = 1
      this.getList()
    },
    add() {
      this.showList = false
      this.title = '新增中标清单'
      this.showdata = {}
      this.isView = false
    },
    update(id) {
      this.showList = false
      this.title = '修改中标清单'
      this.isView = true
      this.getInfo(id)
    },
    getInfo(id) {
      api.getInfo(id).then(response => {
        this.showdata = response.data
      })
    },
    viewDetail(row) {
      if (row.id) {
        this.$router.push({
          path: '/zhongbiao/detail',
          query: {
            id: row.id
          }
        })
      } else {
        this.$message.warning('暂无详情信息')
      }
    },
    reload() {
      this.showList = true
      this.isView = false
      this.q.currPageNo = 1
      this.getList()
    },
    reload_nowpage() {
      this.showList = true
      this.isView = false
      this.getList()
    },
    saveOrUpdate() {
      this.$refs['formValidate'].validate((valid) => {
        if (valid) {
          api.saveOrupdate(this.showdata).then(response => {
            this.$notify({
              title: '成功',
              message: response.msg || '操作成功',
              type: 'success',
              duration: 2000
            })
            this.reload()
          })
        }
      })
    },
    handleDelete(id) {
      this.$confirm('确定要删除选中的记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api.fetchdelete(id).then(response => {
          this.reload_nowpage()
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      }).catch(() => {
      })
    },
    handleResetQuery() {
      this.q = {
        currPageNo: 1,
        limit: 25,
        title: '',
        customer: '',
        winnerPrincipal: '',
        startDate: '',
        endDate: '',
        dateRange: null
      }
      this.getList()
    },
    handleSubmit() {
      this.saveOrUpdate()
    },
    handleReset() {
      this.showdata = {}
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
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.filter-item {
  margin-bottom: 0;
}

.el-button {
  flex-shrink: 0;
}
</style>

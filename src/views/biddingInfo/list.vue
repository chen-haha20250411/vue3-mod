<template>
  <div class="app-container">
    <div v-show="showList">
      <div class="filter-container">
        <el-input v-model="q.projectNumber" style="width:200px" placeholder="项目编号" class="filter-item" />
        <el-input v-model="q.projectName" style="width:200px" placeholder="项目名称" class="filter-item" />
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width:220px" class="filter-item" />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="query">{{ $t('table.search') }}</el-button>
        <el-button v-has="'add'" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="add">{{ $t('table.add') }}</el-button>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" @click="handleResetQuery()">重置</el-button>
      </div>
      <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;height:auto;">
        <el-table-column label="发布日期" width="120" align="center">
          <template #default="scope">
            <span>{{ scope.row.publishDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="项目编号" width="200" align="center">
          <template #default="scope">
            <span>{{ scope.row.projectNumber }}</span>
          </template>
        </el-table-column>
        <el-table-column label="标题" min-width="300" align="center">
          <template #default="scope">
            <span>{{ scope.row.projectName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="详细内容" width="100" align="center">
          <template #default="scope">
            <el-button v-if="scope.row.htmlUrl" type="text" size="mini" @click="viewDetail(scope.row)">查看详情</el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show=" total>0" v-model:page="q.currPageNo" v-model:limit="q.limit" style="float:right" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" @pagination="getList" />
    </div>
    <el-card v-show="!showList">
      <span>{{ title }}</span>
      <el-row>
        <el-col :span="18">
          <el-form ref="formValidate" :model="showdata" :rules="ruleValidate" label-width="120">
            <el-form-item label="发布日期" prop="publishDate">
              <el-input
                v-model="showdata.publishDate"
                placeholder="请输入发布日期"
              />
            </el-form-item>
            <el-form-item label="招标公告类型" prop="noticeType">
              <el-input
                v-model="showdata.noticeType"
                placeholder="请输入招标公告类型"
              />
            </el-form-item>
            <el-form-item label="客户" prop="customer">
              <el-input
                v-model="showdata.customer"
                placeholder="请输入客户"
              />
            </el-form-item>
            <el-form-item label="中标人" prop="winnerPrincipal">
              <el-input
                v-model="showdata.winnerPrincipal"
                placeholder="请输入中标人"
              />
            </el-form-item>
            <el-form-item label="中标金额" prop="winnerAmount">
              <el-input
                v-model="showdata.winnerAmount"
                placeholder="请输入中标金额"
              />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="showdata.remark"
                placeholder="请输入备注"
              />
            </el-form-item>
            <el-form-item label="项目编号" prop="projectNo">
              <el-input
                v-model="showdata.projectNo"
                placeholder="请输入项目编号"
              />
            </el-form-item>
            <el-form-item label="项目名称" prop="title">
              <el-input
                v-model="showdata.title"
                placeholder="请输入项目名称"
              />
            </el-form-item>
            <el-form-item label="网页链接" prop="html_url">
              <el-input
                v-model="showdata.html_url"
                placeholder="请输入网页链接"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="mini"
                @click="handleSubmit()"
              >提交</el-button>
              <el-button
                type="warning"
                size="mini"
                style="margin-left: 8px"
                @click="reload()"
              >返回</el-button>
              <el-button
                v-show="!isView"
                size="mini"
                style="margin-left: 8px"
                @click="handleReset()"
              >重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import * as api from '@/api/biddingInfo/list'
import '@/utils/rulestools.js'
import '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination'
export default {
  name: 'Menu184',
  components: { Pagination },
  data() {
    return {
      tableHeight: window.innerHeight - 380, // 设置当前table的高�?
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: false,
      q: {
        currPageNo: 1,
        limit: 25,
        projectNumber: '',
        projectName: '',
        startDate: '',
        endDate: ''
      },
      dateRange: [],

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
  },
  methods: {
    getList() {
      this.listLoading = true
      api.fetchList(this.q).then(response => {
        let listData = []
        let totalData = 0

        if (response && response.items) {
          listData = response.items
          totalData = response.total || 0
        } else if (Array.isArray(response)) {
          // 直接返回数组的情况
          listData = response
          totalData = response.length || 0
        } else {
          listData = []
        }

        if (!Array.isArray(listData)) {
          listData = []
        }

        this.list = listData
        this.total = totalData
        this.listLoading = false
      }).catch(() => {
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
      // 处理日期范围
      if (this.dateRange && this.dateRange.length === 2) {
        this.q.startDate = this.dateRange[0] ? this.dateRange[0].toISOString().split('T')[0] : ''
        this.q.endDate = this.dateRange[1] ? this.dateRange[1].toISOString().split('T')[0] : ''
      } else {
        this.q.startDate = ''
        this.q.endDate = ''
      }
      this.reload()
    },
    add() {
      this.showList = false
      this.title = '新增'
      this.showdata = {}
      this.isView = false
    },
    update(id) {
      this.showList = false
      this.title = '修改'
      this.isView = true
      this.getInfo(id)
    },
    getInfo(id) {
      api.getInfo(id).then(response => {
        this.showdata = response.data
      })
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
      // no-op: keep current page number
      this.getList()
    },
    saveOrUpdate() {
      this.$refs['formValidate'].validate((valid) => {
        if (valid) {
          api.saveOrupdate(this.showdata).then(response => {
            this.$notify({ title: '成功', message: response.msg, type: 'success', duration: 2000 })
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
        })
      }).catch(() => {
        // 几点取消的提�?
      })
    },
    reloadSearch() {
      this.q = {
        projectNo: '',
        title: ''
      }
      this.reload()
    },
    handleSubmit() {
      this.saveOrUpdate()
    },
    handleReset() {
      // this.showdata = {}
      this.reload()
    },
    handleResetQuery() {
      this.q = {
        currPageNo: 1,
        limit: 25,
        projectNumber: '',
        projectName: '',
        startDate: '',
        endDate: ''
      }
      this.dateRange = []
      this.reload()
    },
    viewDetail(row) {
      if (row.htmlUrl) {
        window.open(row.htmlUrl, '_blank')
      }
    }
  }
}
</script>

<style scoped>
.filter-container {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 20px;
  padding: 5px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.filter-item {
  flex-shrink: 0;
}

.el-button {
  flex-shrink: 0;
}
</style>

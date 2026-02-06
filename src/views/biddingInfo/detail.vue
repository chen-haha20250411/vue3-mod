<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>招标详情</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="goBack">返回</el-button>
      </div>
      <div v-if="detailData" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="项目编号">{{ detailData.projectNumber }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{ detailData.projectName }}</el-descriptions-item>
          <el-descriptions-item label="发布日期">{{ detailData.publishDate }}</el-descriptions-item>
          <el-descriptions-item label="详细内容">
            <div v-html="detailData.totalContent || '暂无内容'"></div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div v-else class="no-data">
        <p>暂无数据</p>
      </div>
    </el-card>
  </div>
</template>

<script>
// import { getBiddingInfo } from '@/api/biddingInfo/list'

export default {
  name: 'BiddingInfoDetail',
  data() {
    return {
      detailData: null,
      loading: false
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    getDetail() {
      const id = this.$route.params.id
      if (!id) {
        this.$message.error('缺少ID参数')
        return
      }
      
      this.loading = true
      // 如果有API，可以调用
      // getBiddingInfo(id).then(res => {
      //   this.detailData = res.data
      // }).finally(() => {
      //   this.loading = false
      // })
      
      // 临时显示
      this.detailData = {
        projectNumber: id,
        projectName: '招标项目-' + id,
        publishDate: '2025-02-06',
        totalContent: '<p>招标详情内容...</p>'
      }
      this.loading = false
    },
    goBack() {
      this.$router.push('/biddingInfo/list')
    }
  }
}
</script>

<style scoped>
.detail-content {
  padding: 20px;
}
.no-data {
  text-align: center;
  padding: 50px;
  color: #999;
}
</style>

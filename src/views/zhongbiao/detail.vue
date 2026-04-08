<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="clearfix">
          <span>中标信息详情</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="goBack">返回列表</el-button>
        </div>
      </template>
      <div v-loading="loading" class="detail-content">
        <div v-if="detailData">
          <el-descriptions title="基本信息" :column="2" border>
            <el-descriptions-item label="发布日期">{{ detailData.publishDate }}</el-descriptions-item>
            <el-descriptions-item label="项目编号">{{ detailData.projectNo }}</el-descriptions-item>
            <el-descriptions-item label="项目名称" :span="2">{{ detailData.title }}</el-descriptions-item>
            <el-descriptions-item label="招标单位">{{ detailData.customer || '-' }}</el-descriptions-item>
            <el-descriptions-item label="公告类型">{{ detailData.noticeType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="中标人">{{ detailData.winnerPrincipal || '-' }}</el-descriptions-item>
            <el-descriptions-item label="中标金额">{{ detailData.winnerAmount ? '¥' + detailData.winnerAmount : '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ detailData.remark || '-' }}</el-descriptions-item>
            <el-descriptions-item label="原文链接">
              <a v-if="detailData.html_url" :href="detailData.html_url" target="_blank" style="color: #409EFF;">查看原文</a>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>

          <el-card shadow="never" style="margin-top: 20px;">
            <template #header>
              <span>详细内容</span>
            </template>
            <div v-if="detailData.html_content" class="content-html" v-html="detailData.html_content" />
            <div v-else-if="detailData.html_url" class="external-link">
              <p>详细内容为空，请查看原文链接</p>
              <el-button type="primary" :href="detailData.html_url" target="_blank">
                查看原文
              </el-button>
            </div>
            <div v-else class="no-content">
              <p>暂无内容</p>
            </div>
          </el-card>
        </div>
        <div v-else class="no-data">
          <el-empty description="暂无数据" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as api from '@/api/zhongbiao/list'

export default {
  name: 'ZhongbiaoDetail',
  data() {
    return {
      loading: false,
      id: this.$route.params.id,
      detailData: null
    }
  },
  async created() {
    await this.fetchDetail()
  },
  methods: {
    goBack() {
      this.$router.push('/zhongbiao/list')
    },
    async fetchDetail() {
      this.loading = true
      try {
        const id = this.$route.query.id
        if (id) {
          const response = await api.getInfo(id)
          if (response.data) {
            this.detailData = response.data
          } else if (response) {
            this.detailData = response
          } else {
            this.detailData = {
              id: id,
              html_content: '<p>暂无内容</p>'
            }
          }
        } else {
          const query = this.$route.query
          this.detailData = {
            id: this.id,
            projectNo: query.projectNo || '',
            title: query.title || '',
            publishDate: query.publishDate || '',
            customer: query.customer || '',
            noticeType: query.noticeType || '',
            winnerPrincipal: query.winnerPrincipal || '',
            winnerAmount: query.winnerAmount || '',
            remark: query.remark || '',
            htmlUrl: query.htmlUrl || '',
            html_content: query.html_content || ''
          }
        }
      } catch (e) {
        console.error('Fetch detail error:', e)
        this.detailData = {
          id: this.id,
          html_content: '<p>加载失败</p>'
        }
      }
      this.loading = false
    }
  }
}
</script>

<style scoped>
.detail-content {
  padding: 20px;
}

.content-html {
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
}

.content-html :deep(p) {
  margin: 10px 0;
}

.content-html :deep(img) {
  max-width: 100%;
  height: auto;
}

.no-data {
  text-align: center;
  padding: 40px 0;
}

.external-link {
  text-align: center;
  padding: 40px 20px;
}

.external-link p {
  margin-bottom: 20px;
  color: #606266;
}

.no-content {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}
</style>

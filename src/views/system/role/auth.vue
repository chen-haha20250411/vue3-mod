<template>
  <div class="app-container">
    <el-card class="role-auth-container">
      <el-row :gutter="20">
        <!-- 左侧权限树 -->
        <el-col :span="10">
          <div class="tree-container">
            <div class="tree-header">
              <span class="tree-title">权限</span>
              <span class="tree-stats">（已选 {{ currentCheckedCount }} 项）</span>
            </div>
            <el-tree
              ref="permissionTree"
              :data="permissionTreeData"
              :props="defaultProps"
              show-checkbox
              node-key="id"
              :default-checked-keys="checkedPermissions"
              :default-expanded-keys="expandedKeys"
              highlight-current
              :check-strictly="true"
              class="permission-tree"
              @check-change="handleCheckChange"
            />
          </div>
        </el-col>

        <!-- 右侧表单 -->
        <el-col :span="14">
          <div class="form-container">
            <el-form
              ref="dataForm"
              :rules="rules"
              :model="temp"
              label-position="top"
              label-width="100px"
            >
              <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="temp.roleName" placeholder="请输入角色名称" />
              </el-form-item>

              <el-form-item label="角色描述" prop="remark">
                <el-input
                  v-model="temp.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入角色描述"
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="submitForm">
                  提交
                </el-button>
                <el-button type="warning" @click="goBack">
                  返回
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { getRoleTreeEdit, createRole, updateRole, getRoleInfo } from '@/api/role'

export default {
  name: 'RoleAuth',
  data() {
    return {
      // 角色ID（编辑时传入）
      roleInfoId: undefined,
      // 是否为编辑模式
      isEdit: false,
      // 表单数据
      temp: {
        roleInfoId: undefined,
        roleName: '',
        remark: ''
      },
      // 权限树数据
      permissionTreeData: [],
      // 默认选中的权限
      checkedPermissions: [],
      // 默认展开的节点
      expandedKeys: [],
      // 当前选中的权限数量
      currentCheckedCount: 0,
      // 树形配置
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      // 表单验证规则
      rules: {
        roleName: [{ required: true, message: '角色名称必填', trigger: 'blur' }]
      }
    }
  },
  watch: {
    // 监听路由参数变化
    '$route.query.roleInfoId'(newVal) {
      this.initPage()
    }
  },
  created() {
    this.initPage()
  },
  methods: {
    /**
     * 初始化页面
     * 根据路由参数判断是新增模式还是编辑模式，并加载相应数据
     */
    initPage() {
      // 1. 重置表单数据
      this.temp = {
        roleInfoId: undefined,
        roleName: '',
        remark: ''
      }
      // 2. 重置权限树相关数据
      this.permissionTreeData = []
      this.checkedPermissions = []
      this.expandedKeys = []
      this.currentCheckedCount = 0

      // 3. 从路由参数获取角色ID
      const roleId = this.$route.query.roleInfoId
      if (roleId) {
        // 编辑模式：获取角色详情和权限树
        this.roleInfoId = parseInt(roleId)
        this.isEdit = true
        this.getRoleDetail()
      } else {
        // 新增模式：加载所有权限树
        this.roleInfoId = undefined
        this.isEdit = false
        this.loadPermissionTree()
      }
    },

    /**
     * 获取角色详情（包含权限树）
     * 编辑模式时调用，获取角色基本信息和已授权的权限树
     */
    async getRoleDetail() {
      try {
        // 1. 获取角色基本信息
        const roleRes = await getRoleInfo(this.roleInfoId)
        const roleData = roleRes.data || roleRes
        if (roleData) {
          this.temp.roleInfoId = roleData.roleInfoId || roleData.id || this.roleInfoId
          this.temp.roleName = roleData.roleName || roleData.name || ''
          this.temp.remark = roleData.remark || roleData.description || ''
        }

        // 2. 获取角色权限树
        const res = await getRoleTreeEdit(this.roleInfoId)
        let data = res.data || res

        if (!data || (Array.isArray(data) && data.length === 0)) {
          data = res
        }

        // 3. 处理权限树数据
        if (data && typeof data === 'object') {
          const treeData = data.rootList || data.treeList || data.permissionList || data.menus || data.tree || []
          if (treeData && treeData.length > 0) {
            this.permissionTreeData = this.buildTreeData(treeData)
            this.checkedPermissions = this.getCheckedKeys(treeData)
            this.expandedKeys = this.getParentKeysOfChecked(treeData)
            this.currentCheckedCount = this.checkedPermissions.length
          } else {
            console.warn('权限树数据为空')
            this.$message.warning('该角色暂无权限数据')
          }
        } else {
          console.warn('返回的权限数据格式不正确:', data)
          this.$message.warning('权限数据格式异常')
        }
      } catch (err) {
        console.error('获取角色详情失败:', err)
        // 根据错误类型显示不同的错误信息
        let errorMsg = '获取角色详情失败'
        if (err.response) {
          // 服务器返回了错误状态码
          const status = err.response.status
          if (status === 404) {
            errorMsg = '角色不存在或已被删除'
          } else if (status === 403) {
            errorMsg = '没有权限查看该角色信息'
          } else if (status === 500) {
            errorMsg = '服务器内部错误，请联系管理员'
          } else {
            errorMsg = `服务器错误(${status}): ${err.response.statusText}`
          }
        } else if (err.message && err.message.includes('Network')) {
          errorMsg = '网络异常，请检查网络连接或后端服务是否启动'
        } else if (err.msg) {
          errorMsg = err.msg
        }
        this.$message.error(errorMsg)
      }
    },

    /**
     * 加载权限树（新增模式）
     * 不传roleInfoId或传0表示获取所有权限
     */
    loadPermissionTree() {
      getRoleTreeEdit(0).then(res => {
        console.log('获取权限树响应:', res)
        const data = res.data || res
        // 支持多种可能的字段名，提高兼容性
        const treeData = data.rootList || data.treeList || data.permissionList || data.menus || data.tree || []
        if (treeData && treeData.length > 0) {
          this.permissionTreeData = this.buildTreeData(treeData)
          // 新增模式，默认不选中任何权限
          this.checkedPermissions = []
          // 新增模式下只展开第一级节点
          this.expandedKeys = this.getFirstLevelKeys(treeData)
        } else {
          console.warn('权限树数据为空')
          this.$message.warning('暂无权限数据，请联系管理员')
        }
      }).catch(err => {
        console.error('获取权限树失败:', err)
        // 根据错误类型显示不同的错误信息
        let errorMsg = '获取权限树失败'
        if (err.response) {
          const status = err.response.status
          if (status === 404) {
            errorMsg = '权限树接口不存在'
          } else if (status === 403) {
            errorMsg = '没有权限获取权限树数据'
          } else if (status === 500) {
            errorMsg = '服务器内部错误，请联系管理员'
          } else {
            errorMsg = `服务器错误(${status}): ${err.response.statusText}`
          }
        } else if (err.message && err.message.includes('Network')) {
          errorMsg = '网络异常，请检查网络连接或后端服务是否启动'
        } else if (err.msg) {
          errorMsg = err.msg
        }
        this.$message.error(errorMsg)
      })
    },

    /**
     * 构建树形数据
     * 将后端返回的权限数据转换为el-tree组件需要的格式
     * @param {Array} data - 后端返回的权限数据
     * @returns {Array} 转换后的树形数据
     */
    buildTreeData(data) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        children: item.children ? this.buildTreeData(item.children) : []
      }))
    },

    /**
     * 获取选中的权限key
     * 只获取叶子节点（没有children或children为空的节点），避免父节点级联勾选子节点
     * @param {Array} data - 权限树数据
     * @returns {Array} 选中的权限key数组
     */
    getCheckedKeys(data) {
      const keys = []
      const traverse = (nodes) => {
        nodes.forEach(node => {
          // 判断是否为叶子节点
          const isLeaf = !node.children || node.children.length === 0
          // 只收集叶子节点且已选中的权限
          if (isLeaf && node.checked) {
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

    /**
     * 获取所有节点的key
     * 用于展开所有节点
     * @param {Array} data - 权限树数据
     * @returns {Array} 所有节点的key数组
     */
    getAllKeys(data) {
      const keys = []
      const traverse = (nodes) => {
        nodes.forEach(node => {
          keys.push(node.id)
          if (node.children) {
            traverse(node.children)
          }
        })
      }
      traverse(data)
      return keys
    },

    /**
     * 获取选中节点的父级节点key
     * 只展开有选中的父级节点，提高用户体验
     * @param {Array} data - 权限树数据
     * @returns {Array} 需要展开的父级节点key数组
     */
    getParentKeysOfChecked(data) {
      const parentKeys = new Set()

      const findParents = (nodes, parentChain = []) => {
        nodes.forEach(node => {
          const currentChain = [...parentChain, node.id]

          // 如果有子节点，递归查找
          if (node.children && node.children.length > 0) {
            findParents(node.children, currentChain)
          } else if (node.checked) {
            // 叶子节点且被选中，添加所有父级到展开列表
            parentChain.forEach(parentId => parentKeys.add(parentId))
          }
        })
      }

      findParents(data)
      return Array.from(parentKeys)
    },

    /**
     * 获取第一级节点key
     * 用于新增模式下展开第一级节点
     * @param {Array} data - 权限树数据
     * @returns {Array} 第一级节点的key数组
     */
    getFirstLevelKeys(data) {
      return data.map(item => item.id)
    },

    /**
     * 处理权限树勾选变化
     * 更新当前选中的权限数量
     */
    handleCheckChange() {
      this.$nextTick(() => {
        const checkedKeys = this.$refs.permissionTree.getCheckedKeys()
        this.currentCheckedCount = checkedKeys.length
      })
    },

    /**
     * 根据选中的叶子节点，收集所有父节点ID
     * 提交表单时需要同时提交父节点ID，确保权限树结构完整
     * @param {Array} leafIds - 选中的叶子节点ID数组
     * @param {Array} treeData - 权限树数据
     * @returns {Array} 所有父节点ID数组
     */
    collectParentIds(leafIds, treeData) {
      const parentIds = new Set()

      const findParents = (nodes, targetIds, parentChain = []) => {
        nodes.forEach(node => {
          const currentChain = [...parentChain, node.id]

          if (node.children && node.children.length > 0) {
            // 有子节点，递归查找
            const hasSelectedChild = findParents(node.children, targetIds, currentChain)
            if (hasSelectedChild) {
              // 如果子树中有选中的节点，添加当前节点到父节点集合
              parentIds.add(node.id)
            }
          } else {
            // 叶子节点
            if (targetIds.includes(node.id)) {
              // 如果该叶子节点被选中，添加所有父节点
              parentChain.forEach(pid => parentIds.add(pid))
              return true
            }
          }
          return false
        })
        return false
      }

      findParents(treeData, leafIds)
      return Array.from(parentIds)
    },

    /**
     * 提交表单
     * 根据当前模式（新增/编辑）调用相应的API保存角色信息
     */
    submitForm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 1. 获取选中的叶子节点权限
          const checkedKeys = this.$refs.permissionTree.getCheckedKeys()

          // 2. 收集所有父节点ID（用于构建完整的权限树结构）
          const parentIds = this.collectParentIds(checkedKeys, this.permissionTreeData)

          // 3. 合并叶子节点和父节点ID，去重后转换为逗号分隔的字符串
          const allAuthIds = [...new Set([...checkedKeys, ...parentIds])]
          const authStr = allAuthIds.join(',')

          const submitData = {
            roleName: this.temp.roleName,
            remark: this.temp.remark,
            authStr: authStr
          }

          // 只有编辑模式才需要提交authStr
          if (this.isEdit) {
            // 编辑模式：更新现有角色
            submitData.roleInfoId = this.temp.roleInfoId
            submitData.authStr = authStr
            updateRole(submitData).then(res => {
              if (res.code === 200 || res.success) {
                this.$message.success(res.msg || '更新成功')
                this.goBack()
              } else {
                this.$message.error(res.msg || '更新失败')
              }
            }).catch(err => {
              console.error('更新角色失败:', err)
              let errorMsg = '更新失败'
              if (err.response) {
                errorMsg = `服务器错误(${err.response.status}): ${err.response.statusText}`
              } else if (err.msg) {
                errorMsg = err.msg
              } else if (err.message) {
                errorMsg = err.message
              }
              this.$message.error(errorMsg)
            })
          } else {
            // 新增模式：创建新角色
            createRole(submitData).then(res => {
              if (res.code === 200 || res.success) {
                this.$message.success(res.msg || '创建成功')
                this.goBack()
              } else {
                this.$message.error(res.msg || '创建失败')
              }
            }).catch(err => {
              console.error('创建角色失败:', err)
              let errorMsg = '创建失败'
              if (err.response) {
                errorMsg = `服务器错误(${err.response.status}): ${err.response.statusText}`
              } else if (err.msg) {
                errorMsg = err.msg
              } else if (err.message) {
                errorMsg = err.message
              }
              this.$message.error(errorMsg)
            })
          }
        }
      })
    },

    /**
     * 返回列表页
     * 跳转到角色管理列表页面
     */
    goBack() {
      this.$router.push('/system/role')
    }
  }
}
</script>

<style scoped>
.role-auth-container {
  padding: 20px;
  min-height: calc(100vh - 180px);
}

.tree-container {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  min-height: 500px;
}

.tree-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.tree-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.tree-stats {
  font-size: 14px;
  color: #909399;
  margin-left: 10px;
}

.permission-tree {
  max-height: 600px;
  overflow-y: auto;
}

.form-container {
  padding: 20px;
}
</style>

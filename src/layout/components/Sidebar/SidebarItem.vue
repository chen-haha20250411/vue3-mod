<template>
  <div v-if="!item.hidden">
    <template v-if="!hasChildren(item)">
      <app-link v-if="item.meta" :to="resolvePath()">
        <el-menu-item :index="resolvePath()" :class="{'submenu-title-noDropdown': !isNest}">
          <item :icon="item.meta && item.meta.icon" :title="item.meta.title" />
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu v-else :index="resolvePath()" popper-append-to-body>
      <template #title>
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
      </template>
      <sidebar-item
        v-for="child in (item.children || item.subMenuList)"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath()"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script>
import { isExternal } from '@/utils/validate'
import { resolvePath as resolvePathUtil } from '@/utils/path-browser'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  methods: {
    resolvePath() {
      // 如果是外部链接，直接返回
      if (this.item.meta?.external) {
        return this.item.path
      }
      // 如果是绝对路径，直接返回
      if (this.item.path && this.item.path.startsWith('/')) {
        return this.item.path
      }
      // 如果是外部 URL
      if (this.item.path && (this.item.path.startsWith('http://') || this.item.path.startsWith('https://'))) {
        return this.item.path
      }
      // 否则拼接路径
      if (this.basePath) {
        return resolvePathUtil(this.basePath, this.item.path)
      }
      return this.item.path || '/'
    },
    hasChildren(item) {
      // 支持 children 和 subMenuList 两种格式
      const children = item.children || item.subMenuList || []
      if (children.length === 0) {
        return false
      }
      const visibleChildren = children.filter(child => !child.hidden)
      return visibleChildren.length > 0
    }
  }
}
</script>

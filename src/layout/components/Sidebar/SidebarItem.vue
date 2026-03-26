<template>
  <div v-if="!item.hidden">
    <template v-if="!hasChildren(item)">
      <app-link v-if="item.meta" :to="resolvePath()">
        <el-menu-item :index="resolvePath()" :class="{'submenu-title-noDropdown': !isNest}">
          <item :icon="item.meta && item.meta.icon" :title="item.meta.title" />
        </el-menu-item>
      </app-link>
    </template>

    <el-submenu v-else :index="resolvePath()" popper-append-to-body>
      <template #title>
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath()"
        class="nest-menu"
      />
    </el-submenu>
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
      if (this.item.path && this.item.path.startsWith('/')) {
        return this.item.path
      }
      if (this.basePath && this.basePath.startsWith('/')) {
        return resolvePathUtil(this.basePath, this.item.path)
      }
      return this.item.path
    },
    hasChildren(item) {
      if (!item.children || item.children.length === 0) {
        return false
      }
      const visibleChildren = item.children.filter(child => !child.hidden)
      return visibleChildren.length > 0
    }
  }
}
</script>

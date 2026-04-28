<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
        class="sidebar-menu"
      >
        <sidebar-item
          v-for="route in sidebarRoutes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'permission_routes',
      'sidebar'
    ]),
    // 过滤掉 hidden 的路由，只显示菜单
    sidebarRoutes() {
      return this.permission_routes.filter(route => !route.hidden)
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables || {
        menuBg: '#ffffff',
        menuText: '#333333',
        menuActiveText: '#409EFF'
      }
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>

<style lang="scss" scoped>
$sidebar-bg: #f8f9fc;
$sidebar-hover: #e8ecf1;
$sidebar-active-bg: #e6f0ff;
$sidebar-text: #5a6275;
$sidebar-active-text: #409eff;
$sidebar-accent: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

.sidebar-menu {
  border-right: none;
  background: $sidebar-bg;

  :deep(.el-menu-item) {
    margin: 4px 8px;
    border-radius: 10px;
    height: 44px;
    line-height: 44px;
    transition: all 0.2s ease;

    &:hover {
      background: $sidebar-hover;
    }

    &.is-active {
      background: $sidebar-active-bg;
      color: $sidebar-active-text;
      font-weight: 600;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 24px;
        background: $sidebar-accent;
        border-radius: 0 4px 4px 0;
      }
    }
  }

  :deep(.el-sub-menu) {
    .el-sub-menu__title {
      margin: 4px 8px;
      border-radius: 10px;
      height: 44px;
      line-height: 44px;
      transition: all 0.2s ease;

      &:hover {
        background: $sidebar-hover;
      }
    }

    &.is-active > .el-sub-menu__title {
      color: $sidebar-active-text;
      font-weight: 600;
    }
  }

  :deep(.nest-menu .el-menu-item) {
    margin-left: 16px;
    margin-right: 8px;
    padding-left: 12px !important;
  }
}
</style>

<template>
  <div class="dashboard-editor-container">
    <sales-profit-chart />
  </div>
</template>

<script>
import SalesProfitChart from './components/SalesProfitChart'

export default {
  name: 'DashboardAdmin',
  components: {
    SalesProfitChart
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
}
</style>

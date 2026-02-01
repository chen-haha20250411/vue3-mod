import * as filters from './index'

export default {
  install(app) {
    app.config.globalProperties.$filters = filters
    
    // Provide filters to all components
    app.mixin({
      methods: {
        parseTime: filters.parseTime,
        formatTime: filters.formatTime,
        timeAgo: filters.timeAgo,
        numberFormatter: filters.numberFormatter,
        toThousandFilter: filters.toThousandFilter,
        uppercaseFirst: filters.uppercaseFirst
      }
    })
  }
}
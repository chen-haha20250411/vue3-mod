<template>
  <span>{{ displayValue }}</span>
</template>

<script>
import { ref, watch, onMounted } from 'vue'

export default {
  name: 'CountTo',
  props: {
    startVal: {
      type: Number,
      default: 0
    },
    endVal: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 2000
    },
    decimals: {
      type: Number,
      default: 0
    },
    separator: {
      type: String,
      default: ','
    },
    prefix: {
      type: String,
      default: ''
    },
    suffix: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const displayValue = ref(props.startVal)
    let animationFrame = null
    let startTime = null

    const formatNumber = (num) => {
      num = Number(num).toFixed(props.decimals)
      const str = num.toString()
      const parts = str.split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, props.separator)
      return props.prefix + parts.join('.') + props.suffix
    }

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / props.duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = props.startVal + (props.endVal - props.startVal) * easeOutQuart
      displayValue.value = formatNumber(currentValue)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    watch(() => props.endVal, () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
      startTime = null
      animationFrame = requestAnimationFrame(animate)
    })

    onMounted(() => {
      displayValue.value = formatNumber(props.startVal)
      animationFrame = requestAnimationFrame(animate)
    })

    return {
      displayValue
    }
  }
}
</script>

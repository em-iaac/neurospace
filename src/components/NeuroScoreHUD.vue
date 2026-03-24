<template>
  <div class="ns-hud">
    <p class="ns-hud-eyebrow">NeuroScore</p>

    <!-- Score number (tweened count-up) -->
    <div class="ns-hud-score" :style="{ color: scoreInfo.color }">
      {{ displayScore }}<span class="ns-hud-max">/ 100</span>
    </div>

    <!-- Face slider track -->
    <div class="ns-face-track">
      <!-- Gradient bar -->
      <div class="ns-face-bar">
        <div class="ns-face-fill" :style="{ width: score + '%' }"></div>
      </div>
      <!-- Indicator (face) clamped so it never overflows the track -->
      <div
        class="ns-face-indicator"
        :style="{ left: `calc(${clampedPct}% - 15px)` }"
      >
        <Transition name="ns-face" mode="out-in">
          <svg v-if="score <= 30" key="angry" class="ns-face-icon" viewBox="0 0 36 36" fill="none">
            <!-- Angry / stressed -->
            <circle cx="18" cy="18" r="16" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="14" r="1.8" fill="currentColor"/>
            <circle cx="24" cy="14" r="1.8" fill="currentColor"/>
            <path d="M11 26c2-3 10-3 14 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" transform="rotate(180 18 24.5)"/>
            <line x1="9" y1="10" x2="14" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="27" y1="10" x2="22" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="score <= 55" key="neutral" class="ns-face-icon" viewBox="0 0 36 36" fill="none">
            <!-- Neutral / meh -->
            <circle cx="18" cy="18" r="16" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="15" r="1.8" fill="currentColor"/>
            <circle cx="24" cy="15" r="1.8" fill="currentColor"/>
            <line x1="12" y1="24" x2="24" y2="24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="score <= 75" key="content" class="ns-face-icon" viewBox="0 0 36 36" fill="none">
            <!-- Content / slight smile -->
            <circle cx="18" cy="18" r="16" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="15" r="1.8" fill="currentColor"/>
            <circle cx="24" cy="15" r="1.8" fill="currentColor"/>
            <path d="M12 23c2 2.5 10 2.5 12 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          </svg>
          <svg v-else key="happy" class="ns-face-icon" viewBox="0 0 36 36" fill="none">
            <!-- Happy / restorative -->
            <circle cx="18" cy="18" r="16" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="14" r="1.8" fill="currentColor"/>
            <circle cx="24" cy="14" r="1.8" fill="currentColor"/>
            <path d="M10 21c2.5 5 13.5 5 16 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          </svg>
        </Transition>
      </div>
    </div>

    <!-- Label -->
    <span
      class="ns-hud-label"
      :style="{ color: scoreInfo.color, background: scoreInfo.bg }"
    >
      {{ scoreInfo.label }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getScoreLabel } from '../utils/neuroScore.js'

const props = defineProps({
  score: { type: Number, default: 0 },
})

const scoreInfo = computed(() => getScoreLabel(props.score))

// Clamp face position so it never overflows the right edge
const clampedPct = computed(() => Math.min(props.score, 96))

// Count-up animation for the displayed score number
const displayScore = ref(props.score)
let animFrame = null

watch(() => props.score, (newVal, oldVal) => {
  if (animFrame) cancelAnimationFrame(animFrame)
  const start = displayScore.value
  const end = newVal
  const duration = 400
  const startTime = performance.now()

  function step(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    displayScore.value = Math.round(start + (end - start) * eased)
    if (progress < 1) {
      animFrame = requestAnimationFrame(step)
    } else {
      displayScore.value = end
    }
  }

  animFrame = requestAnimationFrame(step)
})
</script>

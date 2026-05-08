<template>
  <div class="swipe-wrap" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" style="touch-action: pan-y;">
    <div class="swipe-front" :class="{ open: isOpen }" @click="handleClick">
      <slot />
      <div class="swipe-hint">
        <svg v-if="!isOpen" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </div>
    </div>
    <div class="swipe-actions">
      <button class="swipe-action-btn edit" @click.stop="$emit('edit')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        <span>Editar</span>
      </button>
      <button class="swipe-action-btn del" @click.stop="$emit('delete')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
        <span>Excluir</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ id: [String, Number] })
const emit = defineEmits(['click', 'edit', 'delete', 'opened'])
const isOpen = ref(false)

let startX = 0
let startY = 0
let isDragging = false

function onTouchStart(e) {
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  isDragging = false
}

function onTouchMove(e) {
  const dx = e.touches[0].clientX - startX
  const dy = e.touches[0].clientY - startY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
    isDragging = true
    if (e.cancelable) {
      e.preventDefault()
    }
  }
}

function onTouchEnd(e) {
  if (!isDragging) return
  const dx = e.changedTouches[0].clientX - startX
  if (dx < -40) {
    isOpen.value = true
    if (navigator.vibrate) navigator.vibrate(10); // Resposta tátil ao abrir
    emit('opened')
  }
  else if (dx > 20) isOpen.value = false
  isDragging = false
}

function handleClick() {
  if (isOpen.value) {
    isOpen.value = false
  } else {
    emit('click')
  }
}

defineExpose({ 
  close: () => { isOpen.value = false },
  id: props.id,
  isOpen 
})
</script>

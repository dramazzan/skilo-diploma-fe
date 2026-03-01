<script setup>
import AmbientMotionLayer from "@/shared/ui/AmbientMotionLayer.vue"

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ""
  }
})

defineEmits(["open", "dismiss"])
</script>

<template>
  <transition name="daily-reminder">
    <aside v-if="visible" class="daily-reminder ambient-host">
      <AmbientMotionLayer mode="panel" edge-fade="soft" intensity="low" />
      <div class="daily-reminder-text">
        <strong>Ежедневное напоминание</strong>
        <p>{{ message }}</p>
      </div>
      <div class="daily-reminder-actions">
        <button type="button" class="daily-reminder-btn daily-reminder-btn--primary" @click="$emit('open')">
          Открыть задания
        </button>
        <button type="button" class="daily-reminder-btn" @click="$emit('dismiss')">
          Скрыть
        </button>
      </div>
    </aside>
  </transition>
</template>

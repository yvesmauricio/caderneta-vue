<template>
  <div v-if="loading" class="drive-empty">Buscando backups...</div>
  <div v-else-if="!files.length" class="drive-empty">
    Nenhum backup do app encontrado no Google Drive.
  </div>
  <div v-else class="drive-backup-list">
    <button
      v-for="file in files"
      :key="file.id"
      class="drive-backup-row"
      @click="$emit('restore', file)"
    >
      <div class="drive-backup-info">
        <div class="drive-backup-name">{{ file.name }}</div>
        <div class="drive-backup-date">{{ driveService.fmtDataHora(file.createdTime) }}</div>
      </div>
      <div class="drive-backup-action">Restaurar</div>
    </button>
  </div>
</template>

<script setup>
import * as driveService from '../utils/googleDriveService.js'
defineProps({
  files: Array,
  loading: Boolean
})
defineEmits(['restore'])
</script>

<style scoped>
.drive-empty {
  padding: 18px 4px;
  color: var(--muted);
  font-size: 13px;
  text-align: center;
}
.drive-backup-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.drive-backup-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  min-height: 56px;
  border: 1.5px solid var(--border);
  border-radius: var(--r-sm);
  background: var(--surface);
  box-shadow: var(--shadow);
  font-family: var(--font-ui);
  cursor: pointer;
  text-align: left;
}
.drive-backup-row:active {
  background: var(--cream);
}
.drive-backup-info {
  flex: 1;
  min-width: 0;
}
.drive-backup-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.drive-backup-date {
  margin-top: 2px;
  font-size: 11px;
  color: var(--muted);
}
.drive-backup-action {
  color: var(--green);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}
</style>

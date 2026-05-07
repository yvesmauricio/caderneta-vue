<template>
  <div class="tela-bv">
    <div class="bv-wrap">
      <div class="bv-emoji">🍫</div>
      <div class="bv-title">Caderneta da Bete</div>
      <div class="bv-sub">Anote as vendas fiado em segundos.<br>Sem complicação, sem papel perdido.</div>

      <button class="btn-primary" @click="$emit('nova-loja')">
        ＋ Cadastrar primeira loja
      </button>

      <div class="bv-divider">
        <span>ou restaurar backup</span>
      </div>

      <button class="btn-secundario" @click="$emit('restaurar')">
        📥 Importar arquivo .json
      </button>

      <button class="btn-secundario btn-drive" @click="$emit('restaurar-drive')">
        <span class="bv-g-icon">G</span>
        Importar do Google Drive
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['nova-loja', 'restaurar', 'restaurar-drive'])
</script>

<style scoped>
.tela-bv {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg);
}

.bv-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 24px;
  text-align: center;
  gap: 12px;
}

.bv-emoji {
  font-size: 64px;
  line-height: 1;
  margin-bottom: 4px;
}

.bv-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--brown);
}

.bv-sub {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 8px;
}

.bv-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin: 4px 0;
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bv-divider::before,
.bv-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border2);
}

.btn-secundario {
  width: 100%;
  min-height: 44px;
  padding: 13px;
  border-radius: var(--r);
  border: 1.5px solid var(--border2);
  background: var(--surface);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 700;
  color: var(--brown);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background var(--t), border-color var(--t);
}

.btn-secundario:active {
  background: var(--cream);
  border-color: var(--brown-light);
}

.btn-drive {
  color: var(--blue);
  border-color: var(--blue-bg);
  background: var(--blue-bg);
}

.btn-drive:active {
  background: #dbeafe;
  border-color: var(--blue);
}

.bv-g-icon {
  font-size: 15px;
  font-weight: 800;
  color: var(--blue);
  line-height: 1;
}
</style>

<template>
  <div class="tela-bv">
    <div class="bv-wrap">
      <div class="bv-emoji">🍫</div>
      <div class="bv-title">Caderneta da Bete</div>
      <div class="bv-sub">Anote as vendas fiado em segundos.<br>Sem complicação, sem papel perdido.</div>
      <button class="btn-primary" @click="$emit('nova-loja')">
        ＋ Cadastrar primeira loja
      </button>
      <button class="btn-seguranca" @click="$emit('restaurar')">
        📥 Restaurar Backup anterior
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['nova-loja', 'restaurar'])
</script>

<style scoped>
.tela-bv {
  display: flex; flex-direction: column;
  height: 100%; background: var(--bg);
}
.bv-wrap {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 30px 24px; text-align: center; gap: 16px;
}
.bv-emoji { font-size: 64px; line-height: 1; }
.bv-title { font-size: 22px; font-weight: 800; color: var(--brown); }
.bv-sub   { font-size: 14px; color: var(--muted); line-height: 1.5; }
.btn-seguranca {
  width: 100%; padding: 14px; border-radius: var(--r);
  border: 1px solid var(--border2); background: var(--bg);
  font-family: var(--font-ui); font-size: 13px; font-weight: 700;
  color: var(--brown); cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
</style>

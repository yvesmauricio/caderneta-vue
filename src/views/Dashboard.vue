<template>
  <div class="tela-dashboard">
    <div class="topbar">
      <div></div>
      <div class="topbar-title">📒 Caderninho da Bete!</div>
      <button class="btn-back" style="background:transparent;box-shadow:none;" @click="refresh" title="Atualizar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </button>
    </div>

    <div class="dash-body">
      <!-- Saudação -->
      <div class="dash-greeting">
        <div class="dash-hello">{{ saudacao }}</div>
        <div class="dash-date-line">{{ dataBR }}</div>
      </div>

      <!-- KPIs -->
      <div class="dash-kpi-grid">
        <div class="dash-kpi-card destaque">
          <div class="dash-kpi-label">💰 Em Aberto</div>
          <div class="dash-kpi-val verde">R$ {{ fmt(totalAberto) }}</div>
        </div>
        <div class="dash-kpi-card alerta">
          <div class="dash-kpi-label">⚠️ Vencidos</div>
          <div class="dash-kpi-val vermelho">R$ {{ fmt(totalVencido) }}</div>
        </div>
        <!-- Ação rápida -->
        <button class="dash-action-btn" @click="$emit('go', 'lojas')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Fiado
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDB } from '../composables/useDB.js'

const emit = defineEmits(['go'])
const { getAll } = useDB()

const saudacao = ref('Olá! 👋')
const dataBR = ref('')
const totalAberto = ref(0)
const totalVencido = ref(0)
const vencimentos = ref([])

const fmt = v => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const hoje = () => new Date().toLocaleDateString('sv')
const fmtBR = raw => {
  if (!raw) return '--/--'
  const b = String(raw).split('T')[0]
  return /^\d{4}-\d{2}-\d{2}$/.test(b) ? b.split('-').reverse().join('/') : '--/--'
}

async function refresh() {
  const agora = new Date()
  const hora = agora.getHours()
  saudacao.value = hora < 12 ? 'Bom dia! ☀️' : hora < 18 ? 'Boa tarde! 🌤️' : 'Boa noite! 🌙'
  dataBR.value = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  const hj = hoje()
  const fiados = await getAll('fiados')
  const abertos = fiados.filter(f => f.saldo > 0.01)

  totalAberto.value = abertos.reduce((s, f) => s + f.saldo, 0)
  totalVencido.value = abertos
    .filter(f => f.dataVenc && f.dataVenc < hj)
    .reduce((s, f) => s + f.saldo, 0)

  const porCli = new Map()
  abertos.forEach(f => {
    if (!porCli.has(f.clienteId)) {
      porCli.set(f.clienteId, { clienteId: f.clienteId, nome: f.clienteNome, loja: f.lojaNome, saldo: 0, minVenc: f.dataVenc })
    }
    const c = porCli.get(f.clienteId)
    c.saldo += f.saldo
    if (f.dataVenc && (!c.minVenc || f.dataVenc < c.minVenc)) c.minVenc = f.dataVenc
  })

  vencimentos.value = [...porCli.values()]
    .map(c => ({ ...c, atrasado: c.minVenc && c.minVenc < hj }))
    .sort((a, b) => (a.minVenc || '9999') < (b.minVenc || '9999') ? -1 : 1)
    .slice(0, 8)
}

onMounted(refresh)
defineExpose({ refresh })
</script>

<style scoped>
.tela-dashboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg);
}

.dash-body {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 14px 14px 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dash-greeting {
  background: linear-gradient(135deg, var(--brown) 0%, var(--brown-mid) 100%);
  border-radius: var(--r);
  padding: 22px 18px;
  padding-right: 70px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
  flex-shrink: 0;
  overflow: visible;
}

.dash-greeting::after {
  content: '🍫';
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 42px;
  opacity: .18;
  pointer-events: none;
  line-height: 1;
}

.dash-hello {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.4;
}

.dash-date-line {
  font-size: 12px;
  opacity: .8;
}

.dash-kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  flex-shrink: 0;
}

.dash-kpi-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  padding: 14px 14px;
  box-shadow: var(--shadow);
}

.dash-kpi-card.destaque {
  border-color: rgba(26, 122, 69, .3);
  background: var(--green-bg);
}

.dash-kpi-card.alerta {
  border-color: rgba(185, 28, 28, .2);
  background: var(--red-bg);
}

.dash-kpi-label {
  font-size: 11px;
  color: var(--muted);
  font-weight: 600;
}

.dash-kpi-val {
  font-size: 18px;
  font-weight: 800;
  color: var(--brown);
  font-family: var(--font-mono);
  margin-top: 2px;
}

.dash-kpi-val.verde {
  color: var(--green);
}

.dash-kpi-val.vermelho {
  color: var(--red);
}

.dash-action-btn {
  grid-column: 1 / -1; /* Faz o botão ocupar as duas colunas */
  width: 100%;
  padding: 16px;
  border-radius: var(--r);
  border: none;
  background: var(--brown);
  color: #fff;
  font-family: var(--font-ui);
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(61, 32, 8, .3);
  flex-shrink: 0;
  transition: opacity var(--t);
}

.dash-action-btn:active {
  opacity: .85;
}

.dash-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dash-venc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dash-venc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  box-shadow: var(--shadow);
}

.dash-venc-item.urgente {
  border-color: #fecaca;
  background: #fff9f9;
}

.dash-venc-dot {
  font-size: 18px;
  flex-shrink: 0;
}

.dash-venc-info {
  flex: 1;
  min-width: 0;
}

.dash-venc-nome {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dash-venc-meta {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
}

.dash-venc-valor {
  font-size: 13px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--brown);
  flex-shrink: 0;
}
</style>

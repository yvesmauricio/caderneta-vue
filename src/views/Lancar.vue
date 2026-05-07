<template>
  <div class="tela-lancar">
    <div class="topbar">
      <button class="btn-back" @click="$emit('back')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="topbar-title">
        Lançar Fiado
        <div class="header-date-tags">
          <span class="tag-label-venda">Quando foi a venda?</span>
          <span class="tag-date-venda" @click="showDatePicker">{{ dataVendaFormatada }}</span>
          <span class="tag-date-venda" @click="showTimePicker">{{ horaVenda }}</span>
          <input
            type="date" ref="datePickerRef"
            style="position:absolute;opacity:0;pointer-events:none;width:0;height:0"
            v-model="dataVenda"
          >
          <input
            type="time" ref="timePickerRef"
            style="position:absolute;opacity:0;pointer-events:none;width:0;height:0"
            v-model="horaVenda"
          >
        </div>
      </div>
      <div></div>
    </div>

    <div class="lancar-body">

      <!-- Card cliente -->
      <div class="cliente-card">
        <div class="avatar">{{ initials(cliente?.nome) }}</div>
        <div class="cliente-info">
          <div class="cliente-nome">{{ cliente?.nome || '—' }}</div>
          <div class="cliente-loja">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>{{ loja?.nome || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Produtos -->
      <div>
        <div class="section-label">O que ela levou?</div>
        <div class="produtos-grid">
          <div
            v-for="p in produtos" :key="p.id"
            class="produto-card" :class="{ ativo: qtds[p.id] > 0 }"
          >
            <div class="prod-emoji">{{ p.emoji }}</div>
            <div class="prod-nome">{{ p.nome }}</div>
            <div class="prod-preco">R$ {{ fmtPreco(p.preco) }}</div>
            <div class="stepper">
              <button class="stepper-btn" :disabled="!qtds[p.id]" @click="dec(p)">−</button>
              <div class="stepper-qty">{{ qtds[p.id] || 0 }}</div>
              <button class="stepper-btn" @click="inc(p)">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Data vencimento -->
      <div>
        <div class="date-label">💰 Quando vai pagar?</div>
        <div class="chip-row">
          <button
            v-for="c in chips" :key="c.id"
            class="chip" :class="{ ativo: chipAtivo === c.id }"
            @click="setChip(c.id)"
          >{{ c.label }}</button>
        </div>
        <div class="date-field">
          <input type="date" class="date-input" v-model="dataVenc">
        </div>
      </div>

    </div>

    <!-- Footer total + salvar -->
    <div class="footer-fixo">
      <div class="footer-total">
        <div class="footer-total-label">Total da Compra</div>
        <div class="footer-total-val">R$ {{ fmt(total) }}</div>
      </div>
      <button class="btn-salvar" :disabled="total === 0" @click="salvar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Salvar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { useDB } from '../composables/useDB.js'
import { useToast } from '../composables/useToast.js'
import { appStore } from '../stores/appStore.js'

const props = defineProps({ loja: Object, cliente: Object })
const emit  = defineEmits(['back', 'salvo'])

const { put } = useDB()
const { toast } = useToast()

const produtos    = computed(() => appStore.produtos)
const qtds        = reactive({})
const dataVenda   = ref(new Date().toLocaleDateString('sv'))
const horaVenda   = ref(horaAtual())
const dataVenc    = ref('')
const chipAtivo   = ref(null)
const datePickerRef = ref(null)
const timePickerRef = ref(null)

const chips = [
  { id: '5dia', label: '5º Dia Útil' },
  { id: '15',   label: 'Dia 15' },
  { id: 'fim',  label: 'Fim do Mês' },
]

watch(() => props.cliente, () => {
  produtos.value.forEach(p => { qtds[p.id] = 0 })
  dataVenda.value = new Date().toLocaleDateString('sv')
  horaVenda.value = horaAtual()
  dataVenc.value  = ''
  chipAtivo.value = null
}, { immediate: true })

const total = computed(() =>
  produtos.value.reduce((s, p) => s + (qtds[p.id] || 0) * p.preco, 0)
)

const dataVendaFormatada = computed(() => {
  if (!dataVenda.value) return '--/--'
  return dataVenda.value.split('-').reverse().join('/')
})

function showDatePicker() {
  datePickerRef.value?.showPicker?.()
}

function showTimePicker() {
  timePickerRef.value?.showPicker?.()
}

function inc(p) { qtds[p.id] = (qtds[p.id] || 0) + 1 }
function dec(p) { if (qtds[p.id] > 0) qtds[p.id]-- }

function fmt(v) {
  return Number(v||0).toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })
}
function fmtPreco(v) {
  return Number(v||0).toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })
}
function horaAtual() {
  return new Date().toTimeString().slice(0, 5)
}
function initials(nome) {
  if (!nome) return '?'
  const p = nome.trim().split(' ').filter(Boolean)
  return p.length >= 2 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : nome.slice(0,2).toUpperCase()
}

function setChip(id) {
  chipAtivo.value = id
  const base = dataVenda.value ? new Date(dataVenda.value + 'T12:00:00') : new Date()
  let d = new Date(base)

  if (id === '5dia') {
    d.setMonth(d.getMonth() + 1)
    d.setDate(1)
    let uteis = 0
    while (uteis < 5) {
      const dia = d.getDay()
      if (dia !== 0 && dia !== 6) uteis++
      if (uteis < 5) d.setDate(d.getDate() + 1)
    }
  } else if (id === '15') {
    d.setDate(15)
    if (d <= base) d.setMonth(d.getMonth() + 1)
  } else if (id === 'fim') {
    d.setMonth(d.getMonth() + 1)
    d.setDate(0)
  }

  dataVenc.value = d.toLocaleDateString('sv')
}

async function salvar() {
  if (total.value === 0 || !props.cliente || !props.loja) return

  const itens = produtos.value
    .filter(p => qtds[p.id] > 0)
    .map(p => ({ id: p.id, nome: p.nome, emoji: p.emoji, qty: qtds[p.id], preco: p.preco, subtotal: qtds[p.id] * p.preco }))

  const fiado = {
    clienteId:   props.cliente.id,
    clienteNome: props.cliente.nome,
    lojaId:      props.loja.id,
    lojaNome:    props.loja.nome,
    itens,
    total:       total.value,
    saldo:       total.value,
    status:      'aberto',
    dataVenda:   dataVenda.value,
    horaVenda:   horaVenda.value || null,
    dataVenc:    dataVenc.value || null,
    criadoEm:    new Date().toISOString(),
  }

  await put('fiados', fiado)
  toast('✅ Fiado salvo!', 'sucesso')
  emit('salvo')
}
</script>

<style scoped>
.tela-lancar {
  display: flex; flex-direction: column;
  height: 100%; background: var(--bg);
  position: relative;
}
.header-date-tags {
  display: flex; align-items: center; justify-content: center; gap: 5px; margin-top: 4px;
}
.tag-label-venda {
  font-size: 10px; font-weight: 700; color: var(--muted);
  text-transform: uppercase; background: var(--cream-deep); padding: 2px 6px; border-radius: 4px;
}
.tag-date-venda {
  background: var(--gold-bg); color: var(--gold);
  border: 1px solid rgba(200,137,10,0.3);
  min-height: 40px; padding: 8px 12px; border-radius: 8px;
  font-size: 12px; font-weight: 800; cursor: pointer;
  display: inline-flex; align-items: center;
}
.lancar-body {
  flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 14px 14px 130px;
  display: flex; flex-direction: column; gap: 18px;
}
.cliente-card {
  display: flex; align-items: center; gap: 14px;
  background: var(--cream); border: 1px solid var(--border);
  border-radius: var(--r); padding: 14px;
}
.avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--brown); color: #fff;
  font-size: 17px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cliente-info  { flex: 1; min-width: 0; }
.cliente-nome  { font-size: 16px; font-weight: 800; }
.cliente-loja  { font-size: 11px; color: var(--muted); margin-top: 3px; display: flex; align-items: center; gap: 4px; }
.date-label    { font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 8px; }
.date-field    { display: flex; flex-direction: column; gap: 4px; }
.date-input {
  width: 100%; padding: 12px 14px; min-height: 44px;
  border: 1.5px solid var(--border); border-radius: var(--r-sm);
  font-family: var(--font-ui); font-size: 16px; color: var(--text);
  background: var(--surface); outline: none; box-shadow: var(--shadow);
}
.date-input:focus { border-color: var(--brown-light); }
.chip-row {
  display: flex; justify-content: center; gap: 6px;
  margin-top: 0; margin-bottom: 12px; flex-wrap: wrap;
}
.produtos-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.produto-card {
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: var(--r); padding: 16px 12px 12px;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  box-shadow: var(--shadow); transition: border-color var(--t), background var(--t);
}
.produto-card.ativo { border-color: var(--brown-light); background: var(--cream); }
.prod-emoji { font-size: 34px; line-height: 1; }
.prod-nome  { font-size: 13px; font-weight: 700; text-align: center; }
.prod-preco { font-size: 11px; color: var(--muted); font-family: var(--font-mono); }
.stepper {
  display: flex; align-items: center; margin-top: 6px;
  background: var(--bg); border: 1.5px solid var(--border);
  border-radius: var(--r-full); overflow: hidden;
}
.stepper-btn {
  width: 44px; height: 44px; border: none; background: transparent;
  color: var(--brown); font-size: 24px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-ui); flex-shrink: 0; transition: background var(--t);
}
.stepper-btn:active { background: var(--border); }
.stepper-btn:disabled { color: var(--muted); }
.stepper-qty {
  min-width: 34px; text-align: center; font-size: 17px; font-weight: 800;
  color: var(--text); font-family: var(--font-mono);
}
.footer-fixo {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: var(--bg); border-top: 1px solid var(--border);
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  display: flex; align-items: center; gap: 12px;
  z-index: 50; box-shadow: 0 -4px 20px rgba(61,32,8,.08);
}
.footer-total       { flex: 1; }
.footer-total-label { font-size: 11px; color: var(--muted); font-weight: 600; }
.footer-total-val   { font-size: 24px; font-weight: 800; color: var(--brown); font-family: var(--font-mono); line-height: 1.1; }
.btn-salvar {
  padding: 14px 24px; border-radius: var(--r); border: none;
  background: var(--green); color: #fff; font-family: var(--font-ui);
  font-size: 15px; font-weight: 800; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 14px rgba(26,122,69,.35);
  transition: opacity var(--t); flex-shrink: 0;
}
.btn-salvar:active   { opacity: .85; }
.btn-salvar:disabled { opacity: .4; cursor: default; box-shadow: none; }
</style>

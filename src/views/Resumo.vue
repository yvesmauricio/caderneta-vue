<template>
  <div class="tela-resumo">
    <div class="topbar">
      <div></div>
      <div class="topbar-title">📊 Resumo do Mês</div>
      <div></div>
    </div>

    <div class="resumo-header">
      <div class="kpi-strip">
        <div class="kpi-card">
          <div class="kpi-label">Total em aberto</div>
          <div class="kpi-val">R$ {{ fmt(totalAberto) }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Vencidos</div>
          <div class="kpi-val vermelho">R$ {{ fmt(totalVencido) }}</div>
        </div>
      </div>
    </div>

    <div class="resumo-lista">
      <div v-if="!grupos.length" class="empty">
        <div class="empty-ico">📭</div>
        <p>Nenhum fiado em aberto.</p>
      </div>

      <div v-for="g in grupos" :key="g.lojaId" class="grupo-loja">
        <div
          class="loja-header"
          :class="{ colapsado: g.colapsado }"
          @click="g.colapsado = !g.colapsado"
        >
          <svg class="loja-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          <span class="loja-nome">{{ g.lojaNome }}</span>
          <span class="loja-total">R$ {{ fmt(g.total) }}</span>
          <svg class="loja-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>

        <div class="grupo-clientes" :class="{ colapsado: g.colapsado }">
          <div
            v-for="c in g.clientes" :key="c.clienteId"
            class="cli-card" :class="{ atrasado: c.atrasado }"
          >
            <div class="cli-header">
              <div class="cli-info">
                <div class="cli-nome">{{ c.clienteNome }}</div>
                <div v-if="c.telefone" class="cli-tel">{{ c.telefone }}</div>
              </div>
              <div class="cli-right">
                <div class="cli-total" :class="{ atrasado: c.atrasado }">R$ {{ fmt(c.saldo) }}</div>
                <button v-if="c.telefone" class="btn-zap" @click="cobrarWhatsapp(c)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                  Cobrar
                </button>
              </div>
            </div>

            <div class="compras-lista">
              <div
                v-for="f in c.fiados" :key="f.id"
                class="compra-row" :class="{ atrasada: f.atrasada }"
              >
                <div class="compra-info">
                  <div class="compra-data">{{ fmtBR(f.dataVenda) }}</div>
                  <div class="compra-itens">{{ resumoItens(f.itens) }}</div>
                  <div class="compra-vence" :class="{ atrasada: f.atrasada }">
                    {{ f.dataVenc ? 'Vence: ' + fmtBR(f.dataVenc) : 'Sem vencimento' }}
                    {{ f.atrasada ? ' ⚠️ ATRASADO' : '' }}
                  </div>
                </div>
                <div class="compra-right">
                  <div class="compra-valor">R$ {{ fmt(f.saldo) }}</div>
                  <div class="compra-acoes">
                    <button class="btn-receber" @click="abrirReceber(f)" title="Receber pagamento">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>
                    <button class="btn-excluir-compra" @click="confirmarExcluir(f)" title="Excluir fiado">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog receber -->
    <Teleport to="body">
      <div v-if="fiadoReceber" class="overlay" @click.self="fiadoReceber=null">
        <div class="dialog-sheet">
          <div class="dialog-title">Receber pagamento</div>
          <div class="dialog-sub">
            {{ fiadoReceber.clienteNome }} · R$ {{ fmt(fiadoReceber.saldo) }}
          </div>
          <div class="form-group" style="margin-bottom: 16px">
            <label class="form-label">Valor recebido</label>
            <input
              class="form-input"
              type="number"
              step="0.01"
              min="0.01"
              :max="fiadoReceber.saldo"
              v-model.number="valorReceber"
              placeholder="0,00"
            >
          </div>
          <div class="dialog-btns">
            <button class="btn-cancel" @click="fiadoReceber=null">Cancelar</button>
            <button class="btn-confirm" @click="receberPagamento">✓ Confirmar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Dialog excluir -->
    <Teleport to="body">
      <div v-if="fiadoExcluir" class="overlay" @click.self="fiadoExcluir=null">
        <div class="dialog-sheet">
          <div class="dialog-title">Excluir este fiado?</div>
          <div class="dialog-sub">Esta ação não pode ser desfeita.</div>
          <div class="dialog-btns">
            <button class="btn-cancel" @click="fiadoExcluir=null">Cancelar</button>
            <button class="btn-confirm danger" @click="excluirFiado">Excluir</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useDB } from '../composables/useDB.js'
import { useToast } from '../composables/useToast.js'
import { appStore } from '../stores/appStore.js'

const { getAll, update, del } = useDB()
const { toast } = useToast()

const grupos       = ref([])
const fiadoReceber = ref(null)
const fiadoExcluir = ref(null)
const valorReceber = ref(0)

const fmt = v => Number(v||0).toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })
const hoje = () => new Date().toLocaleDateString('sv')
const fmtBR = raw => {
  if (!raw) return '--/--'
  const b = String(raw).split('T')[0]
  return /^\d{4}-\d{2}-\d{2}$/.test(b) ? b.split('-').reverse().join('/') : '--/--'
}

const totalAberto = computed(() =>
  grupos.value.reduce((s, g) => s + g.total, 0)
)
const totalVencido = computed(() => {
  const hj = hoje()
  return grupos.value.reduce((s, g) =>
    s + g.clientes.reduce((s2, c) =>
      s2 + c.fiados.filter(f => f.dataVenc && f.dataVenc < hj).reduce((s3, f) => s3 + f.saldo, 0)
    , 0)
  , 0)
})

function resumoItens(itens) {
  if (!itens?.length) return ''
  return itens.map(i => {
    // Busca o emoji no cadastro de produtos caso não exista no item da venda
    const p = appStore.produtos.find(prod => prod.id === i.produtoId)
    const emoji = i.emoji || p?.emoji || '📦'
    // Usa 'qtd' (do seu JSON) com fallback para 'qty'
    return `${emoji} ${i.qtd || i.qty || 0}x ${i.nome}`
  }).join(', ')
}

function cobrarWhatsapp(c) {
  const tel = c.telefone.replace(/\D/g, '')
  const msg = encodeURIComponent(`Olá ${c.clienteNome}! Você tem um fiado de R$ ${fmt(c.saldo)} em aberto. Quando podemos acertar? 😊`)
  window.open(`https://wa.me/55${tel}?text=${msg}`, '_blank')
}

function abrirReceber(fiado) {
  fiadoReceber.value = fiado
  valorReceber.value = fiado.saldo
}

async function receberPagamento() {
  const f = fiadoReceber.value
  if (!f || !valorReceber.value || valorReceber.value <= 0) return
  const pago  = Math.min(valorReceber.value, f.saldo)
  const novoSaldo = Math.max(0, f.saldo - pago)
  await update('fiados', f.id, { saldo: novoSaldo, status: novoSaldo <= 0.01 ? 'pago' : 'aberto' })
  fiadoReceber.value = null
  toast('✅ Pagamento registrado!', 'sucesso')
  await carregar()
}

function confirmarExcluir(fiado) {
  fiadoExcluir.value = fiado
}

async function excluirFiado() {
  await del('fiados', fiadoExcluir.value.id)
  fiadoExcluir.value = null
  toast('🗑️ Fiado removido', 'sucesso')
  await carregar()
}

async function carregar() {
  const hj     = hoje()
  const fiados = await getAll('fiados')
  const abertos = fiados.filter(f => f.saldo > 0.01)

  // busca telefones dos clientes
  const clientes = await getAll('clientes')
  const telMap   = Object.fromEntries(clientes.map(c => [c.id, c.telefone]))

  // agrupa por loja
  const porLoja = new Map()
  abertos.forEach(f => {
    if (!porLoja.has(f.lojaId)) {
      porLoja.set(f.lojaId, { lojaId: f.lojaId, lojaNome: f.lojaNome, clientes: new Map(), colapsado: false })
    }
    const g = porLoja.get(f.lojaId)
    if (!g.clientes.has(f.clienteId)) {
      g.clientes.set(f.clienteId, {
        clienteId: f.clienteId, clienteNome: f.clienteNome,
        telefone: telMap[f.clienteId] || '',
        fiados: [], saldo: 0, atrasado: false
      })
    }
    const c = g.clientes.get(f.clienteId)
    const atrasada = f.dataVenc && f.dataVenc < hj
    c.fiados.push({ ...f, atrasada })
    c.saldo += f.saldo
    if (atrasada) c.atrasado = true
  })

  grupos.value = [...porLoja.values()].map(g => ({
    ...g,
    clientes: [...g.clientes.values()],
    total: [...g.clientes.values()].reduce((s, c) => s + c.saldo, 0),
  }))
}

onMounted(carregar)
defineExpose({ carregar })
</script>

<style scoped>
.tela-resumo { display: flex; flex-direction: column; height: 100%; background: var(--bg); }
.resumo-header { padding: 14px 14px 10px; flex-shrink: 0; }
.kpi-strip    { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.kpi-card     { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); padding: 12px 14px; box-shadow: var(--shadow); }
.kpi-label    { font-size: 11px; color: var(--muted); font-weight: 600; }
.kpi-val      { font-size: 20px; font-weight: 800; color: var(--brown); font-family: var(--font-mono); margin-top: 2px; }
.kpi-val.vermelho { color: var(--red); }
.resumo-lista {
  flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain; padding: 0 14px 100px;
  display: flex; flex-direction: column; gap: 20px;
}
.grupo-loja   { display: flex; flex-direction: column; gap: 8px; }
.loja-header  {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 14px; background: var(--surface);
  border-radius: 10px; border-left: 3px solid var(--brown);
  box-shadow: var(--shadow); position: sticky; top: 0; z-index: 2;
  cursor: pointer; user-select: none;
}
.loja-header:active { opacity: .8; }
.loja-ico     { color: var(--brown); flex-shrink: 0; }
.loja-nome    { font-size: 13px; font-weight: 800; flex: 1; }
.loja-total   { font-size: 13px; font-weight: 800; color: var(--brown); font-family: var(--font-mono); }
.loja-chevron { color: var(--brown-light); flex-shrink: 0; transition: transform .22s cubic-bezier(.4,0,.2,1); margin-left: 6px; }
.loja-header.colapsado .loja-chevron { transform: rotate(-90deg); }
.grupo-clientes {
  display: flex; flex-direction: column; gap: 8px; overflow: hidden;
  transition: max-height .28s cubic-bezier(.4,0,.2,1), opacity .22s ease;
  max-height: 9999px; opacity: 1;
}
.grupo-clientes.colapsado { max-height: 0 !important; opacity: 0; }
.cli-card   { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); overflow: hidden; box-shadow: var(--shadow); }
.cli-card.atrasado { border-color: #fecaca; background: #fff9f9; }
.cli-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px 10px; gap: 10px; }
.cli-info   { flex: 1; min-width: 0; }
.cli-nome   { font-size: 15px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cli-tel    { font-size: 11px; color: var(--muted); margin-top: 2px; }
.cli-right  { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
.cli-total  { font-size: 16px; font-weight: 800; font-family: var(--font-mono); }
.cli-total.atrasado { color: var(--red); }
.btn-zap {
  padding: 6px 12px; border-radius: var(--r-full); border: none;
  background: #25D366; color: #fff; font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: var(--font-ui);
  display: flex; align-items: center; gap: 5px;
}
.btn-zap:active { opacity: .8; }
.compras-lista  { border-top: 1px solid var(--border); }
.compra-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 14px; gap: 8px;
  border-bottom: 1px dashed var(--border);
}
.compra-row:last-child { border-bottom: none; }
.compra-row.atrasada   { background: #fff5f5; }
.compra-info    { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.compra-data    { font-size: 12px; font-weight: 700; }
.compra-itens   { font-size: 12px; color: var(--muted); }
.compra-vence   { font-size: 11px; color: var(--muted); }
.compra-vence.atrasada { color: var(--red); font-weight: 700; }
.compra-right   { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
.compra-valor   { font-size: 15px; font-weight: 800; font-family: var(--font-mono); white-space: nowrap; }
.compra-acoes   { display: flex; gap: 6px; }
.btn-receber {
  width: 40px; height: 40px; border-radius: 50%; border: none;
  background: var(--green); color: #fff; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
}
.btn-receber:active { opacity: .8; }
.btn-excluir-compra {
  width: 40px; height: 40px; border-radius: 50%;
  border: 1.5px solid var(--border2); background: var(--surface);
  color: var(--red); display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: background var(--t), border-color var(--t);
}
.btn-excluir-compra:active { background: var(--red-bg); border-color: var(--red); }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-label { font-size: 12px; font-weight: 700; color: var(--muted); }
.form-input {
  width: 100%; padding: 12px 14px; border: 1.5px solid var(--border);
  border-radius: var(--r-sm); font-family: var(--font-ui); font-size: 14px;
  color: var(--text); background: var(--surface); outline: none; user-select: text;
}
.form-input:focus { border-color: var(--brown-light); }
</style>

<template>
  <div class="tela-resumo">
    <div class="topbar">
      <div></div>
      <div class="topbar-title">📊 Resumo</div>
      <div></div>
    </div>

    <!-- KPIs -->
    <div class="kpi-strip">
      <div class="kpi-card">
        <div class="kpi-label">Total em aberto</div>
        <div class="kpi-val">R$ {{ fmt(totalAberto) }}</div>
      </div>
      <div class="kpi-card kpi-card--red">
        <div class="kpi-label">Vencidos</div>
        <div class="kpi-val kpi-val--red">R$ {{ fmt(totalVencido) }}</div>
      </div>
    </div>

    <div class="resumo-filtros">
      <div class="search-wrap">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" class="search-input" placeholder="Filtrar cliente..." v-model="busca">
      </div>
      <div class="modo-row">
        <button class="chip" :class="{ ativo: modo === 'abertos' }" @click="modo = 'abertos'">Em aberto</button>
        <button class="chip" :class="{ ativo: modo === 'historico' }" @click="modo = 'historico'">Histórico</button>
      </div>
    </div>

    <!-- Lista -->
    <div class="resumo-lista">
      <div v-if="!grupos.length" class="empty">
        <div class="empty-ico">📭</div>
        <p>{{ textoVazio }}</p>
      </div>

      <div v-for="g in grupos" :key="g.lojaId" class="grupo-loja">
        <!-- Cabeçalho da loja -->
        <div
          class="loja-header"
          :class="{ colapsado: lojaColapsada(g) }"
          @click="alternarLoja(g)"
        >
          <svg class="loja-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          <span class="loja-nome">{{ g.lojaNome }}</span>
          <span class="loja-total">R$ {{ fmt(modo === 'historico' ? g.totalCompras : g.total) }}</span>
          <svg class="loja-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>

        <!-- Clientes da loja -->
        <div class="grupo-clientes" :class="{ colapsado: lojaColapsada(g) }">
          <div
            v-for="c in g.clientes" :key="c.clienteId"
            class="cli-card" :class="{ atrasado: c.atrasado }"
          >
            <!-- Cabeçalho do cliente -->
            <div
              class="cli-header"
              :class="{ colapsado: clienteColapsado(g, c) }"
              @click="alternarCliente(g, c)"
            >
              <div class="cli-avatar" :class="{ atrasado: c.atrasado }">
                {{ iniciais(c.clienteNome) }}
              </div>
              <div class="cli-info">
                <div class="cli-nome">{{ c.clienteNome }}</div>
                <div v-if="c.telefone" class="cli-tel">{{ c.telefone }}</div>
              </div>
              <div class="cli-actions">
                <div class="cli-total" :class="{ 'cli-total--red': c.atrasado, 'cli-total--ok': modo === 'historico' && c.saldo <= 0.01 }">
                  R$ {{ fmt(modo === 'historico' ? c.totalCompras : c.saldo) }}
                </div>
              </div>
              <svg class="cli-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>

            <div v-if="modo !== 'historico' || c.telefone" class="cli-btns" @click.stop>
              <button v-if="modo !== 'historico'" class="btn-venda" @click="iniciarVenda(g, c)" title="Iniciar venda">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Venda
              </button>
              <button v-if="modo !== 'historico' && c.saldo > 0.01" class="btn-pagar-tudo" @click="abrirPagarTudo(c)" title="Quitar tudo">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Quitar
              </button>
              <button v-if="c.telefone" class="btn-zap" @click="abrirWhatsapp(c)" title="Abrir WhatsApp">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </button>
            </div>

            <!-- Compras — estilo linha de caderno -->
            <div class="compras-lista" :class="{ colapsado: clienteColapsado(g, c) }">
              <div
                v-for="f in c.fiados" :key="f.id"
                class="compra-row" :class="{ atrasada: f.atrasada }"
              >
                <div class="compra-esq">
                  <span class="compra-data">{{ fmtDataHora(f) }}</span>
                  <span class="compra-itens">{{ resumoItens(f.itens) }}</span>
                  <span v-if="f.pagamentos?.length" class="compra-pagamentos">
                    Recebido R$ {{ fmt(totalPago(f)) }} · {{ textoUltimoRecebimento(f) }} · falta R$ {{ fmt(f.saldo) }}
                  </span>
                </div>
                <div class="compra-dir">
                  <span class="compra-valor" :class="{ 'compra-valor--red': f.atrasada }">
                    R$ {{ fmt(modo === 'historico' ? f.total : f.saldo) }}
                  </span>
                  <div class="compra-meta">
                    <span v-if="modo === 'historico'" class="compra-status" :class="{ pago: f.saldo <= 0.01 }">
                      {{ f.saldo <= 0.01 ? 'Pago' : 'Aberto' }}
                    </span>
                    <span v-if="f.saldo <= 0.01" class="compra-vence compra-vence--ok">
                      {{ textoPagamento(f) }}
                    </span>
                    <span v-else-if="f.dataVenc" class="compra-vence" :class="{ 'compra-vence--red': f.atrasada }">
                      {{ f.atrasada ? '⚠️ ' : '' }}{{ fmtBR(f.dataVenc) }}
                    </span>
                    <div v-if="modo !== 'historico'" class="compra-acoes">
                      <button v-if="f.saldo > 0.01" class="btn-receber" @click.stop="abrirReceber(f)" title="Receber parcial">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/>
                        </svg>
                      </button>
                      <button class="btn-excluir-compra" @click.stop="confirmarExcluir(f)" title="Excluir">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
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
    </div>

    <!-- Dialog: Receber parcial -->
    <Teleport to="body">
      <div v-if="fiadoReceber" class="overlay" @click.self="fiadoReceber=null">
        <div class="dialog-sheet">
          <div class="dialog-title">Receber pagamento</div>
          <div class="dialog-sub">{{ fiadoReceber.clienteNome }} · R$ {{ fmt(fiadoReceber.saldo) }}</div>
          <div class="form-group">
            <label class="form-label">Valor recebido</label>
            <input
              class="form-input"
              type="number" step="0.01" min="0.01" :max="fiadoReceber.saldo"
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

    <!-- Dialog: Quitar tudo -->
    <Teleport to="body">
      <div v-if="clienteQuitar" class="overlay" @click.self="clienteQuitar=null">
        <div class="dialog-sheet">
          <div class="dialog-title">Quitar todas as dívidas?</div>
          <div class="dialog-sub">
            <strong>{{ clienteQuitar.clienteNome }}</strong><br>
            {{ clienteQuitar.fiados.length }} compra{{ clienteQuitar.fiados.length > 1 ? 's' : '' }} ·
            <span style="color:var(--brown); font-weight:800">R$ {{ fmt(clienteQuitar.saldo) }}</span>
          </div>
          <div class="dialog-btns">
            <button class="btn-cancel" @click="clienteQuitar=null">Cancelar</button>
            <button class="btn-confirm" @click="quitarTudo">💰 Quitar tudo</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Dialog: Excluir -->
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
import { ref, computed, onMounted } from 'vue'
import { useDB } from '../composables/useDB.js'
import { useToast } from '../composables/useToast.js'
import { appStore } from '../stores/appStore.js'

const { getAll, update, del } = useDB()
const { toast } = useToast()
const emit = defineEmits(['abrir-cliente'])

const fiadosTodos   = ref([])
const clientesTodos = ref([])
const busca         = ref('')
const modo          = ref('abertos')
const fiadoReceber  = ref(null)
const fiadoExcluir  = ref(null)
const clienteQuitar = ref(null)
const valorReceber  = ref(0)
const lojasExpandidas = ref(new Set())
const clientesExpandidos = ref(new Set())

const fmt = v => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const hoje = () => new Date().toLocaleDateString('sv')
const fmtBR = raw => {
  if (!raw) return '--/--'
  const b = String(raw).split('T')[0]
  return /^\d{4}-\d{2}-\d{2}$/.test(b) ? b.split('-').reverse().join('/') : '--/--'
}
const fmtHora = raw => /^\d{2}:\d{2}/.test(String(raw || '')) ? String(raw).slice(0, 5) : ''
const iniciais = nome => (nome || '?').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase()

const fiadosAbertos = computed(() => fiadosTodos.value.filter(f => f.saldo > 0.01))
const totalAberto = computed(() => fiadosAbertos.value.reduce((s, f) => s + f.saldo, 0))
const totalVencido = computed(() => {
  const hj = hoje()
  return fiadosAbertos.value
    .filter(f => f.dataVenc && f.dataVenc < hj)
    .reduce((s, f) => s + f.saldo, 0)
})
const textoVazio = computed(() => {
  if (busca.value.trim()) return 'Nenhum cliente encontrado.'
  return modo.value === 'historico' ? 'Nenhum histórico registrado.' : 'Nenhum fiado em aberto.'
})
const grupos = computed(() => montarGrupos())

const telMap = computed(() => Object.fromEntries(clientesTodos.value.map(c => [c.id, c.telefone])))

function normalizar(v) {
  return String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function ultimoPagamento(f) {
  const ps = f.pagamentos || []
  return ps.length ? ps[ps.length - 1] : null
}

function textoPagamento(f) {
  const ultimo = ultimoPagamento(f)
  if (ultimo?.data) return `Pago ${fmtBR(ultimo.data)}${fmtHora(ultimo.hora) ? ` ${fmtHora(ultimo.hora)}` : ''}`
  if (f.pagoEm) return `Pago ${fmtBR(f.pagoEm)}`
  return 'Pago'
}

function fmtDataHora(f) {
  const hora = fmtHora(f.horaVenda)
  return hora ? `${fmtBR(f.dataVenda)} ${hora}` : fmtBR(f.dataVenda)
}

function totalPago(f) {
  return (f.pagamentos || []).reduce((s, p) => s + Number(p.valor || 0), 0)
}

function textoUltimoRecebimento(f) {
  const ultimo = ultimoPagamento(f)
  if (!ultimo) return ''
  const hora = fmtHora(ultimo.hora)
  return `último ${fmtBR(ultimo.data)}${hora ? ` ${hora}` : ''}`
}

function montarGrupos() {
  const hj = hoje()
  const termo = normalizar(busca.value.trim())
  const fonte = modo.value === 'historico' ? fiadosTodos.value : fiadosAbertos.value
  const filtrados = fonte.filter(f => {
    if (!termo) return true
    return normalizar([
      f.clienteNome,
      f.lojaNome,
      resumoItens(f.itens)
    ].join(' ')).includes(termo)
  })

  const porLoja = new Map()
  filtrados.forEach(f => {
    if (!porLoja.has(f.lojaId)) {
      porLoja.set(f.lojaId, {
        lojaId: f.lojaId,
        lojaNome: f.lojaNome,
        clientes: new Map(),
      })
    }
    const g = porLoja.get(f.lojaId)
    if (!g.clientes.has(f.clienteId)) {
      g.clientes.set(f.clienteId, {
        clienteId: f.clienteId,
        clienteNome: f.clienteNome,
        telefone: telMap.value[f.clienteId] || '',
        fiados: [],
        saldo: 0,
        atrasado: false
      })
    }
    const c = g.clientes.get(f.clienteId)
    const atrasada = f.saldo > 0.01 && f.dataVenc && f.dataVenc < hj
    c.fiados.push({ ...f, atrasada })
    c.saldo += f.saldo || 0
    if (atrasada) c.atrasado = true
  })

  return [...porLoja.values()].map(g => {
    const clientes = [...g.clientes.values()].map(c => ({
      ...c,
      fiados: c.fiados.sort((a, b) => {
        const da = `${a.dataVenda || ''} ${a.horaVenda || '00:00'}`
        const db = `${b.dataVenda || ''} ${b.horaVenda || '00:00'}`
        return String(db).localeCompare(String(da))
      }),
      totalCompras: c.fiados.reduce((s, f) => s + Number(f.total || 0), 0)
    })).sort((a, b) => a.clienteNome.localeCompare(b.clienteNome))
    return {
      ...g,
      clientes,
      total: clientes.reduce((s, c) => s + c.saldo, 0),
      totalCompras: clientes.reduce((s, c) => s + c.totalCompras, 0),
    }
  }).sort((a, b) => a.lojaNome.localeCompare(b.lojaNome))
}

function horaAtual() {
  return new Date().toTimeString().slice(0, 5)
}

function dadosPagamento(valor, saldoAntes, saldoDepois) {
  return {
    valor,
    data: hoje(),
    hora: horaAtual(),
    saldoAntes,
    saldoDepois,
    criadoEm: new Date().toISOString()
  }
}

function mudancasPagamento(f, pago, novoSaldo) {
  const saldoAntes = Number(f.saldo || 0)
  const pagamentos = [...(f.pagamentos || []), dadosPagamento(pago, saldoAntes, novoSaldo)]
  const quitado = novoSaldo <= 0.01
  return {
    saldo: novoSaldo,
    status: quitado ? 'pago' : 'aberto',
    pagamentos,
    pagoEm: quitado ? new Date().toISOString() : (f.pagoEm || null)
  }
}

function resumoItens(itens) {
  if (!itens?.length) return ''
  return itens.map(i => {
    const p = appStore.produtos.find(prod => prod.id === i.produtoId)
    const emoji = i.emoji || p?.emoji || '📦'
    return `${emoji} ${i.qtd || i.qty || 0}x ${i.nome}`
  }).join(' · ')
}

function abrirWhatsapp(c) {
  const tel = c.telefone.replace(/\D/g, '')
  const msg = modo.value === 'historico'
    ? encodeURIComponent(`Olá ${c.clienteNome}!`)
    : encodeURIComponent(`Olá ${c.clienteNome}! Você tem um fiado de R$ ${fmt(c.saldo)} em aberto. Quando podemos acertar? 😊`)
  window.open(`https://wa.me/55${tel}?text=${msg}`, '_blank')
}

function abrirReceber(fiado) {
  if (modo.value === 'historico') return
  fiadoReceber.value = fiado
  valorReceber.value = fiado.saldo
}

async function receberPagamento() {
  if (modo.value === 'historico') return
  const f = fiadoReceber.value
  if (!f || !valorReceber.value || valorReceber.value <= 0) return
  const pago = Math.min(valorReceber.value, f.saldo)
  const novoSaldo = Math.max(0, f.saldo - pago)
  await update('fiados', f.id, mudancasPagamento(f, pago, novoSaldo))
  fiadoReceber.value = null
  toast('✅ Pagamento registrado!', 'sucesso')
  await carregar()
}

function abrirPagarTudo(cliente) {
  if (modo.value === 'historico') return
  clienteQuitar.value = cliente
}

function clienteKey(grupo, cliente) {
  return `${grupo.lojaId}:${cliente.clienteId}`
}

function lojaColapsada(grupo) {
  return !busca.value.trim() && !lojasExpandidas.value.has(grupo.lojaId)
}

function clienteColapsado(grupo, cliente) {
  return !busca.value.trim() && !clientesExpandidos.value.has(clienteKey(grupo, cliente))
}

function alternarLoja(grupo) {
  const proximas = new Set(lojasExpandidas.value)
  if (proximas.has(grupo.lojaId)) {
    proximas.delete(grupo.lojaId)
  } else {
    proximas.add(grupo.lojaId)
  }
  lojasExpandidas.value = proximas
}

function alternarCliente(grupo, cliente) {
  const key = clienteKey(grupo, cliente)
  const proximos = new Set(clientesExpandidos.value)
  if (proximos.has(key)) {
    proximos.delete(key)
  } else {
    proximos.add(key)
  }
  clientesExpandidos.value = proximos
}

function iniciarVenda(grupo, cliente) {
  emit('abrir-cliente', {
    loja: {
      id: grupo.lojaId,
      nome: grupo.lojaNome,
      referencia: ''
    },
    cliente: {
      id: cliente.clienteId,
      nome: cliente.clienteNome,
      telefone: cliente.telefone,
      lojaId: grupo.lojaId
    }
  })
}

async function quitarTudo() {
  if (modo.value === 'historico') return
  const c = clienteQuitar.value
  if (!c) return
  await Promise.all(c.fiados.map(f => update('fiados', f.id, mudancasPagamento(f, f.saldo, 0))))
  clienteQuitar.value = null
  toast(`✅ ${c.clienteNome} quitado!`, 'sucesso')
  await carregar()
}

function confirmarExcluir(fiado) {
  if (modo.value === 'historico') return
  fiadoExcluir.value = fiado
}

async function excluirFiado() {
  if (modo.value === 'historico') return
  await del('fiados', fiadoExcluir.value.id)
  fiadoExcluir.value = null
  toast('🗑️ Fiado removido', 'sucesso')
  await carregar()
}

async function carregar() {
  fiadosTodos.value = await getAll('fiados')
  clientesTodos.value = await getAll('clientes')
}

onMounted(carregar)
defineExpose({ carregar })
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────── */
.tela-resumo { display: flex; flex-direction: column; height: 100%; background: var(--bg); }

/* ── KPIs ───────────────────────────────────────── */
.kpi-strip {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  padding: 12px 14px 10px; flex-shrink: 0;
}
.kpi-card {
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: var(--r); padding: 11px 14px;
  box-shadow: var(--shadow); min-height: 64px;
}
.kpi-card--red { border-color: #fecaca; background: #fff9f9; }
.kpi-label { font-size: 10px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.kpi-val { font-size: 18px; font-weight: 800; color: var(--brown); font-family: var(--font-mono); margin-top: 4px; }
.kpi-val--red { color: var(--red); }

/* ── Filtros ────────────────────────────────────── */
.resumo-filtros {
  padding: 0 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}
.modo-row {
  display: flex;
  justify-content: center;
  gap: 6px;
}

/* ── Lista ──────────────────────────────────────── */
.resumo-lista {
  flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain; padding: 4px 14px 100px;
  display: flex; flex-direction: column; gap: 18px;
}

/* ── Grupo loja ─────────────────────────────────── */
.grupo-loja { display: flex; flex-direction: column; gap: 6px; }
.loja-header {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  background: var(--surface); border-radius: 10px;
  border-left: 3px solid var(--brown); box-shadow: var(--shadow);
  /*position: sticky; top: 0;*/ 
  z-index: 2; cursor: pointer; user-select: none;
  min-height: 48px;
}
.loja-header:active { opacity: .8; }
.loja-ico   { color: var(--brown); flex-shrink: 0; }
.loja-nome  { font-size: 13px; font-weight: 800; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.loja-total { font-size: 13px; font-weight: 800; color: var(--brown); font-family: var(--font-mono); white-space: nowrap; }
.loja-chevron { color: var(--brown-light); flex-shrink: 0; transition: transform .22s cubic-bezier(.4,0,.2,1); margin-left: 4px; }
.loja-header.colapsado .loja-chevron { transform: rotate(-90deg); }

.grupo-clientes {
  margin-left: 10px;
  border-left: 10px;
  padding-left: 8px;
  display: flex; 
  flex-direction: column; 
  gap: 6px; 
  overflow: hidden;
  transition: max-height .28s cubic-bezier(.4,0,.2,1), opacity .22s ease;
  max-height: 9999px; 
  opacity: 1;
}
.grupo-clientes.colapsado { max-height: 0 !important; opacity: 0; }

/* ── Card cliente ────────────────────────────────── */
.cli-card {
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: var(--r); overflow: hidden; box-shadow: var(--shadow);
}
.cli-card.atrasado { border-color: #fecaca; background: #fff9f9; }

.cli-header {
  display: flex; align-items: center; gap: 10px;
  padding: 12px; min-height: 68px;
  cursor: pointer; user-select: none;
}
.cli-header:active { background: var(--cream); }

.cli-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: var(--cream-deep); color: var(--brown-mid);
  font-size: 12px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 1.5px solid var(--border2);
}
.cli-avatar.atrasado { background: #fef2f2; color: var(--red); border-color: #fecaca; }

.cli-info { flex: 1; min-width: 0; }
.cli-nome { font-size: 14px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cli-tel  { font-size: 11px; color: var(--muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.cli-actions { display: flex; align-items: center; justify-content: flex-end; flex-shrink: 0; }
.cli-total   { font-size: 15px; font-weight: 800; font-family: var(--font-mono); white-space: nowrap; }
.cli-total--red { color: var(--red); }
.cli-total--ok { color: var(--green); }
.cli-btns {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: nowrap;
  padding: 0 12px 12px 64px;
}
.cli-chevron { color: var(--brown-light); flex-shrink: 0; transition: transform .22s cubic-bezier(.4,0,.2,1); }
.cli-header.colapsado .cli-chevron { transform: rotate(-90deg); }

.btn-venda,
.btn-pagar-tudo {
  min-height: 40px; padding: 0 12px; border-radius: var(--r-full); border: none;
  color: #fff; font-size: 12px; font-weight: 800;
  cursor: pointer; font-family: var(--font-ui);
  display: flex; align-items: center; gap: 4px; white-space: nowrap;
}
.btn-venda { background: var(--green); }
.btn-pagar-tudo { background: var(--brown); }
.btn-venda:active,
.btn-pagar-tudo:active { opacity: .8; }

.btn-zap {
  width: 44px; height: 44px; border-radius: 50%; border: none;
  background: #25D366; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
}
.btn-zap:active { opacity: .8; }

@media (max-width: 380px) {
  .cli-btns {
    padding-left: 12px;
  }

  .btn-venda,
  .btn-pagar-tudo {
    flex: 1 1 0;
    justify-content: center;
    padding: 0 10px;
  }
}

/* ── Compras (linhas de caderno) ────────────────── */
.compras-lista {
  border-top: 1.5px dashed var(--border2);
  overflow: hidden;
  transition: max-height .28s cubic-bezier(.4,0,.2,1), opacity .22s ease;
  max-height: 9999px;
  opacity: 1;
}
.compras-lista.colapsado { max-height: 0 !important; opacity: 0; border-top-color: transparent; }

.compra-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 10px 12px; gap: 10px;
  border-bottom: 1px dashed var(--border);
  min-height: 60px;
}
.compra-row:last-child { border-bottom: none; }
.compra-row.atrasada   { background: #fff5f5; }

.compra-esq {
  flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; padding-top: 1px;
}
.compra-data  { font-size: 11px; font-weight: 700; color: var(--brown-mid); white-space: nowrap; }
.compra-itens { font-size: 12px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.compra-pagamentos { font-size: 11px; color: var(--green); font-weight: 700; line-height: 1.35; }

/* Coluna direita com largura fixa — resolve o espremimento */
.compra-dir {
  display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
  flex-shrink: 0; min-width: 96px;
}
.compra-valor { font-size: 14px; font-weight: 800; font-family: var(--font-mono); white-space: nowrap; }
.compra-valor--red { color: var(--red); }

.compra-meta   { display: flex; align-items: center; gap: 5px; }
.compra-status {
  font-size: 10px;
  color: var(--orange);
  font-weight: 800;
  text-transform: uppercase;
  white-space: nowrap;
}
.compra-status.pago { color: var(--green); }
.compra-vence  { font-size: 10px; color: var(--muted); white-space: nowrap; }
.compra-vence--red { color: var(--red); font-weight: 700; }
.compra-vence--ok { color: var(--green); font-weight: 700; }

.compra-acoes { display: flex; gap: 8px; }

.btn-receber {
  width: 44px; height: 44px; border-radius: 50%; border: none;
  background: var(--green); color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
}
.btn-receber:active { opacity: .8; }

.btn-excluir-compra {
  width: 44px; height: 44px; border-radius: 50%;
  border: 1.5px solid var(--border2); background: var(--surface);
  color: var(--red); display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
}
.btn-excluir-compra:active { background: var(--red-bg); border-color: var(--red); }

/* ── Formulário ─────────────────────────────────── */
.form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
.form-label { font-size: 12px; font-weight: 700; color: var(--muted); }
.form-input {
  width: 100%; padding: 12px 14px; border: 1.5px solid var(--border);
  border-radius: var(--r-sm); font-family: var(--font-ui); font-size: 16px;
  color: var(--text); background: var(--surface); outline: none; user-select: text;
}
.form-input:focus { border-color: var(--brown-light); }

/* ── Empty ──────────────────────────────────────── */
.empty { text-align: center; padding: 60px 20px; color: var(--muted); }
.empty-ico { font-size: 40px; margin-bottom: 10px; }
</style>

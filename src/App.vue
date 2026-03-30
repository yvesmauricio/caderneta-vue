<template>
  <div id="app-shell">

    <!-- Toast global -->
    <div class="toast" :class="[{ show: toastShow }, toastTipo]">{{ toastMsg }}</div>

    <!-- Telas (stack de navegação) -->
    <div class="screen-stack">
      <Transition :name="transitionName">
        <!-- Boas vindas -->
        <BoasVindas
          v-if="tela === 'boasvindas'"
          key="boasvindas"
          @nova-loja="abrirModalNovaLoja"
          @restaurar="restaurarBackup"
        />

        <!-- Dashboard -->
        <Dashboard
          v-else-if="tela === 'dashboard'"
          key="dashboard"
          ref="dashRef"
          @go="navGo"
        />

        <!-- Lojas -->
        <Lojas
          v-else-if="tela === 'lojas'"
          key="lojas"
          ref="lojasRef"
          @escolher="onEscolherLoja"
        />

        <!-- Clientes -->
        <Clientes
          v-else-if="tela === 'clientes'"
          key="clientes"
          :loja="loja"
          @back="irPara('lojas', 'back')"
          @escolher="onEscolherCliente"
        />

        <!-- Lançar fiado -->
        <Lancar
          v-else-if="tela === 'lancar'"
          key="lancar"
          :loja="loja"
          :cliente="cliente"
          @back="irPara('clientes', 'back')"
          @salvo="onFiadoSalvo"
        />

        <!-- Resumo -->
        <Resumo
          v-else-if="tela === 'resumo'"
          key="resumo"
          ref="resumoRef"
        />

        <!-- Calculadora -->
        <Calculadora
          v-else-if="tela === 'calc'"
          key="calc"
        />

        <!-- Configurações -->
        <Configuracoes
          v-else-if="tela === 'config'"
          key="config"
        />
      </Transition>
    </div>

    <!-- Bottom Nav (oculto em certas telas) -->
    <nav class="bottom-nav" v-if="mostrarNav">
      <button class="nav-btn" :class="{ ativo: navAtivo === 'dashboard' }" @click="navSwitch('dashboard')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        Início
      </button>
      <button class="nav-btn" :class="{ ativo: navAtivo === 'fiado' }" @click="navSwitch('fiado')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Fiado
      </button>
      <button class="nav-btn" :class="{ ativo: navAtivo === 'resumo' }" @click="navSwitch('resumo')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        Resumo
      </button>
      <button class="nav-btn" :class="{ ativo: navAtivo === 'calc' }" @click="navSwitch('calc')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <line x1="8" y1="6" x2="16" y2="6"/>
          <line x1="8" y1="10" x2="10" y2="10"/>
          <line x1="14" y1="10" x2="16" y2="10"/>
          <line x1="8" y1="14" x2="10" y2="14"/>
          <line x1="14" y1="14" x2="16" y2="14"/>
          <line x1="8" y1="18" x2="10" y2="18"/>
          <line x1="14" y1="18" x2="16" y2="18"/>
        </svg>
        Máquina
      </button>
      <button class="nav-btn" :class="{ ativo: navAtivo === 'config' }" @click="navSwitch('config')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        Config
      </button>
    </nav>

    <!-- Modal nova loja (para tela boas-vindas) -->
    <Teleport to="body">
      <div v-if="modalNovaLoja" class="modal-overlay" @click.self="modalNovaLoja=false">
        <div class="modal-sheet">
          <div class="modal-header">
            <div class="modal-titulo">Nova Loja</div>
            <button class="btn-fechar" @click="modalNovaLoja=false">✕</button>
          </div>
          <div class="form-group">
            <label class="form-label">Nome da loja *</label>
            <input class="form-input" v-model="novaLojaNome" placeholder="Ex: Escritório Santos" autofocus>
          </div>
          <div class="form-group">
            <label class="form-label">Referência (opcional)</label>
            <input class="form-input" v-model="novaLojaRef" placeholder="Ex: Sala 301">
          </div>
          <button class="btn-primary" @click="criarPrimeiraLoja" :disabled="!novaLojaNome.trim()">
            Cadastrar Loja
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Input oculto para restaurar backup (boas-vindas) -->
    <input type="file" ref="importBVRef" style="display:none" accept=".json" @change="importarBackupBV">

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useDB } from './composables/useDB.js'
import { useToast } from './composables/useToast.js'
import { appActions } from './stores/appStore.js'

import BoasVindas    from './views/BoasVindas.vue'
import Dashboard     from './views/Dashboard.vue'
import Lojas         from './views/Lojas.vue'
import Clientes      from './views/Clientes.vue'
import Lancar        from './views/Lancar.vue'
import Resumo        from './views/Resumo.vue'
import Calculadora   from './views/Calculadora.vue'
import Configuracoes from './views/Configuracoes.vue'

const { abrirDB, getAll, put, del } = useDB()
const { msg: toastMsg, tipo: toastTipo, show: toastShow } = useToast()

// ── State ──────────────────────────────────────────────────
const tela           = ref('boasvindas')
const navAtivo       = ref('dashboard')
const transitionName = ref('slide')
const loja           = ref(null)
const cliente        = ref(null)

// Refs de componentes para refresh
const dashRef   = ref(null)
const lojasRef  = ref(null)
const resumoRef = ref(null)

// Modal primeira loja
const modalNovaLoja = ref(false)
const novaLojaNome  = ref('')
const novaLojaRef2   = ref('')
const novaLojaRef   = ref('')
const importBVRef   = ref(null)

// Ordem das telas para definir direção da animação
const ORDEM = { boasvindas: -1, dashboard: 0, lojas: 1, clientes: 2, lancar: 3, resumo: 1, calc: 1, config: 1 }

const mostrarNav = computed(() => !['boasvindas', 'lancar'].includes(tela.value))

function irPara(destino, dir = 'forward') {
  const cur  = ORDEM[tela.value] ?? 0
  const dest = ORDEM[destino]    ?? 0
  transitionName.value = dir === 'back' || dest < cur ? 'slide-back' : 'slide'
  tela.value = destino
}

function navGo(destino) {
  navSwitch(destino === 'lojas' ? 'fiado' : destino)
}

async function navSwitch(aba) {
  navAtivo.value = aba
  if (aba === 'dashboard') {
    irPara('dashboard', 'back')
    await nextTick()
    dashRef.value?.refresh()
  } else if (aba === 'fiado') {
    lojasRef.value?.carregar()
    irPara('lojas')
  } else if (aba === 'resumo') {
    irPara('resumo')
    await nextTick()
    resumoRef.value?.carregar()
  } else if (aba === 'calc') {
    irPara('calc')
  } else if (aba === 'config') {
    irPara('config')
  }
}

function onEscolherLoja(l) {
  loja.value = l
  irPara('clientes')
}

function onEscolherCliente(c) {
  cliente.value = c
  irPara('lancar')
}

async function onFiadoSalvo() {
  irPara('clientes', 'back')
}

// ── Primeira loja (boas-vindas) ─────────────────────────────
function abrirModalNovaLoja() {
  novaLojaNome.value = ''
  novaLojaRef.value  = ''
  modalNovaLoja.value = true
}

async function criarPrimeiraLoja() {
  if (!novaLojaNome.value.trim()) return
  await put('lojas', { nome: novaLojaNome.value.trim(), referencia: novaLojaRef.value.trim() })
  modalNovaLoja.value = false
  await nextTick()
  irPara('dashboard')
  navAtivo.value = 'dashboard'
  await nextTick()
  dashRef.value?.refresh()
}

function restaurarBackup() {
  importBVRef.value?.click()
}

async function importarBackupBV(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async ev => {
    try {
      const dados = JSON.parse(ev.target.result)
      if (!dados.lojas && !dados.clientes && !dados.fiados) throw new Error()
      for (const store of ['lojas', 'clientes', 'fiados']) {
        const itens = await getAll(store)
        for (const i of itens) await del(store, i.id)
      }
      if (dados.lojas)    for (const l of dados.lojas)    { delete l.id; await put('lojas', l) }
      if (dados.clientes) for (const c of dados.clientes) { delete c.id; await put('clientes', c) }
      if (dados.fiados)   for (const f of dados.fiados)   { delete f.id; await put('fiados', f) }
      setTimeout(() => location.reload(), 800)
    } catch {
      alert('Arquivo de backup inválido.')
    }
  }
  reader.readAsText(file)
}

// ── Init ────────────────────────────────────────────────────
onMounted(async () => {
  await abrirDB()

  if (navigator.storage?.persist) {
    await navigator.storage.persist()
  }

  const lojas = await getAll('lojas')
  if (lojas.length > 0) {
    tela.value     = 'dashboard'
    navAtivo.value = 'dashboard'
    await nextTick()
    dashRef.value?.refresh()
  }
  // else permanece em 'boasvindas'
})
</script>

<style>
#app-shell {
  height: 100%; display: flex; flex-direction: column;
  position: relative; overflow: hidden;
}
.screen-stack {
  flex: 1; position: relative; overflow: hidden;
  display: flex; flex-direction: column;
}

/* Slide forward */
.slide-enter-active,
.slide-leave-active {
  transition: transform .22s cubic-bezier(.4,0,.2,1), opacity .22s ease;
  position: absolute; inset: 0; will-change: transform;
}
.slide-enter-from { transform: translateX(100%); opacity: 0; }
.slide-enter-to   { transform: translateX(0);    opacity: 1; }
.slide-leave-from { transform: translateX(0);    opacity: 1; }
.slide-leave-to   { transform: translateX(-30%); opacity: 0; }

/* Slide back */
.slide-back-enter-active,
.slide-back-leave-active {
  transition: transform .22s cubic-bezier(.4,0,.2,1), opacity .22s ease;
  position: absolute; inset: 0;
}
.slide-back-enter-from { transform: translateX(-30%); opacity: 0; }
.slide-back-enter-to   { transform: translateX(0);    opacity: 1; }
.slide-back-leave-from { transform: translateX(0);    opacity: 1; }
.slide-back-leave-to   { transform: translateX(100%); opacity: 0; }
</style>

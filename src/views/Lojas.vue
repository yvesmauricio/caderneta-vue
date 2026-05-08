<template>
  <div class="tela-lojas">
    <div class="topbar">
      <div></div>
      <div class="topbar-title">Onde estou vendendo?</div>
      <button class="btn-add" @click="abrirModal()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>

    <div class="search-bar">
      <div class="search-wrap">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" class="search-input" placeholder="Buscar loja..." v-model="busca">
      </div>
    </div>

    <div class="scroll-list" @scroll="handleScroll">
      <div v-if="!filtradas.length" class="empty">
        <div class="empty-ico">🏪</div>
        <p>{{ busca ? 'Nenhuma loja encontrada' : 'Nenhuma loja cadastrada ainda.\nToque em + para adicionar.' }}</p>
      </div>
      <SwipeItem
        ref="itemsRef"
        :id="l.id"
        v-for="l in filtradas" :key="l.id"
        @click="escolher(l)"
        @edit="abrirModal(l)"
        @opened="fecharOutros(l.id)"
        @delete="confirmarExclusao(l)"
      >
        <div class="list-icon">🏪</div>
        <div class="list-info">
          <div class="list-nome">{{ l.nome }}</div>
          <div v-if="l.referencia" class="list-sub">{{ l.referencia }}</div>
        </div>
      </SwipeItem>
    </div>

    <!-- Modal nova/editar loja -->
    <Teleport to="body">
      <div v-if="modal" class="modal-overlay" @click.self="modal=null">
        <div class="modal-sheet">
          <div class="modal-header">
            <div class="modal-titulo">{{ editando ? 'Editar Loja' : 'Nova Loja' }}</div>
            <button class="btn-fechar" @click="modal=null">✕</button>
          </div>
          <div class="form-group">
            <label class="form-label">Nome da loja *</label>
            <input class="form-input" v-model="form.nome" placeholder="Ex: Escritório Santos" autofocus>
          </div>
          <div class="form-group">
            <label class="form-label">Referência (opcional)</label>
            <input class="form-input" v-model="form.referencia" placeholder="Ex: Sala 301, 3º andar">
          </div>
          <button class="btn-primary" @click="salvar" :disabled="!form.nome.trim()">
            {{ editando ? 'Salvar Alterações' : 'Cadastrar Loja' }}
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Dialog excluir -->
    <Teleport to="body">
      <div v-if="paraExcluir" class="overlay" @click.self="paraExcluir=null">
        <div class="dialog-sheet">
          <div class="dialog-title">Excluir loja?</div>
          <div class="dialog-sub">Todos os clientes e fiados desta loja serão removidos.</div>
          <div class="dialog-btns">
            <button class="btn-cancel" @click="paraExcluir=null">Cancelar</button>
            <button class="btn-confirm danger" @click="excluir">Excluir</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SwipeItem from '../components/SwipeItem.vue'
import { useDB } from '../composables/useDB.js'
import { useToast } from '../composables/useToast.js'

const emit = defineEmits(['escolher'])
const { getAll, put, del } = useDB()
const { toast } = useToast()

const lojas      = ref([])
const busca      = ref('')
const modal      = ref(null)
const form       = ref({ nome: '', referencia: '' })
const editando   = ref(null)
const paraExcluir = ref(null)
const itemsRef    = ref([])

function handleScroll() {
  // Fecha menus abertos ao rolar a lista de lojas
  itemsRef.value.forEach(item => item?.close?.())
}

function fecharOutros(id) {
  itemsRef.value.forEach(item => { if (item && item.id !== id) item.close?.() })
}

const filtradas = computed(() =>
  lojas.value
    .filter(l => !busca.value || l.nome.toLowerCase().includes(busca.value.toLowerCase()))
    .sort((a,b) => a.nome.localeCompare(b.nome))
)

async function carregar() {
  lojas.value = await getAll('lojas')
}

function abrirModal(loja = null) {
  editando.value = loja ? loja.id : null
  form.value = { nome: loja?.nome || '', referencia: loja?.referencia || '' }
  modal.value = true
}

async function salvar() {
  if (!form.value.nome.trim()) return
  const obj = { nome: form.value.nome.trim(), referencia: form.value.referencia.trim() }
  if (editando.value) obj.id = editando.value
  await put('lojas', obj)
  modal.value = null
  toast(editando.value ? '✅ Loja atualizada!' : '✅ Loja cadastrada!', 'sucesso')
  await carregar()
}

function confirmarExclusao(loja) {
  paraExcluir.value = loja
}

async function excluir() {
  const loja = paraExcluir.value
  paraExcluir.value = null
  // Remove clientes e fiados
  const clientes = await getAll('clientes', 'lojaId', IDBKeyRange.only(loja.id))
  for (const c of clientes) {
    const fiados = await getAll('fiados', 'clienteId', IDBKeyRange.only(c.id))
    for (const f of fiados) await del('fiados', f.id)
    await del('clientes', c.id)
  }
  await del('lojas', loja.id)
  toast('🗑️ Loja removida', 'sucesso')
  await carregar()
}

function escolher(loja) {
  emit('escolher', loja)
}

onMounted(carregar)
defineExpose({ carregar })
</script>

<style scoped>
.tela-lojas { display: flex; flex-direction: column; height: 100%; background: var(--bg); }
</style>

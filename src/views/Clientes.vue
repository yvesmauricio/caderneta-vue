<template>
  <div class="tela-clientes">
    <div class="topbar">
      <button class="btn-back" @click="$emit('back')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="topbar-title">
        {{ loja?.nome || 'Clientes' }}
        <span class="topbar-sub">{{ loja?.referencia || '' }}</span>
      </div>
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
        <input type="text" class="search-input" placeholder="Buscar cliente..." v-model="busca">
      </div>
    </div>

    <div class="scroll-list">
      <div v-if="!filtrados.length" class="empty">
        <div class="empty-ico">👤</div>
        <p>{{ busca ? 'Nenhum cliente encontrado' : 'Nenhuma cliente nesta loja.\nToque em + para adicionar.' }}</p>
      </div>
      <SwipeItem
        v-for="c in filtrados" :key="c.id"
        @click="escolher(c)"
        @edit="abrirModal(c)"
        @delete="confirmarExclusao(c)"
      >
        <div class="list-icon pessoa">👩</div>
        <div class="list-info">
          <div class="list-nome">{{ c.nome }}</div>
          <div class="list-sub">{{ c.telefone || 'Sem telefone' }}</div>
        </div>
      </SwipeItem>
    </div>

    <!-- Modal novo/editar cliente -->
    <Teleport to="body">
      <div v-if="modal" class="modal-overlay" @click.self="modal=null">
        <div class="modal-sheet">
          <div class="modal-header">
            <div class="modal-titulo">{{ editando ? 'Editar Cliente' : 'Nova Cliente' }}</div>
            <button class="btn-fechar" @click="modal=null">✕</button>
          </div>
          <div class="form-group">
            <label class="form-label">Nome *</label>
            <input class="form-input" v-model="form.nome" placeholder="Nome completo" autofocus>
          </div>
          <div class="form-group">
            <label class="form-label">Telefone / WhatsApp</label>
            <input class="form-input" v-model="form.telefone" placeholder="(11) 99999-9999" type="tel">
          </div>
          <button class="btn-primary" @click="salvar" :disabled="!form.nome.trim()">
            {{ editando ? 'Salvar Alterações' : 'Cadastrar Cliente' }}
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Dialog excluir -->
    <Teleport to="body">
      <div v-if="paraExcluir" class="overlay" @click.self="paraExcluir=null">
        <div class="dialog-sheet">
          <div class="dialog-title">Excluir cliente?</div>
          <div class="dialog-sub">Todos os fiados desta cliente serão removidos.</div>
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
import { ref, computed, watch } from 'vue'
import SwipeItem from '../components/SwipeItem.vue'
import { useDB } from '../composables/useDB.js'
import { useToast } from '../composables/useToast.js'

const props = defineProps({ loja: Object })
const emit  = defineEmits(['back', 'escolher'])
const { getAll, put, del } = useDB()
const { toast } = useToast()

const clientes   = ref([])
const busca      = ref('')
const modal      = ref(null)
const form       = ref({ nome: '', telefone: '' })
const editando   = ref(null)
const paraExcluir = ref(null)

const filtrados = computed(() =>
  clientes.value
    .filter(c => !busca.value || c.nome.toLowerCase().includes(busca.value.toLowerCase()))
    .sort((a,b) => a.nome.localeCompare(b.nome))
)

async function carregar() {
  if (!props.loja) return
  clientes.value = await getAll('clientes', 'lojaId', IDBKeyRange.only(props.loja.id))
  busca.value = ''
}

watch(() => props.loja, carregar, { immediate: true })

function abrirModal(cli = null) {
  editando.value = cli ? cli.id : null
  form.value = { nome: cli?.nome || '', telefone: cli?.telefone || '' }
  modal.value = true
}

async function salvar() {
  if (!form.value.nome.trim() || !props.loja) return
  const obj = { nome: form.value.nome.trim(), telefone: form.value.telefone.trim(), lojaId: props.loja.id }
  if (editando.value) obj.id = editando.value
  await put('clientes', obj)
  modal.value = null
  toast(editando.value ? '✅ Cliente atualizada!' : '✅ Cliente cadastrada!', 'sucesso')
  await carregar()
}

function confirmarExclusao(cli) {
  paraExcluir.value = cli
}

async function excluir() {
  const cli = paraExcluir.value
  paraExcluir.value = null
  const fiados = await getAll('fiados', 'clienteId', IDBKeyRange.only(cli.id))
  for (const f of fiados) await del('fiados', f.id)
  await del('clientes', cli.id)
  toast('🗑️ Cliente removida', 'sucesso')
  await carregar()
}

function escolher(cli) { emit('escolher', cli) }
</script>

<style scoped>
.tela-clientes { display: flex; flex-direction: column; height: 100%; background: var(--bg); }
</style>

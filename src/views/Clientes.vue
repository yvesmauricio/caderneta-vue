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

    <div class="scroll-list" ref="scrollContainer" @scroll="handleScroll">
      <div v-if="!filtrados.length" class="empty">
        <div class="empty-ico">👤</div>
        <p>{{ busca ? 'Nenhum cliente encontrado' : 'Nenhuma cliente nesta loja.\nToque em + para adicionar.' }}</p>
      </div>
      
      <!-- Spacer para simular a altura total da lista e manter o scrollbar correto -->
      <div :style="{ height: totalHeight + 'px', position: 'relative' }">
        <SwipeItem
          ref="itemsRef"
          :id="c.id"
          v-for="c in visiveis" :key="c.id"
          :style="{ position: 'absolute', top: c._top + 'px', left: 0, right: 0 }"
          @click="escolher(c)"
          @edit="abrirModal(c)"
          @opened="fecharOutros(c.id)"
          @delete="confirmarExclusao(c)"
        >
          <div class="list-icon pessoa">👩</div>
          <div class="list-info">
            <div class="list-nome">{{ c.nome }}</div>
            <div class="list-sub">{{ c.telefone || 'Sem telefone' }}</div>
          </div>
        </SwipeItem>
      </div>
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
            <input 
              class="form-input" 
              v-model="form.telefone" 
              @input="onTelefoneInput"
              placeholder="(11) 9 9999-9999" 
              type="tel"
            >
          </div>

          <button v-if="suportaContatos" class="btn-secundario-contato" @click="importarContato">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Importar dos Contatos
          </button>

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
const scrollTop  = ref(0)
const ITEM_HEIGHT = 72 // Altura fixa de cada item
const BUFFER     = 5   // Itens extras para evitar buracos brancos no scroll
const scrollContainer = ref(null)
const itemsRef = ref([])

function handleScroll(e) {
  scrollTop.value = e.target.scrollTop

  // Fecha os menus laterais de todos os itens renderizados ao detectar rolagem
  // Isso garante que nenhum menu fique "aberto" durante o scroll virtualizado
  itemsRef.value.forEach(item => item?.close?.())
}

function fecharOutros(id) {
  itemsRef.value.forEach(item => { if (item && item.id !== id) item.close?.() })
}

function aplicarMascara(v) {
  if (!v) return ''
  v = v.replace(/\D/g, '') // Remove tudo que não é dígito
  if (v.length > 11) v = v.slice(0, 11) // Limita a 11 dígitos

  if (v.length === 11) {
    // Formato: (11) 9 9999-9999
    return v.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4')
  }
  if (v.length > 6) {
    // Formato: (11) 9999-9999
    return v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  }
  if (v.length > 2) {
    // Formato: (11) 9
    return v.replace(/(\d{2})(\d{0,5})/, '($1) $2')
  }
  if (v.length > 0) {
    // Formato: (11
    return v.replace(/(\d{0,2})/, '($1')
  }
  return v
}

function onTelefoneInput(e) {
  form.value.telefone = aplicarMascara(e.target.value)
}

const totalHeight = computed(() => filtrados.value.length * ITEM_HEIGHT)

const filtrados = computed(() =>
  clientes.value
    .filter(c => !busca.value || c.nome.toLowerCase().includes(busca.value.toLowerCase()))
    .sort((a,b) => a.nome.localeCompare(b.nome))
)

const visiveis = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - BUFFER)
  const end   = Math.min(filtrados.value.length, start + Math.ceil(800 / ITEM_HEIGHT) + (BUFFER * 2))
  
  return filtrados.value.slice(start, end).map((c, i) => ({
    ...c,
    _top: (start + i) * ITEM_HEIGHT
  }))
})

// Verificação de suporte para a Contact Picker API
// 1. Requer HTTPS (ou localhost)
// 2. Disponível principalmente no Chrome para Android
// 3. Não aparece em iPhones (iOS) ou Navegadores de PC
const suportaContatos = ('contacts' in navigator && !!navigator.contacts.select)

async function importarContato() {
  try {
    const props = ['name', 'tel']
    const opts = { multiple: false }
    const contacts = await navigator.contacts.select(props, opts)
    
    if (contacts.length > 0) {
      const contact = contacts[0]
      if (contact.name?.length) form.value.nome = contact.name[0]
      if (contact.tel?.length) {
        // Remove +55, espaços, parênteses e traços para limpar o número
        let num = contact.tel[0].replace(/\D/g, '')
        if (num.startsWith('55')) num = num.substring(2)
        form.value.telefone = aplicarMascara(num)
      }
      toast('👤 Contato importado!', 'sucesso')
    }
  } catch (err) {
    // Usuário cancelou ou navegador bloqueou
    console.warn('Busca de contatos cancelada')
  }
}

async function carregar() {
  if (!props.loja) return
  clientes.value = await getAll('clientes', 'lojaId', IDBKeyRange.only(props.loja.id))
  busca.value = ''
}

watch(() => props.loja, carregar, { immediate: true })

function abrirModal(cli = null) {
  editando.value = cli ? cli.id : null
  form.value = { nome: cli?.nome || '', telefone: aplicarMascara(cli?.telefone || '') }
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

.btn-secundario-contato {
  width: 100%; min-height: 44px; padding: 10px; margin-bottom: 16px;
  border-radius: var(--r); border: 1.5px dashed var(--border2);
  background: var(--surface); color: var(--brown);
  font-family: var(--font-ui); font-size: 13px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background var(--t);
}
.btn-secundario-contato:active { background: var(--cream); border-color: var(--brown-light); }
</style>

<template>
  <div class="tela-config">
    <div class="topbar">
      <div></div>
      <div class="topbar-title">⚙️ Configurações</div>
      <div></div>
    </div>

    <div class="config-body">

      <!-- BACKUP -->
      <div class="config-section" :class="{ aberto: acc.backup }">
        <div class="config-section-title" @click="toggle('backup')">
          <span>💾 Cópia de Segurança</span>
          <span class="config-acc-chevron">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </div>
        <div class="config-acc-body">
          <div class="config-row download" @click="exportarBackup">
            <div class="config-row-icon">📥</div>
              <div class="config-row-info">
                <div class="config-row-label">Baixar Backup</div>
                <div class="config-row-sub">Salva um arquivo .json na pasta Downloads</div>
              </div>
            <div class="config-row-arrow">›</div>
          </div>
          <div class="config-row share" @click="compartilharBackup">
            <div class="config-row-icon">☁️</div>
            <div class="config-row-info">
              <div class="config-row-label">Enviar para Google Drive</div>
              <div class="config-row-sub">Abre painel para Drive, WhatsApp, e-mail...</div>
            </div>
            <div class="config-row-arrow">›</div>
          </div>
          <div class="config-row restore" @click="importFileRef?.click()">
            <div class="config-row-icon">📤</div>
            <div class="config-row-info">
              <div class="config-row-label">Restaurar Backup</div>
              <div class="config-row-sub">Importar dados de um arquivo .json salvo</div>
            </div>
            <div class="config-row-arrow">›</div>
          </div>
          <input type="file" ref="importFileRef" style="display:none" accept=".json" @change="importarBackup">
        </div>
      </div>

      <!-- PRODUTOS -->
      <div class="config-section" :class="{ aberto: acc.produtos }">
        <div class="config-section-title" @click="toggle('produtos')">
          <span>🛒 Produtos</span>
          <span class="config-acc-chevron">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </div>
        <div class="config-acc-body">
          <!-- Input invisível para capturar ou escolher foto -->
          <input type="file" ref="fotoInputRef" style="display:none" accept="image/*" @change="processarFoto">

          <div class="prod-edit-row" v-for="(p, i) in produtosEdit" :key="p.id">
            <div class="prod-edit-icon-box">
              <img v-if="p.emoji?.startsWith('data:')" :src="p.emoji" class="prod-icon-img" @click="removerFoto(i)" title="Clique para remover foto">
              <input v-else type="text" class="prod-edit-emoji-input" v-model="produtosEdit[i].emoji" title="Digite emoji ou clique na câmera">
              <button class="btn-foto-trigger" @click="abrirSeletorFoto(i)" title="Usar foto real">📷</button>
            </div>
            <div class="prod-edit-fields">
              <input type="text" class="prod-edit-nome" v-model="produtosEdit[i].nome" placeholder="Nome do produto">
              <div class="prod-edit-preco-wrap">
                <span class="prod-edit-preco-label">R$</span>
                <input type="number" class="prod-edit-preco" v-model.number="produtosEdit[i].preco" min="0" step="0.5" inputmode="decimal">
              </div>
            </div>
            <button class="btn-remove-prod" @click="removerProduto(i)" title="Remover produto">✕</button>
          </div>
          <button class="config-add-btn" @click="adicionarProduto">＋ Adicionar Novo Produto</button>
          <button class="config-save-btn" @click="salvarProdutos">✅ Salvar Produtos</button>
        </div>
      </div>

      <!-- TAXAS -->
      <div class="config-section" :class="{ aberto: acc.taxas }">
        <div class="config-section-title" @click="toggle('taxas')">
          <span>💳 Taxas da Maquininha</span>
          <span class="config-acc-chevron">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </div>
        <div class="config-acc-body">
          <div class="taxa-row">
            <div class="taxa-label">Débito na hora</div>
            <div class="taxa-input-wrap">
              <input type="number" class="taxa-input" v-model.number="taxasEdit.debito" min="0" step="0.01" inputmode="decimal">
              <span class="taxa-percent">%</span>
            </div>
          </div>
          <div class="taxa-row">
            <div class="taxa-label">Crédito à vista na hora</div>
            <div class="taxa-input-wrap">
              <input type="number" class="taxa-input" v-model.number="taxasEdit.credito_avista" min="0" step="0.01" inputmode="decimal">
              <span class="taxa-percent">%</span>
            </div>
          </div>
          <button class="config-save-btn" @click="salvarTaxas">✅ Salvar Taxas</button>
        </div>
      </div>

      <!-- SOBRE -->
      <div class="config-section" :class="{ aberto: acc.sobre }">
        <div class="config-section-title" @click="toggle('sobre')">
          <span>ℹ️ Sobre</span>
          <span class="config-acc-chevron">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </div>
        <div class="config-acc-body">
          <div class="config-sobre-wrap">
            <div class="config-sobre-emoji">🍫</div>
            <div class="config-sobre-title">Caderneta da Bete</div>
            <div class="config-sobre-ver">Versão 2.0 — Vue + Vite + PWA</div>
            <div class="config-sobre-info">Gestão de fiados offline-first.<br>Todos os dados ficam no seu dispositivo.</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useDB } from '../composables/useDB.js'
import { useToast } from '../composables/useToast.js'
import { appStore, appActions } from '../stores/appStore.js'

const { getAll, put, del } = useDB()
const { toast } = useToast()

const importFileRef = ref(null)
const fotoInputRef = ref(null)
const activeIdx = ref(-1)

const acc = reactive({ backup: true, produtos: false, taxas: false, sobre: false })

const produtosEdit = ref([])
const taxasEdit    = ref({ debito: 2.98, credito_avista: 6.17 })

function toggle(key) {
  Object.keys(acc).forEach(k => { if (k !== key) acc[k] = false })
  acc[key] = !acc[key]
}

onMounted(() => {
  produtosEdit.value = appStore.produtos.map(p => ({ ...p }))
  taxasEdit.value    = { ...appStore.taxas }
})

function adicionarProduto() {
  const id = 'prod_' + Date.now()
  produtosEdit.value.push({ id, nome: '', emoji: '📦', preco: 0 })
  acc.produtos = true
}

function removerProduto(index) {
  produtosEdit.value.splice(index, 1)
}

function abrirSeletorFoto(index) {
  activeIdx.value = index
  fotoInputRef.value.click()
}

async function processarFoto(e) {
  const file = e.target.files?.[0]
  if (!file || activeIdx.value === -1) return

  const targetIdx = activeIdx.value // Captura o índice atual para o callback
  e.target.value = '' // Limpa o input imediatamente

  // Redimensionamos para um quadrado de 96px com compressão JPEG.
  const imgUrl = URL.createObjectURL(file)
  const img = new Image()

  img.onload = () => {
    const canvas = document.createElement('canvas')
    const size = 96
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    // Cálculo para Crop Center (Manter a imagem centralizada no quadrado)
    const scale = Math.max(size / img.width, size / img.height)
    const x = (size / 2) - (img.width / 2) * scale
    const y = (size / 2) - (img.height / 2) * scale

    ctx.fillStyle = '#FFFFFF' // Fundo branco para JPEGs com transparência
    ctx.fillRect(0, 0, size, size)
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

    produtosEdit.value[targetIdx].emoji = canvas.toDataURL('image/jpeg', 0.7)
    
    URL.revokeObjectURL(imgUrl) // Libera memória
    activeIdx.value = -1
  }

  img.onerror = () => {
    toast('Erro ao carregar imagem', 'erro')
    URL.revokeObjectURL(imgUrl)
  }

  img.src = imgUrl
}

function removerFoto(index) {
  produtosEdit.value[index].emoji = '📦'
}

function salvarProdutos() {
  const ok = produtosEdit.value.every(p => p.nome?.trim() && p.emoji?.trim() && p.preco >= 0)
  if (!ok) { toast('Verifique os valores dos produtos.', 'aviso'); return }
  appActions.salvarProdutos(produtosEdit.value.map(p => ({ ...p, nome: p.nome.trim() })))
  toast('✅ Produtos salvos!', 'sucesso')
}

function salvarTaxas() {
  const { debito, credito_avista } = taxasEdit.value
  if (isNaN(debito) || isNaN(credito_avista) || debito < 0 || credito_avista < 0) {
    toast('Taxas inválidas.', 'aviso'); return
  }
  appActions.salvarTaxas({ debito, credito_avista })
  toast('✅ Taxas salvas!', 'sucesso')
}

async function exportarBackup() {
  const dados = {
    lojas:       await getAll('lojas'),
    clientes:    await getAll('clientes'),
    fiados:      await getAll('fiados'),
    config: {
      produtos: appStore.produtos,
      taxas:    appStore.taxas
    },
    exportadoEm: new Date().toISOString()
  }
  const agora   = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const blob    = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
  const url     = URL.createObjectURL(blob)
  const a       = document.createElement('a')
  a.href        = url
  a.download    = `backup-caderno-${agora}.json`
  a.click()
  URL.revokeObjectURL(url)
  toast('📥 Backup baixado!', 'sucesso')
}

async function compartilharBackup() {
  try {
    const dados = {
      lojas:       await getAll('lojas'),
      clientes:    await getAll('clientes'),
      fiados:      await getAll('fiados'),
      config: {
        produtos: appStore.produtos,
        taxas:    appStore.taxas
      },
      exportadoEm: new Date().toISOString()
    }
    const agora  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const blob   = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
    const file   = new File([blob], `backup-caderno-${agora}.json`, { type: 'application/json' })

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: 'Backup Caderneta', files: [file] })
      toast('Backup compartilhado!', 'sucesso')
    } else {
      exportarBackup()
    }
  } catch(err) {
    if (err.name !== 'AbortError') exportarBackup()
  }
}

async function importarBackup(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async ev => {
    try {
      const dados = JSON.parse(ev.target.result)
      if (!dados.lojas && !dados.clientes && !dados.fiados) throw new Error('invalid')

      // limpa tudo
      for (const store of ['lojas', 'clientes', 'fiados']) {
        const itens = await getAll(store)
        for (const i of itens) await del(store, i.id)
      }
      if (dados.lojas)    for (const l of dados.lojas)    { delete l.id; await put('lojas', l) }
      if (dados.clientes) for (const c of dados.clientes) { delete c.id; await put('clientes', c) }
      
      if (dados.fiados) {
        for (const f of dados.fiados) {
          delete f.id
          // Normaliza o status de PENDENTE (antigo) para aberto (novo)
          if (f.status === 'PENDENTE') f.status = 'aberto'
          await put('fiados', f)
        }
      }
      
      if (dados.config) {
        if (dados.config.produtos) appActions.salvarProdutos(dados.config.produtos)
        if (dados.config.taxas)    appActions.salvarTaxas(dados.config.taxas)
      }

      toast('✅ Restauração concluída!', 'sucesso')
      setTimeout(() => location.reload(), 1200)
    } catch {
      toast('Arquivo inválido', 'erro')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}
</script>

<style scoped>
.tela-config { display: flex; flex-direction: column; height: 100%; background: var(--bg); }
.config-body {
  flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain; padding: 14px 14px 100px;
  display: flex; flex-direction: column; gap: 10px;
}
.config-section {
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: var(--r); overflow: hidden; box-shadow: var(--shadow);
  flex-shrink: 0;
}
.config-section-title {
  display: flex; align-items: center; justify-content: space-between;
  padding: 15px; font-size: 14px; font-weight: 800; cursor: pointer;
  gap: 8px; user-select: none;
}
.config-section-title:active { opacity: .8; }
.config-acc-chevron {
  color: var(--brown-light); flex-shrink: 0;
  transition: transform .22s cubic-bezier(.4,0,.2,1);
  display: flex; align-items: center;
}
.config-section.aberto .config-acc-chevron { transform: rotate(180deg); }
.config-acc-body {
  max-height: 0;
  overflow: hidden;
  transition: opacity .22s ease; 
  opacity: 0;
}
.config-section.aberto .config-acc-body {
  max-height: 2000px; /* Valor alto para garantir que tudo apareça */
  opacity: 1;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}
.config-row {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 15px; border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background var(--t); min-height: 54px;
}
.config-row:last-of-type { border-bottom: none; }
.config-row:active { background: var(--cream); }
.config-row-icon   { font-size: 20px; width: 36px; text-align: center; flex-shrink: 0; }
.config-row-info   { flex: 1; min-width: 0; overflow: hidden;}
.config-row-label  { font-size: 14px; font-weight: 700; }
.config-row-sub {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
 }
.config-row-arrow  { color: var(--muted); font-size: 18px; flex-shrink: 0; }
.config-row.download .config-row-icon { color: var(--brown-mid); }
.config-row.share   .config-row-icon  { color: #34a853; }
.config-row.restore .config-row-icon  { color: var(--orange); }
.prod-edit-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0; /* Impede que o item diminua de tamanho */
}
.prod-edit-row:last-child { border-bottom: none; }

.prod-edit-icon-box { position: relative; flex-shrink: 0; }
.prod-icon-img {
  width: 44px; height: 44px; border-radius: var(--r-sm);
  object-fit: cover; border: 1.5px solid var(--border);
  cursor: pointer; background: var(--bg);
}
.btn-foto-trigger {
  position: absolute; bottom: -5px; right: -5px;
  width: 22px; height: 22px; border-radius: 50%;
  border: 1.5px solid var(--border); background: var(--surface);
  font-size: 10px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: var(--shadow); z-index: 2;
}
.btn-foto-trigger:active { transform: scale(0.9); }

.prod-edit-emoji-input {
  font-size: 24px; width: 44px; height: 44px; text-align: center; 
  flex-shrink: 0; background: var(--bg); border: 1.5px solid var(--border);
  border-radius: var(--r-sm); cursor: pointer; padding: 0;
  display: flex; align-items: center; justify-content: center;
}
.prod-edit-emoji-input:focus { outline: none; border-color: var(--brown-light); background: var(--surface); }
.prod-edit-fields { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.prod-edit-nome {
  width: 100%; border: 1.5px solid var(--border); border-radius: var(--r-sm);
  padding: 7px 10px; font-family: var(--font-ui); font-size: 13px; font-weight: 700;
  color: var(--text); background: var(--bg); user-select: text;
}
.prod-edit-nome:focus { outline: none; border-color: var(--brown-light); }
.prod-edit-preco-wrap {
  display: flex; align-items: center; gap: 5px;
  border: 1.5px solid var(--border); border-radius: var(--r-sm);
  background: var(--bg); padding: 0 10px;
}
.prod-edit-preco-label { font-size: 12px; color: var(--muted); font-weight: 600; }
.prod-edit-preco {
  flex: 1; border: none; background: transparent;
  font-family: var(--font-mono); font-size: 14px; font-weight: 700;
  color: var(--brown); padding: 7px 0; outline: none; user-select: text;
}
.taxa-row {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 15px; border-bottom: 1px solid var(--border);
}
.taxa-row:last-child { border-bottom: none; }
.taxa-label { flex: 1; font-size: 14px; font-weight: 700; }
.taxa-input-wrap {
  display: flex; align-items: center; gap: 4px;
  background: var(--bg); border: 1.5px solid var(--border);
  border-radius: var(--r-sm); padding: 0 10px;
}
.taxa-input {
  width: 54px; border: none; background: transparent;
  font-family: var(--font-mono); font-size: 15px; font-weight: 700;
  color: var(--brown); padding: 8px 0; text-align: right; outline: none; user-select: text;
}
.taxa-percent { font-size: 13px; color: var(--muted); font-weight: 600; }

.btn-remove-prod {
  background: transparent; border: none; color: var(--red);
  font-size: 18px; cursor: pointer; padding: 10px;
  display: flex; align-items: center; justify-content: center;
  opacity: 0.5; transition: opacity .2s;
}
.btn-remove-prod:active { opacity: 1; }

.config-add-btn {
  margin: 10px 15px 0; padding: 10px; border-radius: var(--r-sm);
  border: 1.5px dashed var(--border2); background: transparent;
  color: var(--muted); font-family: var(--font-ui); font-size: 13px;
  font-weight: 700; cursor: pointer; width: calc(100% - 30px);
  transition: all var(--t);
}
.config-add-btn:active { background: var(--cream); border-color: var(--brown-light); color: var(--brown); }

.config-save-btn {
  margin: 14px 15px 15px; padding: 12px; border-radius: var(--r-sm);
  border: none; background: var(--brown); color: #fff;
  font-family: var(--font-ui); font-size: 14px; font-weight: 800; cursor: pointer;
  width: calc(100% - 30px); transition: opacity var(--t);
}
.config-save-btn:active { opacity: .85; }
.config-sobre-wrap {
  padding: 16px 15px; display: flex; flex-direction: column;
  gap: 4px; align-items: center; text-align: center;
}
.config-sobre-emoji { font-size: 32px; margin-bottom: 4px; }
.config-sobre-title { font-size: 15px; font-weight: 800; color: var(--brown); }
.config-sobre-ver   { font-size: 12px; color: var(--muted); }
.config-sobre-info  { font-size: 12px; color: var(--muted); margin-top: 4px; line-height: 1.5; }
</style>

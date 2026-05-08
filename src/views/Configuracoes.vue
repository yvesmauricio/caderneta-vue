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
          <div class="config-row restore" @click="importFileRef?.click()">
            <div class="config-row-icon">📤</div>
            <div class="config-row-info">
              <div class="config-row-label">Restaurar Backup</div>
              <div class="config-row-sub">Importar dados de um arquivo .json salvo</div>
            </div>
            <div class="config-row-arrow">›</div>
          </div>
          <div class="config-row share" @click="compartilharBackup">
            <div class="config-row-icon">☁️</div>
            <div class="config-row-info">
              <div class="config-row-label">Compartilhar Backup</div>
              <div class="config-row-sub">Abre painel para Drive, WhatsApp, e-mail...</div>
            </div>
            <div class="config-row-arrow">›</div>
          </div>
          <div class="config-row drive" @click="salvarNoGoogleDrive">
            <div class="config-row-icon config-row-icon--letter">G</div>
            <div class="config-row-info">
              <div class="config-row-label">Salvar direto no Google Drive</div>
              <div class="config-row-sub">Entra na sua conta Google e envia o .json</div>
            </div>
            <div class="config-row-arrow">›</div>
          </div>
          <div class="config-row drive-restore" @click="abrirRestaurarGoogleDrive">
            <div class="config-row-icon config-row-icon--letter config-row-icon--green">G</div>
            <div class="config-row-info">
              <div class="config-row-label">Restaurar do Google Drive</div>
              <div class="config-row-sub">Escolha um backup salvo pelo app no Drive</div>
            </div>
            <div class="config-row-arrow">›</div>
          </div>
          <input type="file" ref="importFileRef" class="input-hidden" accept=".json" @change="importarBackup">
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
          <input type="file" ref="fotoInputRef" class="input-hidden" accept="image/*" @change="processarFoto">

          <div class="prod-lista">
            <div class="prod-card" v-for="(p, i) in produtosEdit" :key="p.id">

              <!-- Ícone / Foto -->
              <div class="prod-card-icone">
                <img
                  v-if="p.emoji?.startsWith('data:')"
                  :src="p.emoji"
                  class="prod-foto"
                  @click="removerFoto(i)"
                  title="Clique para remover foto"
                >
                <input
                  v-else
                  type="text"
                  class="prod-emoji-input"
                  v-model="produtosEdit[i].emoji"
                  title="Digite emoji"
                >
                <button class="btn-foto" @click="abrirSeletorFoto(i)" title="Usar foto real">📷</button>
              </div>

              <!-- Campos: nome + preço -->
              <div class="prod-card-campos">
                <input
                  type="text"
                  class="prod-input prod-nome"
                  v-model="produtosEdit[i].nome"
                  placeholder="Nome do produto"
                >
                <div class="prod-preco-wrap">
                  <span class="prod-preco-label">R$</span>
                  <input
                    type="text"
                    class="prod-preco"
                    inputmode="decimal"
                    :value="formatarPreco(p.preco)"
                    @input="onPrecoInput(i, $event)"
                    placeholder="0,00"
                  >
                </div>
              </div>

              <!-- Confirmar exclusão ou botão lixeira -->
              <div v-if="confirmandoIdx === i" class="prod-confirm-del">
                <span class="prod-confirm-label">Excluir?</span>
                <button class="prod-confirm-sim" @click="confirmarRemocao(i)">Sim</button>
                <button class="prod-confirm-nao" @click="confirmandoIdx = -1">Não</button>
              </div>
              <button v-else class="prod-card-del" @click="confirmandoIdx = i" title="Remover produto">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
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

    <Teleport to="body">
      <div v-if="modalDrive" class="modal-overlay" @click.self="modalDrive=false">
        <div class="modal-sheet">
          <div class="modal-header">
            <div class="modal-titulo">Restaurar do Google Drive</div>
            <button class="btn-fechar" @click="modalDrive=false">✕</button>
          </div>
          <DriveBackupList 
            :files="backupsDrive" 
            :loading="carregandoDrive" 
            @restore="restaurarBackupDrive" 
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useDB } from '../composables/useDB.js'
import { useToast } from '../composables/useToast.js'
import { appStore, appActions } from '../stores/appStore.js'
import { aplicarBackupDB } from '../utils/backupHandler.js'
import DriveBackupList from './DriveBackupList.vue'
import * as driveService from '../utils/googleDriveService.js'

const { getAll, put, del } = useDB()
const { toast } = useToast()

const importFileRef  = ref(null)
const fotoInputRef   = ref(null)
const activeIdx      = ref(-1)
const confirmandoIdx = ref(-1)   // índice do produto aguardando confirmação de exclusão

const GOOGLE_DRIVE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const driveAccessToken = ref('')
const modalDrive       = ref(false)
const backupsDrive     = ref([])
const carregandoDrive  = ref(false)

const acc = reactive({ backup: true, produtos: false, taxas: false, sobre: false })

const produtosEdit = ref([])
const taxasEdit    = ref({ debito: 2.98, credito_avista: 6.17 })

function toggle(key) {
  Object.keys(acc).forEach(k => { if (k !== key) acc[k] = false })
  acc[key] = !acc[key]
}

/* ── Máscara de preço BR (6,50) ──────────────────────── */
function formatarPreco(valor) {
  const num = Number(valor) || 0
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function onPrecoInput(i, e) {
  const digits   = e.target.value.replace(/\D/g, '')
  const centavos = parseInt(digits || '0', 10)
  const valor    = centavos / 100
  produtosEdit.value[i].preco = valor
  e.target.value = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

function confirmarRemocao(index) {
  produtosEdit.value.splice(index, 1)
  confirmandoIdx.value = -1
}

function abrirSeletorFoto(index) {
  activeIdx.value = index
  fotoInputRef.value.click()
}

async function processarFoto(e) {
  const file = e.target.files?.[0]
  if (!file || activeIdx.value === -1) return

  const targetIdx = activeIdx.value
  e.target.value  = ''

  const imgUrl = URL.createObjectURL(file)
  const img    = new Image()

  img.onload = () => {
    const canvas  = document.createElement('canvas')
    const size    = 96
    canvas.width  = size
    canvas.height = size
    const ctx   = canvas.getContext('2d')
    const scale = Math.max(size / img.width, size / img.height)
    const x     = (size / 2) - (img.width  / 2) * scale
    const y     = (size / 2) - (img.height / 2) * scale
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, size, size)
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
    produtosEdit.value[targetIdx].emoji = canvas.toDataURL('image/jpeg', 0.7)
    URL.revokeObjectURL(imgUrl)
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
  const { blob, nomeArquivo } = await criarArquivoBackup()
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  a.click()
  URL.revokeObjectURL(url)
  toast('📥 Backup baixado!', 'sucesso')
}

async function criarArquivoBackup() {
  const dados = {
    lojas:    await getAll('lojas'),
    clientes: await getAll('clientes'),
    fiados:   await getAll('fiados'),
    config:   { produtos: appStore.produtos, taxas: appStore.taxas },
    exportadoEm: new Date().toISOString()
  }
  const agora       = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const nomeArquivo = `backup-caderno-${agora}.json`
  const blob        = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
  return { blob, nomeArquivo }
}

async function compartilharBackup() {
  try {
    const { blob, nomeArquivo } = await criarArquivoBackup()
    const file = new File([blob], nomeArquivo, { type: 'application/json' })
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

async function salvarNoGoogleDrive() {
  if (!navigator.onLine)       { toast('Conecte na internet para enviar ao Google Drive.', 'aviso'); return }
  if (!GOOGLE_DRIVE_CLIENT_ID) { toast('Configure o Client ID do Google Drive.', 'aviso'); return }
  try {
    const { blob, nomeArquivo } = await criarArquivoBackup()
    const token = await driveService.pedirTokenGoogle(GOOGLE_DRIVE_CLIENT_ID)
    await driveService.enviarArquivoDrive(token, blob, nomeArquivo)
    toast('✅ Backup salvo no Google Drive!', 'sucesso')
  } catch (err) {
    toast('Não foi possível salvar no Drive.', 'erro')
  }
}

async function abrirRestaurarGoogleDrive() {
  if (!navigator.onLine)       { toast('Conecte na internet para acessar o Google Drive.', 'aviso'); return }
  if (!GOOGLE_DRIVE_CLIENT_ID) { toast('Configure o Client ID do Google Drive.', 'aviso'); return }
  modalDrive.value      = true
  carregandoDrive.value = true
  backupsDrive.value    = []
  try {
    const token = driveAccessToken.value || await driveService.pedirTokenGoogle(GOOGLE_DRIVE_CLIENT_ID)
    backupsDrive.value = await driveService.listarBackupsDrive(token)
  } catch {
    modalDrive.value = false
    toast('Não foi possível ler o Google Drive.', 'erro')
  } finally {
    carregandoDrive.value = false
  }
}

async function restaurarBackupDrive(backup) {
  const ok = confirm(`Restaurar o backup "${backup.name}"? Os dados atuais serão substituídos.`)
  if (!ok) return
  try {
    const token = driveAccessToken.value || await driveService.pedirTokenGoogle(GOOGLE_DRIVE_CLIENT_ID)
    const dados = await driveService.baixarBackupDrive(token, backup.id)
    await aplicarBackupDB(dados, { getAll, put, del, appActions })
    modalDrive.value = false
    toast('✅ Backup restaurado do Google Drive!', 'sucesso')
    setTimeout(() => location.reload(), 1200)
  } catch {
    toast('Não foi possível restaurar este backup.', 'erro')
  }
}

async function importarBackup(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async ev => {
    try {
      const dados = JSON.parse(ev.target.result)
      await aplicarBackupDB(dados, { getAll, put, del, appActions })
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
/* ── Layout geral ────────────────────────────────────────── */
.tela-config {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg);
}

.config-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 12px 12px 100px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-hidden {
  display: none;
}

/* ── Accordion ───────────────────────────────────────────── */
.config-section {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  overflow: hidden;
  box-shadow: var(--shadow);
  flex-shrink: 0;
}

.config-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 15px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  gap: 8px;
  user-select: none;
}

.config-section-title:active {
  opacity: 0.8;
}

.config-acc-chevron {
  color: var(--brown-light);
  flex-shrink: 0;
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
}

.config-section.aberto .config-acc-chevron {
  transform: rotate(180deg);
}

.config-acc-body {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  opacity: 0;
  transition: grid-template-rows 0.3s ease, opacity 0.3s ease;
}

.config-section.aberto .config-acc-body {
  grid-template-rows: 1fr;
  opacity: 1;
  border-top: 1px solid var(--border);
}

/* ── Linhas de backup ────────────────────────────────────── */
.config-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background var(--t);
  min-height: 54px;
}

.config-row:last-of-type {
  border-bottom: none;
}

.config-row:active {
  background: var(--cream);
}

.config-row-icon {
  font-size: 20px;
  width: 36px;
  text-align: center;
  flex-shrink: 0;
}

.config-row-icon--letter {
  font-size: 16px;
  font-weight: 800;
  color: var(--blue);
}

.config-row-icon--green {
  color: var(--green);
}

.config-row-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.config-row-label {
  font-size: 14px;
  font-weight: 700;
}

.config-row-sub {
  font-size: 11px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.config-row-arrow {
  color: var(--muted);
  font-size: 18px;
  flex-shrink: 0;
}

.config-row.download .config-row-icon { color: var(--brown-mid); }
.config-row.share    .config-row-icon { color: #34a853; }
.config-row.restore  .config-row-icon { color: var(--orange); }

/* ── Drive modal ─────────────────────────────────────────── */
.drive-empty {
  padding: 18px 4px;
  color: var(--muted);
  font-size: 13px;
  text-align: center;
}

.drive-backup-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drive-backup-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  min-height: 56px;
  border: 1.5px solid var(--border);
  border-radius: var(--r-sm);
  background: var(--surface);
  box-shadow: var(--shadow);
  font-family: var(--font-ui);
  cursor: pointer;
  text-align: left;
}

.drive-backup-row:active {
  background: var(--cream);
}

.drive-backup-info {
  flex: 1;
  min-width: 0;
}

.drive-backup-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drive-backup-date {
  margin-top: 2px;
  font-size: 11px;
  color: var(--muted);
}

.drive-backup-action {
  color: var(--green);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

/* ── Lista de produtos ───────────────────────────────────── */
.prod-lista {
  display: flex;
  flex-direction: column;
}

/* Card compacto: ícone | campos | ação */
.prod-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid var(--border);
  min-height: 84px;
}

.prod-card:last-child {
  border-bottom: none;
}

/* ── Ícone / foto ────────────────────────────────────────── */
.prod-card-icone {
  position: relative;
  flex-shrink: 0;
}

.prod-foto {
  display: block;
  width: 48px;
  height: 48px;
  border-radius: var(--r-sm);
  object-fit: cover;
  border: 1.5px solid var(--border);
  cursor: pointer;
  background: var(--bg);
}

.prod-emoji-input {
  display: block;
  width: 48px;
  height: 48px;
  font-size: 22px;
  text-align: center;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: var(--r-sm);
  padding: 0;
  cursor: pointer;
  font-family: var(--font-ui);
}

.prod-emoji-input:focus {
  outline: none;
  border-color: var(--brown-light);
  background: var(--surface);
}

.btn-foto {
  position: absolute;
  bottom: -12px;
  right: -12px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--surface);
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow);
  z-index: 2;
}

.btn-foto:active {
  transform: scale(0.9);
}

/* ── Campos nome + preço ─────────────────────────────────── */
.prod-card-campos {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.prod-input {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: var(--r-sm);
  font-family: var(--font-ui);
  color: var(--text);
  background: var(--bg);
  user-select: text;
  transition: border-color var(--t), background var(--t);
}

.prod-input:focus {
  outline: none;
  border-color: var(--brown-light);
  background: var(--surface);
}

.prod-nome {
  padding: 10px 12px;
  font-size: 16px;
  font-weight: 700;
}

.prod-preco-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border);
  border-radius: var(--r-sm);
  background: var(--bg);
  overflow: hidden;
  transition: border-color var(--t), background var(--t);
}

.prod-preco-wrap:focus-within {
  border-color: var(--brown-light);
  background: var(--surface);
}

.prod-preco-label {
  padding: 0 5px 0 10px;
  font-size: 11px;
  color: var(--muted);
  font-weight: 700;
  flex-shrink: 0;
  user-select: none;
}

.prod-preco {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
  color: var(--brown);
  padding: 10px 8px 10px 0;
  outline: none;
  user-select: text;
  min-width: 0;
}

/* ── Botão lixeira discreto ──────────────────────────────── */
.prod-card-del {
  flex-shrink: 0;
  align-self: center;
  width: 44px;
  height: 44px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--border);
  background: var(--red-bg);
  color: var(--red);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.75;
  transition: opacity 0.2s, border-color 0.2s;
}

.prod-card-del:active {
  opacity: 1;
  border-color: var(--red);
}

/* ── Confirmação inline de exclusão ──────────────────────── */
.prod-confirm-del {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.prod-confirm-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--red);
  white-space: nowrap;
}

.prod-confirm-sim {
  min-height: 40px;
  padding: 8px 12px;
  border-radius: var(--r-sm);
  border: none;
  background: var(--red);
  color: #fff;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.2s;
}

.prod-confirm-sim:active {
  opacity: 0.8;
}

.prod-confirm-nao {
  min-height: 40px;
  padding: 8px 12px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--border2);
  background: var(--surface);
  color: var(--muted);
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s;
}

.prod-confirm-nao:active {
  background: var(--cream);
}

/* ── Botões de ação da seção ─────────────────────────────── */
.config-add-btn {
  margin: 10px 12px 0;
  padding: 12px;
  min-height: 44px;
  border-radius: var(--r-sm);
  border: 1.5px dashed var(--border2);
  background: transparent;
  color: var(--muted);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  width: calc(100% - 24px);
  transition: all var(--t);
}

.config-add-btn:active {
  background: var(--cream);
  border-color: var(--brown-light);
  color: var(--brown);
}

.config-save-btn {
  margin: 12px 12px 14px;
  padding: 12px;
  min-height: 44px;
  border-radius: var(--r-sm);
  border: none;
  background: var(--brown);
  color: #fff;
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  width: calc(100% - 24px);
  transition: opacity var(--t);
}

.config-save-btn:active {
  opacity: 0.85;
}

/* ── Taxas ───────────────────────────────────────────────── */
.taxa-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  border-bottom: 1px solid var(--border);
}

.taxa-row:last-of-type {
  border-bottom: none;
}

.taxa-label {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
}

.taxa-input-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: var(--r-sm);
  padding: 0 10px;
  transition: border-color var(--t);
}

.taxa-input-wrap:focus-within {
  border-color: var(--brown-light);
}

.taxa-input {
  width: 54px;
  border: none;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--brown);
  padding: 8px 0;
  text-align: right;
  outline: none;
  user-select: text;
}

.taxa-percent {
  font-size: 13px;
  color: var(--muted);
  font-weight: 600;
}

/* ── Sobre ───────────────────────────────────────────────── */
.config-sobre-wrap {
  padding: 16px 15px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  text-align: center;
}

.config-sobre-emoji { font-size: 32px; margin-bottom: 4px; }
.config-sobre-title { font-size: 15px; font-weight: 800; color: var(--brown); }
.config-sobre-ver   { font-size: 12px; color: var(--muted); }

.config-sobre-info {
  font-size: 12px;
  color: var(--muted);
  margin-top: 4px;
  line-height: 1.5;
}
</style>

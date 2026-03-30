// stores/appStore.js
import { reactive, readonly } from 'vue'

const PRODUTOS_DEFAULT = [
  { id: 'trufa',    nome: 'Trufa',      emoji: '🍫', preco: 6  },
  { id: 'cone',     nome: 'Cone',       emoji: '🍦', preco: 8  },
  { id: 'bolo',     nome: 'Bolo/Torta', emoji: '🎂', preco: 15 },
  { id: 'barrinha', nome: 'Barrinha',   emoji: '🍫', preco: 7  },
]

function carregarProdutos() {
  try {
    const s = localStorage.getItem('caderno_produtos')
    if (s) {
      const salvos = JSON.parse(s)
      if (salvos && salvos.length) {
        // 1. Garante que produtos salvos tenham todas as propriedades (ex: emoji) 
        const merge = salvos.map(ps => {
          const def = PRODUTOS_DEFAULT.find(d => d.id === ps.id)
          return { emoji: '📦', ...def, ...ps } // Garante emoji mesmo que nulo
        })
        // 2. Adiciona novos produtos que não existiam no banco do usuário
        const idsExistentes = new Set(merge.map(p => p.id))
        const novos = PRODUTOS_DEFAULT.filter(def => !idsExistentes.has(def.id))
        return [...merge, ...novos]
      }
    }
  } catch(e) {}
  return PRODUTOS_DEFAULT.map(p => ({ ...p }))
}

function carregarTaxas() {
  try {
    const s = localStorage.getItem('caderno_taxas')
    if (s) return JSON.parse(s)
  } catch(e) {}
  return { debito: 2.98, credito_avista: 6.17 }
}

const state = reactive({
  telaAtual:  'boasvindas',
  telaAnterior: null,
  loja:       null,
  cliente:    null,
  qtds:       {},
  dataVenda:  '',
  dataVenc:   '',
  produtos:   carregarProdutos(),
  taxas:      carregarTaxas(),
  PRODUTOS_DEFAULT,
})

function resetQtds() {
  state.produtos.forEach(p => { state.qtds[p.id] = 0 })
}

function salvarProdutos(lista) {
  state.produtos = lista
  localStorage.setItem('caderno_produtos', JSON.stringify(lista))
}

function salvarTaxas(t) {
  state.taxas = t
  localStorage.setItem('caderno_taxas', JSON.stringify(t))
}

export const appStore = readonly(state)
export const appActions = { resetQtds, salvarProdutos, salvarTaxas, state }

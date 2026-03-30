// composables/useToast.js
import { ref } from 'vue'

const msg   = ref('')
const tipo  = ref('sucesso')
const show  = ref(false)
let timer   = null

export function useToast() {
  function toast(mensagem, t = 'sucesso') {
    msg.value  = mensagem
    tipo.value = t
    show.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { show.value = false }, 2800)
  }
  return { msg, tipo, show, toast }
}

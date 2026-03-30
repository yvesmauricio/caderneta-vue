<template>
  <div class="tela-calc">
    <div class="topbar">
      <div></div>
      <div class="topbar-title">🧮 Maquininha</div>
      <div></div>
    </div>

    <div class="calc-body">
      <div class="calc-input-wrap">
        <div class="calc-input-label">Valor que você quer receber</div>
        <input
          class="calc-input-field"
          type="tel"
          inputmode="numeric"
          placeholder="R$ 0,00"
          v-model="rawInput"
          @input="formatarMoeda"
        >
        <div class="calc-divider"></div>
        <div class="calc-hint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          A taxa é repassada ao cliente
        </div>
      </div>

      <div class="calc-results">
        <div class="calc-result-card debito">
          <div class="calc-result-icon">💳</div>
          <div class="calc-result-info">
            <div class="calc-result-tipo">Débito na hora</div>
            <div class="calc-result-taxa">Taxa repassada: {{ taxaStr(taxas.debito) }}</div>
          </div>
          <div class="calc-result-val debito">R$ {{ resultDebito }}</div>
        </div>

        <div class="calc-result-card credito">
          <div class="calc-result-icon">💰</div>
          <div class="calc-result-info">
            <div class="calc-result-tipo">Crédito à vista na hora</div>
            <div class="calc-result-taxa">Taxa repassada: {{ taxaStr(taxas.credito_avista) }}</div>
          </div>
          <div class="calc-result-val credito">R$ {{ resultCredito }}</div>
        </div>
      </div>

      <div class="calc-info-box">
        <span style="font-size:18px;flex-shrink:0">🏦</span>
        <p>PagBank configurado para recebimento <b>na hora</b>. O valor exibido é o que você deve cobrar na maquininha para receber o valor desejado líquido.</p>
      </div>

      <button class="calc-clear-btn" @click="limpar">Limpar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { appStore } from '../stores/appStore.js'

const taxas    = computed(() => appStore.taxas)
const rawInput = ref('')

const fmt = v => Number(v||0).toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })

function taxaStr(t) {
  return String(t).replace('.', ',') + '%'
}

function parseVal() {
if (!rawInput.value) return 0;
  
  const clean = rawInput.value
    .replace(/[^\d,]/g, "") // Mantém apenas números e a vírgula
    .replace(",", ".");     // Troca vírgula por ponto para o JS calcular
    
  return parseFloat(clean) || 0;
}

function bruto(liquido, taxa) {
  return liquido / (1 - taxa / 100)
}

const resultDebito = computed(() => {
  const v = parseVal()
  if (!v) return '0,00'
  return fmt(bruto(v, taxas.value.debito))
})

const resultCredito = computed(() => {
  const v = parseVal()
  if (!v) return '0,00'
  return fmt(bruto(v, taxas.value.credito_avista))
})

function atualizar() {}

function limpar() {
  rawInput.value = ''
}

function formatarMoeda(e) {
  let v = e.target.value.replace(/\D/g, ""); // Remove letras e símbolos
  
  if (!v) {
    rawInput.value = "";
    return;
  }

  // Converte para centavos e formata para o padrão brasileiro
  const valorNum = (Number(v) / 100);
  rawInput.value = valorNum.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

</script>

<style scoped>
.tela-calc { display: flex; flex-direction: column; height: 100%; background: var(--bg); }
.calc-body {
  flex: 1 1 0; min-height: 0; overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px 16px 100px;
  display: flex; flex-direction: column; gap: 20px;
}
.calc-input-wrap {
  background: var(--surface); border: 2px solid var(--border2);
  border-radius: var(--r); padding: 20px 18px 16px;
  box-shadow: var(--shadow-md); display: flex; flex-direction: column; gap: 6px;
}
.calc-input-label {
  font-size: 11px; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: .06em;
}
.calc-input-field {
  width: 100%; border: none; background: transparent;
  font-family: var(--font-mono); font-size: 36px; font-weight: 700;
  color: var(--brown); outline: none; caret-color: var(--gold);
  user-select: text;
}
.calc-input-field::placeholder { color: var(--border2); }
.calc-divider { height: 1px; background: var(--border); margin: 0 -18px; }
.calc-hint { font-size: 11px; color: var(--muted); display: flex; align-items: center; gap: 5px; margin-top: 2px; }
.calc-results { display: flex; flex-direction: column; gap: 12px; }
.calc-result-card {
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: var(--r); padding: 16px 18px;
  box-shadow: var(--shadow); display: flex; align-items: center; gap: 14px;
}
.calc-result-card.debito  { border-left: 4px solid var(--blue); }
.calc-result-card.credito { border-left: 4px solid var(--green); }
.calc-result-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.calc-result-card.debito  .calc-result-icon { background: var(--blue-bg); }
.calc-result-card.credito .calc-result-icon { background: var(--green-bg); }
.calc-result-info  { flex: 1; }
.calc-result-tipo  { font-size: 12px; font-weight: 700; color: var(--muted); }
.calc-result-taxa  { font-size: 10px; color: var(--muted); margin-top: 1px; }
.calc-result-val   { font-family: var(--font-mono); font-size: 22px; font-weight: 800; text-align: right; flex-shrink: 0; }
.calc-result-val.debito  { color: var(--blue); }
.calc-result-val.credito { color: var(--green); }
.calc-info-box {
  background: var(--gold-bg); border: 1px solid rgba(200,137,10,.25);
  border-radius: var(--r); padding: 14px 16px;
  display: flex; gap: 10px; align-items: flex-start;
}
.calc-info-box p { font-size: 12px; color: var(--brown-mid); line-height: 1.55; }
.calc-clear-btn {
  align-self: center; padding: 10px 24px;
  border-radius: var(--r-full); border: 1.5px solid var(--border2);
  background: var(--surface); color: var(--muted);
  font-family: var(--font-ui); font-size: 13px; font-weight: 700; cursor: pointer;
}
.calc-clear-btn:active { background: var(--cream-deep); }
</style>

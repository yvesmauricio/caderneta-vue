/**
 * Processa a importação de dados para o IndexedDB
 */
export async function aplicarBackupDB(dados, { getAll, put, del, appActions }) {
  if (!dados || typeof dados !== 'object') throw new Error('Dados inválidos');

  // 1. Restaurar configurações no Store (Pinia/Reactive)
  if (dados.config) {
    if (dados.config.produtos) appActions.salvarProdutos(dados.config.produtos);
    if (dados.config.taxas) appActions.salvarTaxas(dados.config.taxas);
  }

  // 2. Limpar e Repopular tabelas do IndexedDB
  const tabelas = ['lojas', 'clientes', 'fiados'];
  
  for (const tabela of tabelas) {
    if (Array.isArray(dados[tabela])) {
      // Melhoria: Limpeza em massa antes de repopular
      const atuais = await getAll(tabela);
      await Promise.all(atuais.map(item => del(tabela, item.id)));
      
      // Inserção em lote para reduzir o overhead de transações
      await Promise.all(dados[tabela].map(item => put(tabela, item)));
    }
  }
}
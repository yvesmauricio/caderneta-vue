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
      // Opcional: Limpar tabela atual antes
      const atuais = await getAll(tabela);
      for (const item of atuais) {
        await del(tabela, item.id);
      }
      // Inserir novos
      for (const item of dados[tabela]) {
        await put(tabela, item);
      }
    }
  }
}
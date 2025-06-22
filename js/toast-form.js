// Toast simples com Tailwind
function showToast(msg, success = true) {
  let toast = document.createElement('div');
  toast.textContent = msg;
  toast.className = `fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg z-50 text-white font-semibold transition-all duration-300 ${success ? 'bg-green-600' : 'bg-red-600'}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('relatorioForm');
  if (!form) return;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalBg = submitButton ? submitButton.style.backgroundColor : '';
  const originalCursor = submitButton ? submitButton.style.cursor : '';

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';
      submitButton.classList.add('bg-gray-400', 'cursor-not-allowed');
      submitButton.classList.remove('bg-green-600', 'hover:bg-green-700');
    }

    // --- Serialização dos Materiais Dinâmicos ---
    const materiaisArray = [];
    document.querySelectorAll('.material-row').forEach(row => {
        const descricao = row.querySelector('input[name^="MaterialDescricao"]').value;
        const qtd = row.querySelector('input[name^="MaterialQtd"]').value;
        const subtotal = row.querySelector('input[name^="MaterialSubtotal"]').value;
        
        if (descricao) { // Só adiciona se houver descrição
            materiaisArray.push(`${qtd}x ${descricao} (${subtotal})`);
        }
    });

    const materiaisTexto = materiaisArray.join('\n'); // CORREÇÃO: Usa '\n' para quebra de linha real

    // Cria um input oculto para enviar os dados consolidados
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'Materiais';
    hiddenInput.value = materiaisTexto;
    form.appendChild(hiddenInput);

    // --- Mapeamento para "Valor Total do Serviço" ---
    const valorServicoInput = document.getElementById('valorServico');
    const valorServicoOriginalName = valorServicoInput.name;
    const valorTotalServicoHiddenInput = document.createElement('input');
    
    valorTotalServicoHiddenInput.type = 'hidden';
    valorTotalServicoHiddenInput.name = 'Valor Total do Serviço';
    valorTotalServicoHiddenInput.value = valorServicoInput.value;
    form.appendChild(valorTotalServicoHiddenInput);
    
    // Remove o name do input original para não ser enviado com o nome antigo
    valorServicoInput.name = '';
    // --- Fim da Serialização ---

    const formData = new FormData(form);
    
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData
      });
      let text = await response.text();
      let isSuccess = false;
      try {
        const json = JSON.parse(text);
        isSuccess = json.result === 'success';
      } catch { /* fallback para texto */ }
      if (isSuccess) {
        showToast('Ordem enviada com sucesso!', true);
        // Formulário não é mais limpo automaticamente
        // As assinaturas também não são mais limpas automaticamente
      } else {
        showToast('Erro ao enviar ordem!', false);
      }
    } catch (err) {
      showToast('Erro ao enviar ordem!', false);
    } finally {
      form.removeChild(hiddenInput); // Limpa o input oculto de materiais
      form.removeChild(valorTotalServicoHiddenInput); // Limpa o input oculto do valor total
      valorServicoInput.name = valorServicoOriginalName; // Restaura o name original
      
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Salvar';
        submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
        submitButton.classList.add('bg-green-600', 'hover:bg-green-700');
      }
    }
  });
}); 
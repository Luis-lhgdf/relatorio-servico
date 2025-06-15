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
      submitButton.classList.remove('bg-dark-800', 'hover:bg-dark-900');
    }
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
        form.reset();
      } else {
        showToast('Erro ao enviar ordem!', false);
      }
    } catch (err) {
      showToast('Erro ao enviar ordem!', false);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Salvar';
        submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
        submitButton.classList.add('bg-dark-800', 'hover:bg-dark-900');
      }
    }
  });
}); 
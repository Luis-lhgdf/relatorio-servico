// Gera PDF fiel ao formulário, campo a campo, com layout responsivo e espaçado
import { formatarDataBR } from './utils.js';

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('gerarPDF');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Gerando PDF...';
    btn.classList.add('bg-gray-400', 'cursor-not-allowed');
    btn.classList.remove('bg-dark-700', 'hover:bg-dark-900');
    try {
      // Validação dos campos obrigatórios
      const obrigatorios = [
        { id: 'dataServico', nome: 'Data do Serviço' },
        { id: 'status', nome: 'Status' },
        { id: 'nomeFantasia', nome: 'Nome Fantasia (Cliente)' },
        { id: 'cnpjCliente', nome: 'CNPJ (Cliente)' }
      ];
      // Se técnico for outro, validar o campo de texto, senão o select
      if (document.getElementById('tecnico').value === 'outro') {
        obrigatorios.push({ id: 'tecnicoOutro', nome: 'Técnico Responsável' });
      } else {
        obrigatorios.push({ id: 'tecnico', nome: 'Técnico Responsável' });
      }
      for (const campo of obrigatorios) {
        const el = document.getElementById(campo.id);
        if (!el || !el.value.trim()) {
          if (typeof showToast === 'function') {
            showToast(`Preencha o campo obrigatório: ${campo.nome}`, false);
          } else {
            alert(`Preencha o campo obrigatório: ${campo.nome}`);
          }
          btn.disabled = false;
          btn.textContent = 'Gerar PDF';
          btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
          btn.classList.add('bg-dark-700', 'hover:bg-dark-900');
          return;
        }
      }
      // Validação das assinaturas
      const assinaturaTecnico = document.getElementById('assinaturaTecnico');
      const assinaturaCliente = document.getElementById('assinaturaCliente');
      function isCanvasVazio(canvas) {
        const ctx = canvas.getContext('2d');
        const pixel = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        return !Array.from(pixel).some(channel => channel !== 0);
      }
      if (isCanvasVazio(assinaturaTecnico)) {
        if (typeof showToast === 'function') {
          showToast('A assinatura do Técnico é obrigatória!', false);
        } else {
          alert('A assinatura do Técnico é obrigatória!');
        }
        btn.disabled = false;
        btn.textContent = 'Gerar PDF';
        btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
        btn.classList.add('bg-dark-700', 'hover:bg-dark-900');
        return;
      }
      if (isCanvasVazio(assinaturaCliente)) {
        if (typeof showToast === 'function') {
          showToast('A assinatura do Cliente é obrigatória!', false);
        } else {
          alert('A assinatura do Cliente é obrigatória!');
        }
        btn.disabled = false;
        btn.textContent = 'Gerar PDF';
        btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
        btn.classList.add('bg-dark-700', 'hover:bg-dark-900');
        return;
      }
      const get = id => document.getElementById(id)?.value || '';
      const getCheck = id => document.getElementById(id)?.checked;
      let tecnico = get('tecnico');
      if (tecnico === 'outro') {
        tecnico = get('tecnicoOutro');
      }
      const obterAssinaturaBase64 = tipo => {
        if (tipo === 'tecnico') return assinaturaTecnico ? assinaturaTecnico.toDataURL('image/png') : null;
        if (tipo === 'cliente') return assinaturaCliente ? assinaturaCliente.toDataURL('image/png') : null;
        return null;
      };
      const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      // --- Cabeçalho com fundo escuro ---
      let y = 15; // Posição inicial do cabeçalho
      pdf.setFillColor(0, 0, 0); // Cor de fundo (dark-900)
      pdf.roundedRect(15, y, 180, 28, 3, 3, 'F'); // Desenha o retângulo com bordas arredondadas (x, y, largura, altura, raio)

      y += 4; // Padding interno

      // Adiciona o logo
      try {
        const img = new Image();
        img.src = 'assets/icon.png';
        await new Promise(res => { img.onload = res; });
        pdf.addImage(img, 'PNG', 20, y, 18, 18);
      } catch {}

      // Adiciona os textos com cores claras
      pdf.setTextColor(255, 255, 255); // Cor do texto: Branco
      pdf.setFontSize(18);
      pdf.text('Refrigeração Fidelis', 42, y + 8);

      pdf.setTextColor(203, 213, 225); // Cor do texto: Cinza claro (gray-300)
      pdf.setFontSize(10);
      pdf.text('CNPJ: 45.191.572/0001-33', 42, y + 13);
      pdf.text('Tel: (11) 91671-5875', 42, y + 17);
      pdf.text('refrigeracaofidelis@outlook.com', 42, y + 21);
      
      y += 28; // Move o cursor para baixo, após o cabeçalho
      // --- Fim do cabeçalho ---

      pdf.setDrawColor(180,180,180);
      pdf.line(15, y, 195, y);
      y += 8;
      pdf.setFontSize(15);
      pdf.setTextColor(30,30,30);
      pdf.text('Ordem de Serviço', 105, y, {align:'center'});
      y += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(120,120,120);
      y += 10;
      // Layout responsivo dos campos
      pdf.setFontSize(12);
      pdf.setTextColor(40,40,40);
      const labelX = 18;
      const valueX = 80;
      const lineHeight = 9;
      const addField = (label, value) => {
        pdf.setFont(undefined, 'bold');
        pdf.text(label+':', labelX, y);
        pdf.setFont(undefined, 'normal');
        pdf.text(String(value), valueX, y);
        y += lineHeight;
      };
      addField('Data do Serviço', formatarDataBR(get('dataServico')));
      addField('Status', get('status'));
      addField('Técnico Responsável', tecnico);
      addField('Nome Fantasia (Cliente)', get('nomeFantasia'));
      addField('CNPJ (Cliente)', get('cnpjCliente'));
      
      // Campos opcionais - só adiciona se tiver valor
      if (get('equipamento')) {
        addField('Equipamentos Atendidos', get('equipamento'));
      }
      if (get('defeito')) {
        addField('Defeito Relatado', get('defeito'));
      }
      if (get('servico')) {
        addField('Serviço Realizado', get('servico'));
      }
      if (get('materiais')) {
        addField('Materiais Utilizados', get('materiais'));
      }
      if (get('quantidade')) {
        addField('Quantidade (Materiais)', get('quantidade'));
      }
      if (getCheck('exibirValorMaterial') && get('valorTotalMaterial')) {
        addField('Valor Total (Material)', get('valorTotalMaterial'));
      }
      if (getCheck('exibirValorServico') && get('valorServico')) {
        addField('Valor Total do Serviço', get('valorServico'));
      }
      if (get('garantia')) {
        addField('Garantia Oferecida', get('garantia'));
      }
      y += 4;
      pdf.setDrawColor(220,220,220);
      pdf.line(15, y, 195, y);
      y += 12;
      pdf.setFont(undefined, 'bold');
      pdf.text('Assinatura do Técnico:', labelX, y);
      pdf.text('Assinatura do Cliente:', 110, y);
      y += 2;
      const assinaturaTecnicoImg = obterAssinaturaBase64('tecnico');
      const assinaturaClienteImg = obterAssinaturaBase64('cliente');
      if (assinaturaTecnicoImg) pdf.addImage(assinaturaTecnicoImg, 'PNG', labelX, y, 80, 24);
      if (assinaturaClienteImg) pdf.addImage(assinaturaClienteImg, 'PNG', 110, y, 80, 24);
      y += 28;
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(160,160,160);
      pdf.text('Gerado automaticamente pelo sistema Refrigeração Fidelis', 105, 287, {align:'center'});
      pdf.save('ordem-de-servico.pdf');
    } catch (err) {
      if (typeof showToast === 'function') {
        showToast('Erro ao gerar PDF!', false);
      } else {
        alert('Erro ao gerar PDF!');
      }
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Gerar PDF';
      btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
      btn.classList.add('bg-dark-700', 'hover:bg-dark-900');
    }
  });
}); 
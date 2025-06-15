// Gera PDF fiel ao formulário, campo a campo, com layout responsivo e espaçado
import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
import { formatarDataBR } from './utils.js';

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('gerarPDF');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Gerando PDF...';
    btn.classList.add('bg-gray-400', 'cursor-not-allowed');
    btn.classList.remove('bg-dark-700', 'hover:bg-dark-800');
    try {
      const get = id => document.getElementById(id)?.value || '';
      const getCheck = id => document.getElementById(id)?.checked;
      let tecnico = get('tecnico');
      if (tecnico === 'outro') {
        tecnico = get('tecnicoOutro');
      }
      const obterAssinaturaBase64 = tipo => {
        const canvas = document.getElementById(tipo === 'tecnico' ? 'assinaturaTecnico' : 'assinaturaCliente');
        return canvas ? canvas.toDataURL('image/png') : null;
      };
      const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      let y = 18;
      // Cabeçalho com logo
      try {
        const img = new Image();
        img.src = 'assets/icon.png';
        await new Promise(res => { img.onload = res; });
        pdf.addImage(img, 'PNG', 15, y, 18, 18);
      } catch {}
      pdf.setFontSize(18);
      pdf.setTextColor(40,40,40);
      pdf.text('Refrigeração Fidelis', 36, y+8);
      pdf.setFontSize(10);
      pdf.setTextColor(100,100,100);
      pdf.text('CNPJ: 45.191.572/0001-33', 36, y+14);
      pdf.text('Tel: (11) 91671-5875', 36, y+18);
      pdf.text('refrigeracaofidelis@outlook.com', 36, y+22);
      y += 26;
      pdf.setDrawColor(180,180,180);
      pdf.line(15, y, 195, y);
      y += 8;
      pdf.setFontSize(15);
      pdf.setTextColor(30,30,30);
      pdf.text('Ordem de Serviço', 105, y, {align:'center'});
      y += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(120,120,120);
      pdf.text('* Campos obrigatórios', 105, y, {align:'center'});
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
      addField('Equipamentos Atendidos', get('equipamento'));
      addField('Defeito Relatado', get('defeito'));
      addField('Serviço Realizado', get('servico'));
      addField('Materiais Utilizados', get('materiais'));
      addField('Quantidade (Materiais)', get('quantidade'));
      if (getCheck('exibirValorMaterial')) {
        addField('Valor Total (Material)', get('valorTotalMaterial'));
      }
      if (getCheck('exibirValorServico')) {
        addField('Valor Total do Serviço', get('valorServico'));
      }
      addField('Garantia Oferecida', get('garantia'));
      y += 4;
      pdf.setDrawColor(220,220,220);
      pdf.line(15, y, 195, y);
      y += 12;
      pdf.setFont(undefined, 'bold');
      pdf.text('Assinatura do Técnico:', labelX, y);
      pdf.text('Assinatura do Cliente:', 110, y);
      y += 2;
      const assinaturaTecnico = obterAssinaturaBase64('tecnico');
      const assinaturaCliente = obterAssinaturaBase64('cliente');
      if (assinaturaTecnico) pdf.addImage(assinaturaTecnico, 'PNG', labelX, y, 80, 24);
      if (assinaturaCliente) pdf.addImage(assinaturaCliente, 'PNG', 110, y, 80, 24);
      y += 28;
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(160,160,160);
      pdf.text('Gerado automaticamente pelo sistema Refrigeração Fidelis', 105, 287, {align:'center'});
      pdf.save('ordem-de-servico.pdf');
    } catch (err) {
      alert('Erro ao gerar PDF!');
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Gerar PDF';
      btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
      btn.classList.add('bg-dark-700', 'hover:bg-dark-800');
    }
  });
}); 
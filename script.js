/*script.js*/
// Ajusta canvas para alta DPI
function resizeCanvasForDPR(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.lineWidth = 2;
}

// Habilita desenho via Pointer Events
function enableSignature(canvas) {
  const ctx = canvas.getContext('2d');
  let drawing = false;
  canvas.addEventListener('pointerdown', e => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });
  canvas.addEventListener('pointermove', e => {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  });
  ['pointerup', 'pointerout'].forEach(evt =>
    canvas.addEventListener(evt, () => drawing = false)
  );
}

// Formata CNPJ
function formatCNPJ(e) {
  let v = e.target.value.replace(/\D/g, '');
  v = v.padEnd(14, '_').slice(0,14);
  e.target.value = v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, (_,a,b,c,d,f) =>
    `${a}.${b}.${c}/${d}-${f}`
  );
}

// Formata valor como moeda
function formatCurrency(e) {
  let v = e.target.value.replace(/\D/g, '');
  v = (parseInt(v, 10) / 100).toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL'
  });
  e.target.value = v;
}

// Preenche dados no preview
function populatePreview() {
  const data = document.getElementById('dataServico').value;
  const partes = data.split('-');
  document.getElementById('pv-data').textContent = `${partes[2]}/${partes[1]}/${partes[0]}`;
  document.getElementById('pv-tec').textContent = document.getElementById('tecnico').value;
  document.getElementById('pv-cnpj').textContent = document.getElementById('cnpj').value;
  document.getElementById('pv-razao').textContent = document.getElementById('razaoSocial').value;
  document.getElementById('pv-desc').textContent = document.getElementById('descricaoServico').value;
  document.getElementById('pv-valor').textContent = document.getElementById('valor').value;
  document.getElementById('pv-tec-sign').src = document.getElementById('assinaturaTecnico').toDataURL();
  document.getElementById('pv-cli-sign').src = document.getElementById('assinaturaCliente').toDataURL();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  const canvasTec = document.getElementById('assinaturaTecnico');
  const canvasCli = document.getElementById('assinaturaCliente');
  [canvasTec, canvasCli].forEach(resizeCanvasForDPR);
  [canvasTec, canvasCli].forEach(enableSignature);
  document.querySelectorAll('[data-clear-signature]').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = document.getElementById(btn.dataset.clearSignature);
      c.getContext('2d').clearRect(0, 0, c.width, c.height);
    });
  });
  document.getElementById('cnpj').addEventListener('input', formatCNPJ);
  document.getElementById('valor').addEventListener('input', formatCurrency);
  document.getElementById('osForm').addEventListener('submit', e => {
    e.preventDefault();
    populatePreview();
    window.print();
  });
  document.getElementById('gerarPDF').addEventListener('click', e => {
    e.preventDefault();
    populatePreview();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.html(document.getElementById('osPreview'), {
      callback: pdf => pdf.save('ordem_de_servico.pdf'),
      x: 10, y: 10,
      html2canvas: { scale: 0.5 }
    });
  });
});

/*script.js*/
// Ajusta canvas para alta DPI
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');\ n  ctx.scale(dpr, dpr);
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

// Máscaras e formatações
function formatCNPJ(e) { /* ... */ }
function formatCurrency(e) { /* ... */ }
// Preenche dados no preview
function populatePreview() { /* ... */ }

// Geração de PDF com paginação
function gerarPDF() {
  populatePreview();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'pt', 'a4');
  const preview = document.getElementById('osPreview');
  doc.html(preview, {
    x: 20,
    y: 20,
    html2canvas: { scale: 2, useCORS: true },
    margin: [20, 20, 20, 20],
    autoPaging: 'text',
    width: doc.internal.pageSize.getWidth() - 40,
    callback: pdf => pdf.save('ordem_de_servico.pdf')
  });
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
    gerarPDF();
  });
});

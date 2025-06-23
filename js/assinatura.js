// Configuração dos canvas de assinatura
let canvasTecnico, canvasCliente;
let ctxTecnico, ctxCliente;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Função para inicializar os canvas
function inicializarCanvas() {
    // Canvas do Técnico
    canvasTecnico = document.getElementById('assinaturaTecnico');
    ctxTecnico = canvasTecnico.getContext('2d');
    
    // Canvas do Cliente
    canvasCliente = document.getElementById('assinaturaCliente');
    ctxCliente = canvasCliente.getContext('2d');
    
    // Configuração inicial dos canvas
    [canvasTecnico, canvasCliente].forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    });
    
    // Adiciona eventos de mouse/touch
    adicionarEventosCanvas(canvasTecnico, ctxTecnico);
    adicionarEventosCanvas(canvasCliente, ctxCliente);
}

// Função para adicionar eventos aos canvas
function adicionarEventosCanvas(canvas, ctx) {
    // Eventos de mouse
    canvas.addEventListener('mousedown', (e) => iniciarDesenho(e, canvas, ctx));
    canvas.addEventListener('mousemove', (e) => desenhar(e, canvas, ctx));
    canvas.addEventListener('mouseup', pararDesenho);
    canvas.addEventListener('mouseout', pararDesenho);
    
    // Eventos de touch
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        iniciarDesenho(e.touches[0], canvas, ctx);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        desenhar(e.touches[0], canvas, ctx);
    });
    canvas.addEventListener('touchend', pararDesenho);
}

// Função para iniciar o desenho
function iniciarDesenho(e, canvas, ctx) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

// Função para desenhar
function desenhar(e, canvas, ctx) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    lastX = x;
    lastY = y;
}

// Função para parar o desenho
function pararDesenho() {
    isDrawing = false;
}

// Função para limpar a assinatura (tornada global)
window.limparAssinatura = function(tipo) {
    const canvas = tipo === 'tecnico' ? canvasTecnico : canvasCliente;
    const ctx = tipo === 'tecnico' ? ctxTecnico : ctxCliente;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Função para obter a assinatura como base64
function obterAssinaturaBase64(tipo) {
    const canvas = tipo === 'tecnico' ? canvasTecnico : canvasCliente;
    return canvas.toDataURL('image/png');
}

// Inicializa os canvas quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarCanvas); 
// Função para limpar a assinatura no canvas
function limparAssinatura(tipo) {
    const canvas = document.getElementById(`assinatura${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// Função para capturar a posição correta dentro do canvas
function getPosicao(evento, canvas) {
    const rect = canvas.getBoundingClientRect(); // Posição do canvas na tela
    let x, y;

    if (evento.touches) {
        // Para dispositivos móveis (touch)
        x = evento.touches[0].clientX - rect.left;
        y = evento.touches[0].clientY - rect.top;
    } else {
        // Para desktop (mouse)
        x = evento.offsetX || evento.layerX;
        y = evento.offsetY || evento.layerY;
    }

    return { x, y };
}

// Função para configurar a assinatura em qualquer canvas
function configurarAssinatura(canvas) {
    const context = canvas.getContext('2d');
    let desenhando = false;

    const iniciarDesenho = (evento) => {
        evento.preventDefault(); // Previne o comportamento padrão (ex: rolagem da tela no celular)
        desenhando = true;
        const { x, y } = getPosicao(evento, canvas);
        context.beginPath();
        context.moveTo(x, y);
    };

    const desenhar = (evento) => {
        if (!desenhando) return;
        evento.preventDefault();
        const { x, y } = getPosicao(evento, canvas);
        context.lineTo(x, y);
        context.stroke();
    };

    const pararDesenho = () => {
        desenhando = false;
    };

    // Eventos para mouse (desktop)
    canvas.addEventListener('mousedown', iniciarDesenho);
    canvas.addEventListener('mousemove', desenhar);
    canvas.addEventListener('mouseup', pararDesenho);
    canvas.addEventListener('mouseleave', pararDesenho);

    // Eventos para toque (mobile)
    canvas.addEventListener('touchstart', iniciarDesenho, { passive: false });
    canvas.addEventListener('touchmove', desenhar, { passive: false });
    canvas.addEventListener('touchend', pararDesenho);
    canvas.addEventListener('touchcancel', pararDesenho); // Caso o toque seja cancelado
}

// Aplicar a configuração nos canvases após o carregamento do DOM
document.addEventListener("DOMContentLoaded", function () {
    // Ajuste de event listeners para garantir que o canvas funcione corretamente em dispositivos móveis
    const canvasTecnico = document.getElementById('assinaturaTecnico');
    const canvasCliente = document.getElementById('assinaturaCliente');
    
    // Ajustando canvas para celular e desktop
    configurarAssinatura(canvasTecnico);
    configurarAssinatura(canvasCliente);
});

function formatarData(data) {
    // Dividir a data em partes (ano, mês, dia)
    const partes = data.split('-');
    
    // Reorganizar para o formato dd/mm/aaaa
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


// Função para gerar o PDF
function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Adicionar o logo no PDF
    // Adicionando uma imagem (em base64 ou caminho da imagem)
    const logo = 'assets/icons/Logo.jpg'; // Substitua pela sua imagem base64 ou caminho do arquivo
    doc.addImage(logo, 'PNG', 150, 10, 50, 30); // Parâmetros: imagem, tipo, x, y, largura, altura
    
    const dataServico = document.getElementById('dataServico').value;
    const tecnico = document.getElementById('tecnico').value;
    const cnpj = document.getElementById('cnpj').value;
    const razaoSocial = document.getElementById('razaoSocial').value;
    const descricaoServico = document.getElementById('descricaoServico').value;
    const valor = document.getElementById('valor').value;

    // Formatando a data para dd/mm/aaaa
    const dataFormatada = formatarData(dataServico);    

    // Adiciona os dados da ordem de serviço
    doc.setFont('helvetica', 'normal');  // Definindo a fonte
    doc.setFontSize(15); // Definindo o tamanho da fonte
    doc.setTextColor(0, 0, 0);  // Definindo a cor do texto (preto)
    doc.text(`Ordem de Serviço`, 70, 20);
    doc.text(`Data do Serviço: ${dataFormatada}`, 20, 40);
    doc.text(`Nome do Técnico: ${tecnico}`, 20, 50);
    doc.text(`CNPJ: ${cnpj}`, 20, 60);
    doc.text(`Razão Social: ${razaoSocial}`, 20, 70);
    doc.text(`Descrição do Serviço:`, 20, 80);
    doc.text(descricaoServico, 20, 80);
    doc.text(`Valor: R$ ${valor}`, 20, 110);
    
    // Adiciona a assinatura do técnico
    const canvasTecnicoData = canvasTecnico.toDataURL('image/png');
    doc.addImage(canvasTecnicoData, 'PNG', 20, 120, 100, 50);
    doc.text(`Assinatura do Técnico`, 20, 170);

    // Adiciona a assinatura do cliente
    const canvasClienteData = canvasCliente.toDataURL('image/png');
    doc.addImage(canvasClienteData, 'PNG', 20, 180, 100, 50);
    doc.text(`Assinatura do Cliente`, 20, 230);

    // Gera o PDF
    doc.save('ordem_de_servico.pdf');
}

// Impede o envio do formulário para gerar PDF
document.getElementById('osForm').addEventListener('submit', (e) => {
    e.preventDefault();
    gerarPDF();
});


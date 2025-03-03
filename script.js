// script.js

// Função para limpar a assinatura no canvas
function limparAssinatura(tipo) {
    const canvas = document.getElementById(`assinatura${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// Função auxiliar para obter coordenadas corretas no canvas
function getTouchPos(canvas, touchEvent) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
}

// Função genérica para adicionar eventos de desenho ao canvas
function configurarCanvas(canvas) {
    const context = canvas.getContext('2d');
    let drawing = false;

    // Eventos de mouse
    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        context.beginPath();
        context.moveTo(e.offsetX, e.offsetY);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (drawing) {
            context.lineTo(e.offsetX, e.offsetY);
            context.stroke();
        }
    });

    canvas.addEventListener('mouseup', () => { drawing = false; });
    canvas.addEventListener('mouseout', () => { drawing = false; });

    // Eventos de toque (suporte para celular)
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Evita rolagem da tela ao tocar
        drawing = true;
        const pos = getTouchPos(canvas, e);
        context.beginPath();
        context.moveTo(pos.x, pos.y);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (drawing) {
            const pos = getTouchPos(canvas, e);
            context.lineTo(pos.x, pos.y);
            context.stroke();
        }
    });

    canvas.addEventListener('touchend', () => { drawing = false; });
}

// Configurar os canvases para técnico e cliente
configurarCanvas(document.getElementById('assinaturaTecnico'));
configurarCanvas(document.getElementById('assinaturaCliente'));



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

// Função para gerar PDF
function gerarPDF() {
    // Aqui será implementada a lógica de geração do PDF
    console.log('Gerando PDF...');
}

// Adiciona o evento ao botão de gerar PDF
document.addEventListener('DOMContentLoaded', function() {
    const botaoGerarPDF = document.getElementById('gerarPDF');
    if (botaoGerarPDF) {
        botaoGerarPDF.addEventListener('click', gerarPDF);
    }
}); 
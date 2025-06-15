import { formatarDataBR, formatarCNPJ, formatarValor } from './utils.js';

// Função para controlar a exibição do campo de técnico
function setupTecnicoField() {
    const tecnicoSelect = document.getElementById('tecnico');
    const tecnicoOutroInput = document.getElementById('tecnicoOutro');

    tecnicoSelect.addEventListener('change', function() {
        if (this.value === 'outro') {
            tecnicoOutroInput.style.display = 'block';
            tecnicoOutroInput.required = true;
        } else {
            tecnicoOutroInput.style.display = 'none';
            tecnicoOutroInput.required = false;
            tecnicoOutroInput.value = '';
        }
    });
}

// Função para configurar os campos formatados
function setupCamposFormatados() {
    // Configuração do CNPJ
    const cnpjInput = document.getElementById('cnpjCliente');
    cnpjInput.addEventListener('input', function(e) {
        e.target.value = formatarCNPJ(e.target.value);
    });

    // Configuração dos campos de valor
    const camposValor = ['valorTotalMaterial', 'valorServico'];
    camposValor.forEach(id => {
        const campo = document.getElementById(id);
        campo.addEventListener('input', function(e) {
            e.target.value = formatarValor(e.target.value);
        });
    });
}

// Inicializa as funções quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    setupTecnicoField();
    setupCamposFormatados();
}); 
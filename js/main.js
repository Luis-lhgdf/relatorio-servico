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

// Função para formatar CNPJ
function formatarCNPJ(cnpj) {
    // Remove tudo que não é número
    cnpj = cnpj.replace(/\D/g, '');
    
    // Limita a 14 dígitos
    cnpj = cnpj.substring(0, 14);
    
    // Aplica a máscara
    if (cnpj.length > 12) {
        cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
    } else if (cnpj.length > 8) {
        cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4}).*/, '$1.$2.$3/$4');
    } else if (cnpj.length > 5) {
        cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3}).*/, '$1.$2.$3');
    } else if (cnpj.length > 2) {
        cnpj = cnpj.replace(/^(\d{2})(\d{3}).*/, '$1.$2');
    }
    
    return cnpj;
}

// Função para formatar valor em reais
function formatarValor(valor) {
    // Remove tudo que não é número
    valor = valor.replace(/\D/g, '');
    
    // Se o valor estiver vazio, retorna vazio
    if (!valor) return '';
    
    // Converte para número e divide por 100 para considerar os centavos
    const numero = parseInt(valor);
    
    // Se não for um número válido, retorna vazio
    if (isNaN(numero)) return '';
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero / 100);
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
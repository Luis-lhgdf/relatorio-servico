import { formatarDataBR, formatarCNPJ, formatarCPF, formatarValor, parseValor } from './utils.js';

// Função para controlar a exibição do campo de técnico
function setupTecnicoField() {
    const tecnicoSelect = document.getElementById('tecnico');
    const tecnicoOutroInput = document.getElementById('tecnicoOutro');

    function atualizarNames() {
        if (tecnicoSelect.value === 'outro') {
            tecnicoOutroInput.style.display = 'block';
            tecnicoOutroInput.required = true;
            tecnicoSelect.name = '';
            tecnicoOutroInput.name = 'Técnico';
        } else {
            tecnicoOutroInput.style.display = 'none';
            tecnicoOutroInput.required = false;
            tecnicoOutroInput.value = '';
            tecnicoSelect.name = 'Técnico';
            tecnicoOutroInput.name = '';
        }
    }

    tecnicoSelect.addEventListener('change', atualizarNames);
    // Garante o comportamento correto ao carregar a página
    atualizarNames();
}

// Função para configurar os campos formatados
function setupCamposFormatados() {
    const cnpjInput = document.getElementById('cnpjCliente');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function(e) {
            e.target.value = formatarCNPJ(e.target.value);
        });
    }

    const cpfInput = document.getElementById('cpfCliente');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            e.target.value = formatarCPF(e.target.value);
        });
    }

    const campoMaoDeObra = document.getElementById('valorMaoDeObra');
    if (campoMaoDeObra) {
        campoMaoDeObra.addEventListener('input', (e) => {
            e.target.value = formatarValor(e.target.value);
            calcularValorTotal();
        });
    }
}

// Alterna campos PF / PJ
function setupTipoPessoa() {
    const tipoPJ = document.getElementById('tipoPJ');
    const tipoPF = document.getElementById('tipoPF');
    const campoCNPJ = document.getElementById('campoCNPJ');
    const campoCPF = document.getElementById('campoCPF');
    const labelNome = document.getElementById('labelNomeCliente');

    if (!tipoPJ || !tipoPF) return;

    function atualizar() {
        if (tipoPF.checked) {
            campoCNPJ.classList.add('hidden');
            campoCPF.classList.remove('hidden');
            labelNome.innerHTML = 'Nome do Cliente <span class="text-red-500">*</span>';
        } else {
            campoCNPJ.classList.remove('hidden');
            campoCPF.classList.add('hidden');
            labelNome.innerHTML = 'Nome Fantasia (Cliente) <span class="text-red-500">*</span>';
        }
    }

    tipoPJ.addEventListener('change', atualizar);
    tipoPF.addEventListener('change', atualizar);
    atualizar();
}

// Função para limpar o formulário com modal de confirmação
function setupLimparFormulario() {
    const btnLimpar = document.getElementById('limparFormulario');
    const modal = document.getElementById('confirmacaoModal');
    const btnCancelar = document.getElementById('cancelarLimpeza');
    const btnConfirmar = document.getElementById('confirmarLimpeza');

    if (!btnLimpar || !modal || !btnCancelar || !btnConfirmar) return;

    const showModal = () => modal.classList.remove('hidden');
    const hideModal = () => modal.classList.add('hidden');

    btnLimpar.addEventListener('click', showModal);
    btnCancelar.addEventListener('click', hideModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    btnConfirmar.addEventListener('click', () => {
        document.getElementById('relatorioForm').reset();
        
        if (window.limparAssinatura) {
            window.limparAssinatura('tecnico');
            window.limparAssinatura('cliente');
        }
        
        const tecnicoSelect = document.getElementById('tecnico');
        const tecnicoOutroInput = document.getElementById('tecnicoOutro');
        if (tecnicoSelect) tecnicoSelect.value = '';
        if (tecnicoOutroInput) {
            tecnicoOutroInput.style.display = 'none';
            tecnicoOutroInput.value = '';
        }
        
        document.getElementById('equipamentosContainer').innerHTML = '';
        criarLinhaDeEquipamento();

        document.getElementById('materiaisContainer').innerHTML = '';
        criarLinhaDeMaterial();

        window.imagensServico = [];
        document.getElementById('previewFotos').innerHTML = '';

        hideModal();
        
        if (typeof showToast === 'function') {
            showToast('Formulário limpo com sucesso!', true);
        }
    });
}

// --- Lógica de Materiais Dinâmicos e Cálculos ---

function calcularValorTotal() {
    let totalMateriais = 0;
    document.querySelectorAll('.material-row').forEach(row => {
        const subtotalInput = row.querySelector('.material-subtotal');
        totalMateriais += parseValor(subtotalInput.value);
    });

    const totalMateriaisEmCentavos = Math.round(totalMateriais * 100);
    document.getElementById('valorTotalMateriais').value = formatarValor(String(totalMateriaisEmCentavos));

    const maoDeObra = parseValor(document.getElementById('valorMaoDeObra').value);
    const totalServico = totalMateriais + maoDeObra;
    
    const totalServicoEmCentavos = Math.round(totalServico * 100);
    document.getElementById('valorServico').value = formatarValor(String(totalServicoEmCentavos));
}

function criarLinhaDeMaterial() {
    const container = document.getElementById('materiaisContainer');
    const index = container.children.length;
    const div = document.createElement('div');
    div.className = 'material-row grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-gray-100 rounded-lg';
    
    div.innerHTML = `
        <div class="sm:col-span-4">
            <label class="text-xs font-medium text-dark-600">Descrição</label>
            <input type="text" name="MaterialDescricao_${index}" class="mt-1 w-full border-dark-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-dark-400" required>
        </div>
        <div class="sm:col-span-2">
            <label class="text-xs font-medium text-dark-600">Qtd.</label>
            <input type="number" name="MaterialQtd_${index}" class="material-qtd mt-1 w-full border-dark-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-dark-400" value="1" min="1">
        </div>
        <div class="sm:col-span-2">
            <label class="text-xs font-medium text-dark-600">Vlr. Unit.</label>
            <input type="text" name="MaterialValorUnit_${index}" class="material-valor mt-1 w-full border-dark-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-dark-400" placeholder="R$ 0,00">
        </div>
        <div class="sm:col-span-3">
            <label class="text-xs font-medium text-dark-600">Subtotal</label>
            <input type="text" name="MaterialSubtotal_${index}" class="material-subtotal mt-1 w-full border-dark-200 bg-dark-200 rounded-lg px-3 py-2 text-sm font-bold" readonly placeholder="R$ 0,00">
        </div>
        <div class="sm:col-span-1 flex items-end">
            <button type="button" class="remover-material-btn w-full h-10 flex items-center justify-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </div>
    `;

    container.appendChild(div);

    const qtdInput = div.querySelector('.material-qtd');
    const valorUnitInput = div.querySelector('.material-valor');
    const subtotalInput = div.querySelector('.material-subtotal');
    
    const calcularSubtotal = () => {
        const qtd = parseInt(qtdInput.value) || 0;
        const valorUnit = parseValor(valorUnitInput.value);
        const subtotal = qtd * valorUnit;
        
        const subtotalEmCentavos = Math.round(subtotal * 100);
        subtotalInput.value = formatarValor(String(subtotalEmCentavos));
        
        calcularValorTotal();
    };
    
    qtdInput.addEventListener('input', calcularSubtotal);
    valorUnitInput.addEventListener('input', (e) => {
        e.target.value = formatarValor(e.target.value);
        calcularSubtotal();
    });

    div.querySelector('.remover-material-btn').addEventListener('click', () => {
        div.remove();
        calcularValorTotal();
    });

    calcularSubtotal();
}

function setupMateriaisDinamicos() {
    const btnAdicionar = document.getElementById('adicionarMaterialBtn');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', criarLinhaDeMaterial);
    }
    criarLinhaDeMaterial();
}

// --- Equipamentos Dinâmicos ---

function criarLinhaDeEquipamento() {
    const container = document.getElementById('equipamentosContainer');
    const index = container.children.length;
    const div = document.createElement('div');
    div.className = 'equipamento-row grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-gray-100 rounded-lg';

    div.innerHTML = `
        <div class="sm:col-span-7">
            <label class="text-xs font-medium text-dark-600">Equipamento</label>
            <input type="text" class="equip-nome mt-1 w-full border-dark-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-dark-400" placeholder="Ex: Compressor, Condensador...">
        </div>
        <div class="sm:col-span-4">
            <label class="text-xs font-medium text-dark-600">ID / Nº de Série</label>
            <input type="text" class="equip-id mt-1 w-full border-dark-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-dark-400" placeholder="Ex: EQ-001">
        </div>
        <div class="sm:col-span-1 flex items-end">
            <button type="button" class="remover-equipamento-btn w-full h-10 flex items-center justify-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </div>
    `;

    container.appendChild(div);

    div.querySelector('.remover-equipamento-btn').addEventListener('click', () => {
        div.remove();
    });
}

function setupEquipamentosDinamicos() {
    const btn = document.getElementById('adicionarEquipamentoBtn');
    if (btn) btn.addEventListener('click', criarLinhaDeEquipamento);
    criarLinhaDeEquipamento();
}

// Expõe para uso externo (preencher-teste.js)
window.criarLinhaDeEquipamento = criarLinhaDeEquipamento;
window.criarLinhaDeMaterial = criarLinhaDeMaterial;

// Inicializa as funções quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    setupTecnicoField();
    setupTipoPessoa();
    setupCamposFormatados();
    setupEquipamentosDinamicos();
    setupMateriaisDinamicos();
    setupLimparFormulario();
}); 
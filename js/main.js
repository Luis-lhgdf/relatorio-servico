import { formatarDataBR, formatarCNPJ, formatarCPF, formatarValor, parseValor } from './utils.js';

const STORAGE_KEY = 'relatorio_fidelis_dados';

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
    atualizarNames();
}

function setupStatusField() {
    const statusSelect = document.getElementById('status');
    const statusOutroInput = document.getElementById('statusOutro');
    if (!statusSelect || !statusOutroInput) return;

    function atualizar() {
        if (statusSelect.value === 'Outros') {
            statusOutroInput.classList.remove('hidden');
            statusOutroInput.required = true;
        } else {
            statusOutroInput.classList.add('hidden');
            statusOutroInput.required = false;
            statusOutroInput.value = '';
        }
    }

    statusSelect.addEventListener('change', atualizar);
    atualizar();
}

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

function setupTipoPessoa() {
    const tipoPJ = document.getElementById('tipoPJ');
    const tipoPF = document.getElementById('tipoPF');
    const campoCNPJ = document.getElementById('campoCNPJ');
    const campoCPF = document.getElementById('campoCPF');
    const labelNome = document.getElementById('labelNomeCliente');
    const campoNomeSolicitante = document.getElementById('campoNomeSolicitante');

    if (!tipoPJ || !tipoPF) return;

    function atualizar() {
        if (tipoPF.checked) {
            campoCNPJ.classList.add('hidden');
            campoCPF.classList.remove('hidden');
            labelNome.innerHTML = 'Nome do Cliente <span class="text-red-500">*</span>';
            if (campoNomeSolicitante) campoNomeSolicitante.classList.add('hidden');
        } else {
            campoCNPJ.classList.remove('hidden');
            campoCPF.classList.add('hidden');
            labelNome.innerHTML = 'Nome Fantasia (Cliente) <span class="text-red-500">*</span>';
            if (campoNomeSolicitante) campoNomeSolicitante.classList.remove('hidden');
        }
    }

    tipoPJ.addEventListener('change', atualizar);
    tipoPF.addEventListener('change', atualizar);
    atualizar();
}

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
        if (e.target === modal) hideModal();
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

        const statusSelect = document.getElementById('status');
        const statusOutroInput = document.getElementById('statusOutro');
        if (statusSelect) statusSelect.value = '';
        if (statusOutroInput) {
            statusOutroInput.classList.add('hidden');
            statusOutroInput.value = '';
        }

        document.getElementById('equipamentosContainer').innerHTML = '';
        criarLinhaDeEquipamento();

        document.getElementById('materiaisContainer').innerHTML = '';
        criarLinhaDeMaterial();

        window.imagensServico = [];
        window._fotoIdCounter = 0;
        document.getElementById('previewFotos').innerHTML = '';

        limparStorage();
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
        salvarDados();
    });

    calcularSubtotal();
}

function setupMateriaisDinamicos() {
    const btnAdicionar = document.getElementById('adicionarMaterialBtn');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', () => { criarLinhaDeMaterial(); salvarDados(); });
    }
    criarLinhaDeMaterial();
}

// --- Equipamentos Dinâmicos ---

function criarLinhaDeEquipamento() {
    const container = document.getElementById('equipamentosContainer');
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
        salvarDados();
    });
}

function setupEquipamentosDinamicos() {
    const btn = document.getElementById('adicionarEquipamentoBtn');
    if (btn) btn.addEventListener('click', () => { criarLinhaDeEquipamento(); salvarDados(); });
    criarLinhaDeEquipamento();
}

// --- Persistência ---

function salvarDados() {
    try {
        const tipoPessoa = document.querySelector('input[name="tipoPessoa"]:checked')?.value || 'pj';

        const equipamentos = Array.from(document.querySelectorAll('.equipamento-row')).map(row => ({
            nome: row.querySelector('.equip-nome')?.value || '',
            id: row.querySelector('.equip-id')?.value || ''
        }));

        const materiais = Array.from(document.querySelectorAll('.material-row')).map(row => ({
            descricao: row.querySelector('input[name^="MaterialDescricao"]')?.value || '',
            qtd: row.querySelector('input[name^="MaterialQtd"]')?.value || '1',
            valorUnit: row.querySelector('.material-valor')?.value || ''
        }));

        const fotos = (window.imagensServico || []).map(f => ({
            id: f.id,
            dataUrl: f.dataUrl,
            tipo: f.tipo || 'antes'
        }));

        const assinaturaTecnico = document.getElementById('assinaturaTecnico')?.toDataURL() || '';
        const assinaturaCliente = document.getElementById('assinaturaCliente')?.toDataURL() || '';

        const dados = {
            dataServico: document.getElementById('dataServico')?.value || '',
            status: document.getElementById('status')?.value || '',
            statusOutro: document.getElementById('statusOutro')?.value || '',
            tecnico: document.getElementById('tecnico')?.value || '',
            tecnicoOutro: document.getElementById('tecnicoOutro')?.value || '',
            tipoPessoa,
            nomeFantasia: document.getElementById('nomeFantasia')?.value || '',
            cnpjCliente: document.getElementById('cnpjCliente')?.value || '',
            cpfCliente: document.getElementById('cpfCliente')?.value || '',
            nomeSolicitante: document.getElementById('nomeSolicitante')?.value || '',
            defeito: document.getElementById('defeito')?.value || '',
            servico: document.getElementById('servico')?.value || '',
            valorMaoDeObra: document.getElementById('valorMaoDeObra')?.value || '',
            garantia: document.getElementById('garantia')?.value || '',
            nomeAssinanteCliente: document.getElementById('nomeAssinanteCliente')?.value || '',
            mostrarValores: document.getElementById('mostrarValores')?.checked ?? true,
            equipamentos,
            materiais,
            assinaturaTecnico,
            assinaturaCliente,
            fotos,
            fotoIdCounter: window._fotoIdCounter || 0
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    } catch (e) {
        console.warn('Erro ao salvar dados:', e);
    }
}

function limparStorage() {
    localStorage.removeItem(STORAGE_KEY);
}

function carregarDados() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const dados = JSON.parse(raw);

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el && val !== undefined && val !== null && val !== '') {
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        };

        if (dados.dataServico) document.getElementById('dataServico').value = dados.dataServico;

        // Status
        const statusEl = document.getElementById('status');
        if (statusEl && dados.status) {
            statusEl.value = dados.status;
            statusEl.dispatchEvent(new Event('change', { bubbles: true }));
            if (dados.status === 'Outros') setVal('statusOutro', dados.statusOutro);
        }

        // Técnico
        const tecnicoEl = document.getElementById('tecnico');
        if (tecnicoEl && dados.tecnico) {
            tecnicoEl.value = dados.tecnico;
            tecnicoEl.dispatchEvent(new Event('change', { bubbles: true }));
            if (dados.tecnico === 'outro') setVal('tecnicoOutro', dados.tecnicoOutro);
        }

        // Tipo pessoa
        const tipoPJ = document.getElementById('tipoPJ');
        const tipoPF = document.getElementById('tipoPF');
        if (dados.tipoPessoa === 'pf' && tipoPF) {
            tipoPF.checked = true;
            tipoPF.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (tipoPJ) {
            tipoPJ.checked = true;
            tipoPJ.dispatchEvent(new Event('change', { bubbles: true }));
        }

        setVal('nomeFantasia', dados.nomeFantasia);
        setVal('cnpjCliente', dados.cnpjCliente);
        setVal('cpfCliente', dados.cpfCliente);
        setVal('nomeSolicitante', dados.nomeSolicitante);
        setVal('defeito', dados.defeito);
        setVal('servico', dados.servico);
        setVal('garantia', dados.garantia);
        setVal('nomeAssinanteCliente', dados.nomeAssinanteCliente);

        if (dados.valorMaoDeObra) {
            const el = document.getElementById('valorMaoDeObra');
            if (el) { el.value = dados.valorMaoDeObra; calcularValorTotal(); }
        }

        const mostrarValoresEl = document.getElementById('mostrarValores');
        if (mostrarValoresEl && dados.mostrarValores !== undefined) {
            mostrarValoresEl.checked = dados.mostrarValores;
            mostrarValoresEl.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Equipamentos
        if (dados.equipamentos?.length) {
            const container = document.getElementById('equipamentosContainer');
            if (container) {
                container.innerHTML = '';
                dados.equipamentos.forEach(eq => {
                    criarLinhaDeEquipamento();
                    const rows = container.querySelectorAll('.equipamento-row');
                    const last = rows[rows.length - 1];
                    if (last) {
                        last.querySelector('.equip-nome').value = eq.nome;
                        last.querySelector('.equip-id').value = eq.id;
                    }
                });
            }
        }

        // Materiais
        if (dados.materiais?.length) {
            const container = document.getElementById('materiaisContainer');
            if (container) {
                container.innerHTML = '';
                dados.materiais.forEach(mat => {
                    criarLinhaDeMaterial();
                    const rows = container.querySelectorAll('.material-row');
                    const last = rows[rows.length - 1];
                    if (last) {
                        last.querySelector('input[name^="MaterialDescricao"]').value = mat.descricao;
                        const qtdInput = last.querySelector('input[name^="MaterialQtd"]');
                        qtdInput.value = mat.qtd;
                        qtdInput.dispatchEvent(new Event('input', { bubbles: true }));
                        const valorInput = last.querySelector('.material-valor');
                        valorInput.value = mat.valorUnit;
                        valorInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                });
            }
        }

        // Fotos
        if (dados.fotos?.length && typeof window.criarPreviewFoto === 'function') {
            window.imagensServico = [];
            window._fotoIdCounter = dados.fotoIdCounter || 0;
            const previewFotos = document.getElementById('previewFotos');
            if (previewFotos) previewFotos.innerHTML = '';
            dados.fotos.forEach(fotoData => {
                window.imagensServico.push({ id: fotoData.id, dataUrl: fotoData.dataUrl, tipo: fotoData.tipo || 'antes' });
                window.criarPreviewFoto(fotoData.id, fotoData.dataUrl, fotoData.tipo || 'antes');
            });
        }

        // Assinaturas (com pequeno delay para garantir que o canvas está pronto)
        setTimeout(() => {
            if (dados.assinaturaTecnico && typeof window.restaurarAssinatura === 'function') {
                window.restaurarAssinatura('tecnico', dados.assinaturaTecnico);
            }
            if (dados.assinaturaCliente && typeof window.restaurarAssinatura === 'function') {
                window.restaurarAssinatura('cliente', dados.assinaturaCliente);
            }
        }, 100);

    } catch (e) {
        console.warn('Erro ao carregar dados:', e);
    }
}

// Expõe para uso externo
window.criarLinhaDeEquipamento = criarLinhaDeEquipamento;
window.criarLinhaDeMaterial = criarLinhaDeMaterial;
window.salvarDados = salvarDados;

document.addEventListener('DOMContentLoaded', function() {
    setupTecnicoField();
    setupStatusField();
    setupTipoPessoa();
    setupCamposFormatados();
    setupEquipamentosDinamicos();
    setupMateriaisDinamicos();
    setupLimparFormulario();

    carregarDados();

    // Auto-save com debounce
    let saveTimer;
    const agendarSave = () => { clearTimeout(saveTimer); saveTimer = setTimeout(salvarDados, 800); };
    const form = document.getElementById('relatorioForm');
    if (form) {
        form.addEventListener('input', agendarSave);
        form.addEventListener('change', agendarSave);
    }
});

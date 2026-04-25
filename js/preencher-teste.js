// Disponível apenas quando APP_ENV === 'test'.
// Preenche o formulário com dados fictícios para facilitar testes manuais.

(function () {
    if (window.APP_ENV !== 'test') return;

    // ------- dados fictícios -------
    const DADOS = {
        dataServico: new Date().toISOString().split('T')[0],
        status: 'Concluído',
        tecnico: 'Everaldo Fidelis',
        tipoPessoa: 'pj',                         // 'pj' ou 'pf'
        nomeFantasia: 'Supermercado Exemplo Ltda.',
        cnpj: '12345678000190',                   // sem máscara — o input listener aplica
        cpf: '12345678909',
        equipamentos: [
            { nome: 'Câmara Fria — Setor de Frios',        id: 'CF-001' },
            { nome: 'Câmara Fria — Setor de Bebidas',      id: 'CF-002' },
            { nome: 'Compressor Scroll 5 HP',              id: 'CS-042' },
            { nome: 'Condensador Remoto — Área Externa',   id: 'CD-007' },
            { nome: 'Evaporador Duplo Fluxo — Corredor A', id: 'EV-013' },
        ],
        defeito: 'Câmaras frias não atingindo temperatura de operação (meta: -18 °C, medido: -8 °C). Compressor principal apresentando ruído anormal de curto período após partida. Condensador externo com acúmulo severo de sujeira nas aletas, reduzindo eficiência de troca térmica. Cliente relata que os problemas se intensificaram nas últimas 3 semanas.',
        servico: 'Verificado vazamento de gás no evaporador CF-001 — realizado reparo do ponto de vazamento com solda e teste de pressão com nitrogênio. Carga de gás R-404A (800 g) nos dois circuitos. Limpeza química do condensador CD-007 com remoção de 3 kg de resíduos. Troca do filtro secador e visor de líquido. Limpeza das serpentinas dos evaporadores EV-013. Verificação e aperto das conexões elétricas do compressor CS-042. Sistema testado por 1 hora com monitoramento de temperatura — câmaras atingiram -19 °C ao final do teste.',
        materiais: [
            { desc: 'Gás R-404A 800 g',                 qtd: 1, valorDigitos: '28000' }, // R$ 280,00
            { desc: 'Filtro Secador 3/8"',              qtd: 2, valorDigitos: '4500'  }, // R$ 45,00
            { desc: 'Visor de Líquido 3/8"',            qtd: 1, valorDigitos: '3200'  }, // R$ 32,00
            { desc: 'Solda Prata (vareta)',              qtd: 3, valorDigitos: '1200'  }, // R$ 12,00
            { desc: 'Braçadeira Inox 1/2"',             qtd: 4, valorDigitos: '800'   }, // R$ 8,00
            { desc: 'Produto Limpeza Condensador 1 L',  qtd: 1, valorDigitos: '6500'  }, // R$ 65,00
        ],
        valorMaoDeObra: '25000',  // R$ 250,00 (dígitos brutos)
        garantia: '90 dias',
        nomeAssinante: 'João da Silva — Responsável',
    };

    // Dispara input + change para acionar masks e cálculos
    function setVal(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    window.preencherDadosTeste = function () {
        // Data e status
        setVal('dataServico', DADOS.dataServico);
        setVal('status', DADOS.status);

        // Técnico
        const tecnicoSelect = document.getElementById('tecnico');
        if (tecnicoSelect) {
            tecnicoSelect.value = DADOS.tecnico;
            tecnicoSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Tipo de pessoa
        const tipoPJ = document.getElementById('tipoPJ');
        const tipoPF = document.getElementById('tipoPF');
        if (DADOS.tipoPessoa === 'pf' && tipoPF) {
            tipoPF.checked = true;
            tipoPF.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (tipoPJ) {
            tipoPJ.checked = true;
            tipoPJ.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Dados do cliente
        setVal('nomeFantasia', DADOS.nomeFantasia);
        if (DADOS.tipoPessoa === 'pf') {
            setVal('cpfCliente', DADOS.cpf);
        } else {
            setVal('cnpjCliente', DADOS.cnpj);
        }

        // Equipamentos dinâmicos
        const equipContainer = document.getElementById('equipamentosContainer');
        if (equipContainer && window.criarLinhaDeEquipamento) {
            equipContainer.innerHTML = '';
            DADOS.equipamentos.forEach(eq => {
                window.criarLinhaDeEquipamento();
                const rows = equipContainer.querySelectorAll('.equipamento-row');
                const last = rows[rows.length - 1];
                if (last) {
                    last.querySelector('.equip-nome').value = eq.nome;
                    last.querySelector('.equip-id').value = eq.id;
                }
            });
        }

        // Defeito e serviço
        setVal('defeito', DADOS.defeito);
        setVal('servico', DADOS.servico);

        // Materiais dinâmicos
        const matContainer = document.getElementById('materiaisContainer');
        if (matContainer && window.criarLinhaDeMaterial) {
            matContainer.innerHTML = '';
            DADOS.materiais.forEach(mat => {
                window.criarLinhaDeMaterial();
                const rows = matContainer.querySelectorAll('.material-row');
                const last = rows[rows.length - 1];
                if (last) {
                    last.querySelector('input[name^="MaterialDescricao"]').value = mat.desc;
                    const qtdInput = last.querySelector('.material-qtd');
                    qtdInput.value = mat.qtd;
                    qtdInput.dispatchEvent(new Event('input', { bubbles: true }));
                    const valorInput = last.querySelector('.material-valor');
                    valorInput.value = mat.valorDigitos;
                    valorInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        }

        // Mão de obra
        setVal('valorMaoDeObra', DADOS.valorMaoDeObra);

        // Garantia
        setVal('garantia', DADOS.garantia);

        // Nome do assinante
        setVal('nomeAssinanteCliente', DADOS.nomeAssinante);

        if (typeof showToast === 'function') {
            showToast('Formulário preenchido com dados de teste!', true);
        }
    };

    // Cria o botão flutuante somente em modo test
    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.createElement('button');
        btn.id = 'btnPreencherTeste';
        btn.title = 'Preencher com dados fictícios';
        btn.className = 'fixed bottom-6 left-6 z-50 bg-amber-400 hover:bg-amber-500 text-dark-900 font-semibold rounded-full shadow-lg px-4 py-3 flex items-center gap-2 transition-all text-sm';
        btn.innerHTML =
            '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" d="M9 3h6m-3 0v6.5L15.5 14M9 9.5 4.5 14A5 5 0 0 0 14.5 20h0A5 5 0 0 0 19.5 14L15 9.5M9 3H6a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1h-3"/>' +
            '</svg>' +
            'Preencher Teste';
        btn.addEventListener('click', window.preencherDadosTeste);
        document.body.appendChild(btn);
    });
})();

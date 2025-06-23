// Gera PDF fiel ao formulário, campo a campo, com layout responsivo e espaçado
import { formatarDataBR } from './utils.js';

window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('gerarPDF');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Gerando PDF...';
        btn.classList.add('bg-gray-400', 'cursor-not-allowed');
        btn.classList.remove('bg-dark-700', 'hover:bg-dark-900');

        try {
            // Validação dos campos obrigatórios
            const obrigatorios = [
                { id: 'dataServico', nome: 'Data do Serviço' },
                { id: 'status', nome: 'Status' },
                { id: 'nomeFantasia', nome: 'Nome Fantasia (Cliente)' },
                { id: 'cnpjCliente', nome: 'CNPJ (Cliente)' }
            ];

            // Se técnico for outro, validar o campo de texto, senão o select
            if (document.getElementById('tecnico').value === 'outro') {
                obrigatorios.push({ id: 'tecnicoOutro', nome: 'Técnico Responsável' });
            } else {
                obrigatorios.push({ id: 'tecnico', nome: 'Técnico Responsável' });
            }

            for (const campo of obrigatorios) {
                const el = document.getElementById(campo.id);
                if (!el || !el.value.trim()) {
                    if (typeof showToast === 'function') {
                        showToast(`Preencha o campo obrigatório: ${campo.nome}`, false);
                    } else {
                        alert(`Preencha o campo obrigatório: ${campo.nome}`);
                    }
                    btn.disabled = false;
                    btn.textContent = 'Gerar PDF';
                    btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
                    btn.classList.add('bg-dark-700', 'hover:bg-dark-900');
                    return;
                }
            }

            // Validação das assinaturas
            const assinaturaTecnico = document.getElementById('assinaturaTecnico');
            const assinaturaCliente = document.getElementById('assinaturaCliente');

            function isCanvasVazio(canvas) {
                const ctx = canvas.getContext('2d');
                const pixel = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                return !Array.from(pixel).some(channel => channel !== 0);
            }

            if (isCanvasVazio(assinaturaTecnico)) {
                if (typeof showToast === 'function') {
                    showToast('A assinatura do Técnico é obrigatória!', false);
                } else {
                    alert('A assinatura do Técnico é obrigatória!');
                }
                btn.disabled = false;
                btn.textContent = 'Gerar PDF';
                btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
                btn.classList.add('bg-dark-700', 'hover:bg-dark-900');
                return;
            }

            if (isCanvasVazio(assinaturaCliente)) {
                if (typeof showToast === 'function') {
                    showToast('A assinatura do Cliente é obrigatória!', false);
                } else {
                    alert('A assinatura do Cliente é obrigatória!');
                }
                btn.disabled = false;
                btn.textContent = 'Gerar PDF';
                btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
                btn.classList.add('bg-dark-700', 'hover:bg-dark-900');
                return;
            }

            const get = id => document.getElementById(id)?.value || '';
            const obterAssinaturaBase64 = tipo => {
                if (tipo === 'tecnico') return assinaturaTecnico ? assinaturaTecnico.toDataURL('image/png') : null;
                if (tipo === 'cliente') return assinaturaCliente ? assinaturaCliente.toDataURL('image/png') : null;
                return null;
            };

            // Verifica se deve mostrar valores no PDF
            const mostrarValores = document.getElementById('mostrarValores')?.checked ?? true;

            let tecnico = get('tecnico');
            if (tecnico === 'outro') {
                tecnico = get('tecnicoOutro');
            }

            const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            
            // --- Cabeçalho ---
            const pageMarginX = 5;
            const contentWidth = 210 - (2 * pageMarginX);
            let y = 10;
            const headerBoxY = y;
            const headerHeight = 30;

            pdf.setFillColor(0, 0, 0); // Fundo escuro (preto)
            pdf.roundedRect(pageMarginX, headerBoxY, contentWidth, headerHeight, 3, 3, 'F');

            try {
                const img = new Image();
                img.src = 'assets/icon.png';
                await new Promise(res => { img.onload = res; });
                // Logo ligeiramente ajustado para centralização vertical perfeita
                pdf.addImage(img, 'PNG', pageMarginX + 5, headerBoxY + 6, 18, 18);
            } catch (e) {
                console.warn('Logo image could not be loaded:', e);
            }
 
            const textX = pageMarginX + 28;
 
            pdf.setTextColor(255, 255, 255); // Branco
            pdf.setFontSize(18);
            pdf.setFont(undefined, 'bold');
            pdf.text('Refrigeração Fidelis', textX, headerBoxY + 11);
 
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(203, 213, 225); // Cinza claro (gray-300)
            pdf.setFontSize(10);
            // Posição Y e espaçamento entre linhas ajustados para melhor distribuição
            const infoY = headerBoxY + 17;
            const lineHeight = 4.5;
            pdf.text('CNPJ: 45.191.572/0001-33', textX, infoY);
            pdf.text('Tel: (11) 91671-5875', textX, infoY + lineHeight);
            pdf.text('refrigeracaofidelis@outlook.com', textX, infoY + (2 * lineHeight));
 
            y = headerBoxY + headerHeight; // Move o cursor para baixo após o cabeçalho
            // --- Fim do Cabeçalho ---
 
            y += 6;
            pdf.setFontSize(12);
            pdf.setTextColor(30, 30, 30);
            pdf.text('ORDEM DE SERVIÇO', 105, y, { align: 'center' });
            y += 3;

            // --- Seções de Dados com Caixas e Colunas ---
            const boxPadding = 3;
            const fieldLineHeight = 7; // Altura de cada linha de campo (label + value)
            const labelColor = [100, 100, 100]; // Cinza para labels
            const valueColor = [0, 0, 0];       // Preto para valores
            const sectionTitleColor = [50, 50, 50]; // Um pouco mais escuro para títulos de seção

            const drawSectionBox = (title, currentY, boxHeight) => {
                pdf.setDrawColor(180, 180, 180); // Cor da borda
                pdf.roundedRect(pageMarginX, currentY, contentWidth, boxHeight, 3, 3, 'S'); // Box
                pdf.setFontSize(10);
                pdf.setTextColor(sectionTitleColor[0], sectionTitleColor[1], sectionTitleColor[2]);
                pdf.text(title, pageMarginX + 5, currentY + 5); // Título da seção
                pdf.line(pageMarginX + 5, currentY + 6, pageMarginX + contentWidth - 5, currentY + 6); // Linha abaixo do título
                return currentY + 10 + boxPadding; // Retorna o Y para o conteúdo dentro da caixa
            };

            const addField = (label, value, xPos, currentY) => {
                pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
                pdf.text(label + ':', xPos, currentY);
                pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
                
                // Verifica se é um valor monetário e se deve ser ocultado
                const isValorMonetario = label.toLowerCase().includes('valor') || 
                                       value.toString().includes('R$') || 
                                       value.toString().includes(',') && value.toString().match(/\d+,\d{2}/);
                
                const valorExibir = (isValorMonetario && !mostrarValores) ? '---' : String(value);
                pdf.text(valorExibir, xPos + pdf.getStringUnitWidth(label + ':') * pdf.getFontSize() / pdf.internal.scaleFactor + 2, currentY);
            };

            const addMultilineField = (title, value, startX, startY, maxWidth) => {
                pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
                pdf.text(title + ':', startX, startY);
                pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
                const textLines = pdf.splitTextToSize(value, maxWidth);
                pdf.text(textLines, startX, startY + 5); // Adiciona um pequeno padding para o valor
                return (textLines.length * 5) + 5; // Altura baseada no número de linhas + padding
            };


            // Dados da OS (2 colunas)
            let boxY = y;
            // Altura estimada: 2 campos em 1 linha (data/status) + 1 campo em 1 linha (técnico) = 2 linhas
            const osBoxHeight = 2 * fieldLineHeight + (2 * boxPadding) + 7;
            y = drawSectionBox('Dados da OS', boxY, osBoxHeight);

            const col1X = pageMarginX + 5;
            const col2X = pageMarginX + (contentWidth / 2) + 5;

            // Linha 1
            addField('Data', formatarDataBR(get('dataServico')), col1X, y);
            addField('Status', get('status'), col2X, y);
            y += fieldLineHeight;

            // Linha 2
            addField('Técnico Responsável', tecnico, col1X, y);
            // Nenhum campo na segunda coluna nesta linha, para usar apenas a primeira metade
            y += fieldLineHeight;

            y = boxY + osBoxHeight + 5; // Atualiza y para a próxima seção após a caixa da OS


            // Dados do Cliente (2 colunas)
            boxY = y;
            // Altura estimada: 2 campos em 1 linha (nome/cnpj) = 1 linha
            const clientBoxHeight = 1 * fieldLineHeight + (2 * boxPadding) + 7;
            y = drawSectionBox('Dados do Cliente', boxY, clientBoxHeight);

            addField('Nome Fantasia', get('nomeFantasia'), col1X, y);
            addField('CNPJ', get('cnpjCliente'), col2X, y);
            y += fieldLineHeight;

            y = boxY + clientBoxHeight + 5; // Atualiza y para a próxima seção

            // Seção Única para Equipamentos Atendidos, Defeitos Relatados e Serviço Realizado
            boxY = y;
            const equipamento = get('equipamento');
            const defeito = get('defeito');
            const servico = get('servico');

            let combinedContentHeight = 0;
            let currentSectionContentY = boxY + 10 + boxPadding; // Posição Y inicial para o conteúdo desta seção

            // Calcula a altura de cada sub-seção e acumula
            combinedContentHeight += addMultilineField('Equipamentos Atendidos', equipamento, pageMarginX + 5, currentSectionContentY, contentWidth - 10);
            currentSectionContentY += (pdf.splitTextToSize(equipamento, contentWidth - 10).length * 5) + 5; // Atualiza o Y para o próximo item
            pdf.line(pageMarginX + 5, currentSectionContentY - 2, pageMarginX + contentWidth - 5, currentSectionContentY - 2); // Linha divisória
            currentSectionContentY += 5; // Espaço após a linha

            let tempHeight = addMultilineField('Defeitos Relatados', defeito, pageMarginX + 5, currentSectionContentY, contentWidth - 10);
            combinedContentHeight += tempHeight + 5; // Adiciona altura da seção de defeitos + espaço
            currentSectionContentY += tempHeight;
            pdf.line(pageMarginX + 5, currentSectionContentY - 2, pageMarginX + contentWidth - 5, currentSectionContentY - 2); // Linha divisória
            currentSectionContentY += 5;

            tempHeight = addMultilineField('Serviço Realizado', servico, pageMarginX + 5, currentSectionContentY, contentWidth - 10);
            combinedContentHeight += tempHeight + 5; // Adiciona altura da seção de Serviço Realizado + espaço
            // currentSectionContentY += tempHeight; (Não precisa atualizar, pois é o último item)

            // Desenha a caixa para a seção combinada
            y = drawSectionBox('Equipamentos, Defeitos e Serviço Realizado', boxY, combinedContentHeight + (2 * boxPadding) + 7); // +7 para o título e linha
            // Reposiciona o Y para os textos dentro da caixa após desenhar ela
            currentSectionContentY = boxY + 10 + boxPadding;

            // Redesenha os textos DENTRO da caixa, agora que a caixa está desenhada
            addMultilineField('Equipamentos Atendidos', equipamento, pageMarginX + 5, currentSectionContentY, contentWidth - 10);
            currentSectionContentY += (pdf.splitTextToSize(equipamento, contentWidth - 10).length * 5) + 5; // Atualiza o Y para o próximo item
            pdf.line(pageMarginX + 5, currentSectionContentY - 2, pageMarginX + contentWidth - 5, currentSectionContentY - 2); // Linha divisória
            currentSectionContentY += 5; // Espaço após a linha

            addMultilineField('Defeitos Relatados', defeito, pageMarginX + 5, currentSectionContentY, contentWidth - 10);
            currentSectionContentY += (pdf.splitTextToSize(defeito, contentWidth - 10).length * 5) + 5;
            pdf.line(pageMarginX + 5, currentSectionContentY - 2, pageMarginX + contentWidth - 5, currentSectionContentY - 2); // Linha divisória
            currentSectionContentY += 5;

            addMultilineField('Serviço Realizado', servico, pageMarginX + 5, currentSectionContentY, contentWidth - 10);

            y = boxY + combinedContentHeight + (2 * boxPadding) + 7 + 5; // Atualiza y para a próxima seção
            // --- Fim das Seções de Dados com Caixas ---


            // Verifica se há espaço para a tabela ou adiciona nova página
            if (y > 200) { // Ajuste conforme necessário
                pdf.addPage();
                y = 20;
            }

            // --- Tabela de Serviços Prestados / Materiais ---
            y += 5;
            pdf.setFontSize(12);
            pdf.setTextColor(sectionTitleColor[0], sectionTitleColor[1], sectionTitleColor[2]);
            pdf.text('Materiais e Peças Utilizadas', pageMarginX, y); // Título da seção da tabela
            y += 8;

            const tableCols = {
                descricao: { x: pageMarginX + 2, width: 85, align: 'left' },
                quantidade: { x: pageMarginX + 90, width: 25, align: 'center' },
                valorUnitario: { x: pageMarginX + 130, width: 30, align: 'right' }, // Ajustado para mais espaço
                valorTotal: { x: pageMarginX + 175, width: 30, align: 'right' } // Ajustado para mais espaço
            };

            const drawTableHeader = (pdfInstance, currentY) => {
                pdfInstance.setFontSize(9);
                pdfInstance.setFont(undefined, 'bold');
                pdfInstance.setTextColor(80, 80, 80);
                pdfInstance.text('Descrição', tableCols.descricao.x, currentY);
                pdfInstance.text('Quant.', tableCols.quantidade.x, currentY, { align: tableCols.quantidade.align });
                
                // Condiciona a exibição dos cabeçalhos de valores
                if (mostrarValores) {
                    pdfInstance.text('Vlr. Unit.', tableCols.valorUnitario.x, currentY, { align: tableCols.valorUnitario.align });
                    pdfInstance.text('Subtotal', tableCols.valorTotal.x, currentY, { align: tableCols.valorTotal.align });
                }
                
                pdfInstance.setFont(undefined, 'normal');
                currentY += 2;
                pdfInstance.setDrawColor(180, 180, 180);
                pdfInstance.line(pageMarginX, currentY, pageMarginX + contentWidth, currentY);
                currentY += 4;
                return currentY;
            };

            y = drawTableHeader(pdf, y);
            pdf.setFontSize(10); // Definir tamanho da fonte para as linhas da tabela
            pdf.setTextColor(40, 40, 40);

            document.querySelectorAll('.material-row').forEach(row => {
                const descricao = row.querySelector('input[name^="MaterialDescricao"]').value;
                if (!descricao) return;

                const qtd = row.querySelector('input[name^="MaterialQtd"]').value;
                const valorUnit = row.querySelector('input[name^="MaterialValorUnit"]').value;
                const subtotal = row.querySelector('input[name^="MaterialSubtotal"]').value;

                const descriptionLines = pdf.splitTextToSize(descricao, tableCols.descricao.width);
                const lineHeight = Math.max(descriptionLines.length * 4, 6); // Altura mínima da linha para itens na tabela

                if (y + lineHeight > 270) { // Verifica se a linha cabe na página
                    pdf.addPage();
                    y = 20;
                    y = drawTableHeader(pdf, y);
                    pdf.setFontSize(10);
                    pdf.setTextColor(40, 40, 40);
                }

                pdf.text(descriptionLines, tableCols.descricao.x, y);
                pdf.text(qtd, tableCols.quantidade.x, y, { align: tableCols.quantidade.align });
                
                // Condiciona a exibição dos valores monetários
                if (mostrarValores) {
                    pdf.text(valorUnit, tableCols.valorUnitario.x, y, { align: tableCols.valorUnitario.align });
                    pdf.text(subtotal, tableCols.valorTotal.x, y, { align: tableCols.valorTotal.align });
                }
                
                y += lineHeight + 2; // Adiciona um padding entre as linhas
            });
            // --- Fim da Tabela de Materiais ---

            // Totais e Garantia (Em uma única linha)
            if (y > 230) { // Ajuste para garantir espaço para os totais
                pdf.addPage();
                y = 20;
            }

            y += 5;
            pdf.setDrawColor(180, 180, 180);
            pdf.line(pageMarginX, y, pageMarginX + contentWidth, y); // Linha separadora
            y += 8;

            // Definir posições X para cada item na mesma linha
            const itemSpacing = 10; // Espaço entre os grupos de texto
            let currentX = pageMarginX; // Inicia na margem esquerda

            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);

            // Valor Total Materiais
            pdf.text('Valor Total Materiais:', currentX, y);
            currentX += pdf.getStringUnitWidth('Valor Total Materiais:') * pdf.getFontSize() / pdf.internal.scaleFactor + 2;
            pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
            const valorTotalMateriais = mostrarValores ? get('valorTotalMateriais') : '---';
            pdf.text(valorTotalMateriais, currentX, y);
            currentX += pdf.getStringUnitWidth(valorTotalMateriais) * pdf.getFontSize() / pdf.internal.scaleFactor + itemSpacing;

            // Valor da Mão de Obra
            pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
            pdf.text('Valor da Mão de Obra:', currentX, y);
            currentX += pdf.getStringUnitWidth('Valor da Mão de Obra:') * pdf.getFontSize() / pdf.internal.scaleFactor + 2;
            pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
            const valorMaoDeObra = mostrarValores ? get('valorMaoDeObra') : '---';
            pdf.text(valorMaoDeObra, currentX, y);
            currentX += pdf.getStringUnitWidth(valorMaoDeObra) * pdf.getFontSize() / pdf.internal.scaleFactor + itemSpacing * 2; // Maior espaço antes do total geral

            // TOTAL GERAL
            pdf.setFontSize(11);
            pdf.setTextColor(sectionTitleColor[0], sectionTitleColor[1], sectionTitleColor[2]);
            pdf.setFont(undefined, 'bold');
            pdf.text('TOTAL GERAL:', currentX, y);
            currentX += pdf.getStringUnitWidth('TOTAL GERAL:') * pdf.getFontSize() / pdf.internal.scaleFactor + 2;
            pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
            const valorServico = mostrarValores ? get('valorServico') : '---';
            pdf.text(valorServico, currentX, y);
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(10); // Volta ao tamanho da fonte padrão

            y += 8; // Move Y para a próxima linha após os totais

            // Garantia (abaixo dos totais, se houver espaço)
            if (get('garantia')) {
                pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
                pdf.text('Garantia Oferecida:', pageMarginX, y);
                pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
                pdf.text(get('garantia'), pageMarginX + 35, y);
                y += 1; // Espaço para a próxima linha
            }

            // --- Assinaturas ---
            if (y > 245) { // Verifica se há espaço para as assinaturas
                pdf.addPage();
                y = 20;
            }
            y += 10;
            pdf.setDrawColor(220, 220, 220);
            pdf.line(pageMarginX, y, pageMarginX + contentWidth, y);
            y += 12;

            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(sectionTitleColor[0], sectionTitleColor[1], sectionTitleColor[2]);
            pdf.text('Assinatura do Técnico', pageMarginX + (contentWidth / 4), y, { align: 'center' }); // Alinha no centro da 1a metade
            pdf.text('Assinatura do Cliente', pageMarginX + (contentWidth / 4 * 3), y, { align: 'center' }); // Alinha no centro da 2a metade
            y += 2;

            const assinaturaTecnicoImg = obterAssinaturaBase64('tecnico');
            const assinaturaClienteImg = obterAssinaturaBase64('cliente');

            // Adiciona a imagem da assinatura
            const signatureBoxWidth = (contentWidth / 2) - 10; // Largura da caixa de assinatura
            const signatureBoxHeight = 25; // Altura para a caixa de assinatura
            const signaturePadding = 5;

            // Caixa do Técnico
            const tecnicoSigX = pageMarginX + 5;
            pdf.setDrawColor(180, 180, 180);
            pdf.roundedRect(tecnicoSigX, y + signaturePadding, signatureBoxWidth, signatureBoxHeight, 2, 2, 'S');
            if (assinaturaTecnicoImg) {
                pdf.addImage(assinaturaTecnicoImg, 'PNG', tecnicoSigX + 2, y + signaturePadding + 2, signatureBoxWidth - 4, signatureBoxHeight - 4);
            }

            // Caixa do Cliente
            const clienteSigX = pageMarginX + (contentWidth / 2) + 5;
            pdf.roundedRect(clienteSigX, y + signaturePadding, signatureBoxWidth, signatureBoxHeight, 2, 2, 'S');
            if (assinaturaClienteImg) {
                pdf.addImage(assinaturaClienteImg, 'PNG', clienteSigX + 2, y + signaturePadding + 2, signatureBoxWidth - 4, signatureBoxHeight - 4);
            }

            y += signatureBoxHeight + signaturePadding + 5; // Move Y para baixo após as assinaturas

            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(160, 160, 160);
            pdf.text('Gerado automaticamente pelo sistema Refrigeração Fidelis', 105, 295, { align: 'center' }); // Rodapé ajustado para mais próximo do fim da página

            pdf.save('ordem-de-servico.pdf');

        } catch (err) {
            if (typeof showToast === 'function') {
                showToast('Erro ao gerar PDF!', false);
            } else {
                alert('Erro ao gerar PDF!');
            }
            console.error(err);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Gerar PDF';
            btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
            btn.classList.add('bg-dark-700', 'hover:bg-dark-900');
        }
    });
});
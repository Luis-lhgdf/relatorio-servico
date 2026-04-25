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
            const falharValidacao = (el, mensagem) => {
                showToast(mensagem, false);
                btn.disabled = false;
                btn.textContent = 'Gerar PDF';
                btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
                btn.classList.add('bg-dark-700', 'hover:bg-dark-900');

                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('ring-2', 'ring-red-500', 'border-red-500');
                    el.addEventListener('input', function limpar() {
                        el.classList.remove('ring-2', 'ring-red-500', 'border-red-500');
                        el.removeEventListener('input', limpar);
                        el.removeEventListener('change', limpar);
                    });
                    el.addEventListener('change', function limpar() {
                        el.classList.remove('ring-2', 'ring-red-500', 'border-red-500');
                        el.removeEventListener('input', limpar);
                        el.removeEventListener('change', limpar);
                    });
                }
            };

            const obrigatorios = [
                { id: 'dataServico', nome: 'Data do Serviço' },
                { id: 'status', nome: 'Status' },
                { id: 'nomeFantasia', nome: 'Nome Fantasia (Cliente)' }
            ];

            if (document.getElementById('status')?.value === 'Outros') {
                obrigatorios.push({ id: 'statusOutro', nome: 'Status (descrição)' });
            }

            if (document.getElementById('tecnico').value === 'outro') {
                obrigatorios.push({ id: 'tecnicoOutro', nome: 'Técnico Responsável' });
            } else {
                obrigatorios.push({ id: 'tecnico', nome: 'Técnico Responsável' });
            }

            for (const campo of obrigatorios) {
                const el = document.getElementById(campo.id);
                if (!el || !el.value.trim()) {
                    falharValidacao(el, `Preencha o campo obrigatório: ${campo.nome}`);
                    return;
                }
            }

            const assinaturaTecnico = document.getElementById('assinaturaTecnico');
            const assinaturaCliente = document.getElementById('assinaturaCliente');

            function isCanvasVazio(canvas) {
                const ctx = canvas.getContext('2d');
                const pixel = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                return !Array.from(pixel).some(channel => channel !== 0);
            }

            if (isCanvasVazio(assinaturaTecnico)) {
                falharValidacao(assinaturaTecnico, 'A assinatura do Técnico é obrigatória!');
                return;
            }

            if (isCanvasVazio(assinaturaCliente)) {
                falharValidacao(assinaturaCliente, 'A assinatura do Cliente é obrigatória!');
                return;
            }

            const get = id => document.getElementById(id)?.value || '';
            const obterAssinaturaBase64 = tipo => {
                const canvas = tipo === 'tecnico' ? assinaturaTecnico : tipo === 'cliente' ? assinaturaCliente : null;
                if (!canvas) return null;
                const tmp = document.createElement('canvas');
                tmp.width = canvas.width;
                tmp.height = canvas.height;
                const ctx = tmp.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, tmp.width, tmp.height);
                ctx.drawImage(canvas, 0, 0);
                return tmp.toDataURL('image/jpeg', 0.95);
            };

            const mostrarValores = document.getElementById('mostrarValores')?.checked ?? true;

            let tecnico = get('tecnico');
            if (tecnico === 'outro') tecnico = get('tecnicoOutro');

            let statusValue = get('status');
            if (statusValue === 'Outros') statusValue = get('statusOutro') || 'Outros';

            const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            // --- Cabeçalho ---
            const pageMarginX = 5;
            const contentWidth = 210 - (2 * pageMarginX);
            let y = 10;
            const headerBoxY = y;
            const headerHeight = 30;

            pdf.setFillColor(0, 0, 0);
            pdf.roundedRect(pageMarginX, headerBoxY, contentWidth, headerHeight, 3, 3, 'F');

            try {
                const img = new Image();
                img.src = 'assets/icon.png';
                await new Promise(res => { img.onload = res; });
                pdf.addImage(img, 'PNG', pageMarginX + 5, headerBoxY + 6, 18, 18);
            } catch (e) {
                console.warn('Logo image could not be loaded:', e);
            }

            const textX = pageMarginX + 28;

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(18);
            pdf.setFont(undefined, 'bold');
            pdf.text('Refrigeração Fidelis', textX, headerBoxY + 11);

            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(203, 213, 225);
            pdf.setFontSize(10);
            const infoY = headerBoxY + 17;
            const lineHeight = 4.5;
            pdf.text('CNPJ: 45.191.572/0001-33', textX, infoY);
            pdf.text('Tel: (11) 91671-5875', textX, infoY + lineHeight);
            pdf.text('refrigeracaofidelis@outlook.com', textX, infoY + (2 * lineHeight));

            y = headerBoxY + headerHeight;

            y += 6;
            pdf.setFontSize(12);
            pdf.setTextColor(30, 30, 30);
            pdf.text('ORDEM DE SERVIÇO', 105, y, { align: 'center' });
            y += 3;

            const boxPadding = 3;
            const fieldLineHeight = 7;
            const labelColor = [100, 100, 100];
            const valueColor = [0, 0, 0];
            const sectionTitleColor = [50, 50, 50];

            const drawSectionBox = (title, currentY, boxHeight) => {
                pdf.setDrawColor(180, 180, 180);
                pdf.roundedRect(pageMarginX, currentY, contentWidth, boxHeight, 3, 3, 'S');
                pdf.setFontSize(10);
                pdf.setTextColor(sectionTitleColor[0], sectionTitleColor[1], sectionTitleColor[2]);
                pdf.text(title, pageMarginX + 5, currentY + 5);
                pdf.line(pageMarginX + 5, currentY + 6, pageMarginX + contentWidth - 5, currentY + 6);
                return currentY + 10 + boxPadding;
            };

            const addField = (label, value, xPos, currentY) => {
                pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
                pdf.text(label + ':', xPos, currentY);
                pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);

                const isValorMonetario = label.toLowerCase().includes('valor') ||
                                       value.toString().includes('R$') ||
                                       value.toString().includes(',') && value.toString().match(/\d+,\d{2}/);

                const valorExibir = (isValorMonetario && !mostrarValores) ? '---' : String(value);
                pdf.text(valorExibir, xPos + pdf.getStringUnitWidth(label + ':') * pdf.getFontSize() / pdf.internal.scaleFactor + 2, currentY);
            };

            const drawTextBox = (title, text, startY) => {
                const lines = pdf.splitTextToSize(text || '-', contentWidth - 10);
                const contentH = (lines.length * 5) + 5;
                const boxH = contentH + (2 * boxPadding) + 7;
                if (startY + boxH > 275) { pdf.addPage(); startY = 20; }
                const innerY = drawSectionBox(title, startY, boxH);
                pdf.setFontSize(9);
                pdf.setFont(undefined, 'normal');
                pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
                pdf.text(lines, pageMarginX + 5, innerY + 1);
                return startY + boxH + 5;
            };

            // Dados da OS
            let boxY = y;
            const osBoxHeight = 2 * fieldLineHeight + (2 * boxPadding) + 7;
            y = drawSectionBox('Dados da OS', boxY, osBoxHeight);

            const col1X = pageMarginX + 5;
            const col2X = pageMarginX + (contentWidth / 2) + 5;

            addField('Data', formatarDataBR(get('dataServico')), col1X, y);
            addField('Status', statusValue, col2X, y);
            y += fieldLineHeight;

            addField('Técnico Responsável', tecnico, col1X, y);
            y += fieldLineHeight;

            y = boxY + osBoxHeight + 5;

            // Dados do Cliente
            const tipoPF = document.getElementById('tipoPF')?.checked;
            const docLabel = tipoPF ? 'CPF' : 'CNPJ';
            const docValor = tipoPF ? get('cpfCliente') : get('cnpjCliente');
            const nomeLabel = tipoPF ? 'Nome' : 'Nome Fantasia';
            const nomeSolicitante = (!tipoPF) ? (get('nomeSolicitante') || '') : '';

            boxY = y;
            const clientRows = nomeSolicitante ? 2 : 1;
            const clientBoxHeight = clientRows * fieldLineHeight + (2 * boxPadding) + 7;
            y = drawSectionBox('Dados do Cliente', boxY, clientBoxHeight);

            addField(nomeLabel, get('nomeFantasia'), col1X, y);
            addField(docLabel, docValor, col2X, y);
            y += fieldLineHeight;

            if (nomeSolicitante) {
                addField('Nome do Solicitante', nomeSolicitante, col1X, y);
                y += fieldLineHeight;
            }

            y = boxY + clientBoxHeight + 5;

            // Equipamentos Atendidos — formato texto
            const equipamentosRows = [];
            document.querySelectorAll('.equipamento-row').forEach(row => {
                const nome = row.querySelector('.equip-nome')?.value?.trim() || '';
                const id   = row.querySelector('.equip-id')?.value?.trim()   || '';
                if (nome || id) equipamentosRows.push({ nome, id });
            });

            const equipText = equipamentosRows.length > 0
                ? equipamentosRows.map(eq => {
                    const partes = [eq.nome, eq.id].filter(Boolean);
                    return partes.join(' - ') || '-';
                }).join('\n')
                : '-';

            // Caixa combinada: Equipamentos, Defeitos e Serviço Realizado
            {
                const equipLines   = pdf.splitTextToSize(equipText, contentWidth - 10);
                const defeitoLines = pdf.splitTextToSize(get('defeito') || '-', contentWidth - 10);
                const servicoLines = pdf.splitTextToSize(get('servico') || '-', contentWidth - 10);

                // Mesma lógica do original: label + 5mm gap + linhas*5mm por sub-seção
                // Separadores avançam +5mm (linha desenhada a -2mm do cursor)
                const secH = lines => (lines.length * 5) + 5;
                const sepAdv = 5;
                const innerContentH = secH(equipLines) + sepAdv + secH(defeitoLines) + sepAdv + secH(servicoLines);
                const boxH = 10 + boxPadding + innerContentH + boxPadding;

                if (y + boxH > 275) { pdf.addPage(); y = 20; }

                let iy = drawSectionBox('Equipamentos, Defeitos e Serviço Realizado', y, boxH);

                const drawSubSection = (label, lines, drawSep) => {
                    pdf.setFontSize(9);
                    pdf.setFont(undefined, 'bold');
                    pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
                    pdf.text(label, pageMarginX + 5, iy);
                    pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
                    pdf.text(lines, pageMarginX + 5, iy + 5);
                    iy += secH(lines);
                    if (drawSep) {
                        pdf.setDrawColor(220, 220, 220);
                        pdf.line(pageMarginX + 5, iy - 2, pageMarginX + contentWidth - 5, iy - 2);
                        iy += sepAdv;
                    }
                };

                drawSubSection('Equipamentos Atendidos:', equipLines,   true);
                drawSubSection('Defeitos Relatados:',     defeitoLines, true);
                drawSubSection('Serviço Realizado:',      servicoLines, false);

                y += boxH + 5;
            }

            // Tabela de Materiais
            if (y > 200) { pdf.addPage(); y = 20; }

            y += 5;
            pdf.setFontSize(12);
            pdf.setTextColor(sectionTitleColor[0], sectionTitleColor[1], sectionTitleColor[2]);
            pdf.text('Materiais e Peças Utilizadas', pageMarginX, y);
            y += 8;

            const tableCols = {
                descricao: { x: pageMarginX + 2, width: 85, align: 'left' },
                quantidade: { x: pageMarginX + 90, width: 25, align: 'center' },
                valorUnitario: { x: pageMarginX + 130, width: 30, align: 'right' },
                valorTotal: { x: pageMarginX + 175, width: 30, align: 'right' }
            };

            const drawTableHeader = (pdfInstance, currentY) => {
                pdfInstance.setFontSize(9);
                pdfInstance.setFont(undefined, 'bold');
                pdfInstance.setTextColor(80, 80, 80);
                pdfInstance.text('Descrição', tableCols.descricao.x, currentY);
                pdfInstance.text('Quant.', tableCols.quantidade.x, currentY, { align: tableCols.quantidade.align });

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
            pdf.setFontSize(10);
            pdf.setTextColor(40, 40, 40);

            document.querySelectorAll('.material-row').forEach(row => {
                const descricao = row.querySelector('input[name^="MaterialDescricao"]').value;
                if (!descricao) return;

                const qtd = row.querySelector('input[name^="MaterialQtd"]').value;
                const valorUnit = row.querySelector('input[name^="MaterialValorUnit"]').value;
                const subtotal = row.querySelector('input[name^="MaterialSubtotal"]').value;

                const descriptionLines = pdf.splitTextToSize(descricao, tableCols.descricao.width);
                const rowLineHeight = Math.max(descriptionLines.length * 4, 6);

                if (y + rowLineHeight > 270) {
                    pdf.addPage();
                    y = 20;
                    y = drawTableHeader(pdf, y);
                    pdf.setFontSize(10);
                    pdf.setTextColor(40, 40, 40);
                }

                pdf.text(descriptionLines, tableCols.descricao.x, y);
                pdf.text(qtd, tableCols.quantidade.x, y, { align: tableCols.quantidade.align });

                if (mostrarValores) {
                    pdf.text(valorUnit, tableCols.valorUnitario.x, y, { align: tableCols.valorUnitario.align });
                    pdf.text(subtotal, tableCols.valorTotal.x, y, { align: tableCols.valorTotal.align });
                }

                y += rowLineHeight + 2;
            });

            // Totais e Garantia
            if (y > 230) { pdf.addPage(); y = 20; }

            y += 5;
            pdf.setDrawColor(180, 180, 180);
            pdf.line(pageMarginX, y, pageMarginX + contentWidth, y);
            y += 8;

            const itemSpacing = 10;
            let currentX = pageMarginX;

            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);

            pdf.text('Valor Total Materiais:', currentX, y);
            currentX += pdf.getStringUnitWidth('Valor Total Materiais:') * pdf.getFontSize() / pdf.internal.scaleFactor + 2;
            pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
            const valorTotalMateriais = mostrarValores ? get('valorTotalMateriais') : '---';
            pdf.text(valorTotalMateriais, currentX, y);
            currentX += pdf.getStringUnitWidth(valorTotalMateriais) * pdf.getFontSize() / pdf.internal.scaleFactor + itemSpacing;

            pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
            pdf.text('Valor da Mão de Obra:', currentX, y);
            currentX += pdf.getStringUnitWidth('Valor da Mão de Obra:') * pdf.getFontSize() / pdf.internal.scaleFactor + 2;
            pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
            const valorMaoDeObra = mostrarValores ? get('valorMaoDeObra') : '---';
            pdf.text(valorMaoDeObra, currentX, y);
            currentX += pdf.getStringUnitWidth(valorMaoDeObra) * pdf.getFontSize() / pdf.internal.scaleFactor + itemSpacing * 2;

            pdf.setFontSize(11);
            pdf.setTextColor(sectionTitleColor[0], sectionTitleColor[1], sectionTitleColor[2]);
            pdf.setFont(undefined, 'bold');
            pdf.text('TOTAL GERAL:', currentX, y);
            currentX += pdf.getStringUnitWidth('TOTAL GERAL:') * pdf.getFontSize() / pdf.internal.scaleFactor + 2;
            pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
            const valorServico = mostrarValores ? get('valorServico') : '---';
            pdf.text(valorServico, currentX, y);
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(10);

            y += 8;

            if (get('garantia')) {
                pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
                pdf.text('Garantia Oferecida:', pageMarginX, y);
                pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
                pdf.text(get('garantia'), pageMarginX + 35, y);
                y += 8;
            }

            // --- Assinaturas ---
            // Espaço necessário: ~50mm (linha sep + headers + caixa + nome)
            const nomeAssinante = get('nomeAssinanteCliente');
            const espacoNecessario = 50;
            if (y + espacoNecessario > 282) {
                pdf.addPage();
                y = 20;
            }
            y += 6;
            pdf.setDrawColor(220, 220, 220);
            pdf.line(pageMarginX, y, pageMarginX + contentWidth, y);
            y += 8;

            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(sectionTitleColor[0], sectionTitleColor[1], sectionTitleColor[2]);
            pdf.text('Assinatura do Técnico', pageMarginX + (contentWidth / 4), y, { align: 'center' });
            pdf.text('Assinatura do Cliente', pageMarginX + (contentWidth / 4 * 3), y, { align: 'center' });
            y += 2;

            const assinaturaTecnicoImg = obterAssinaturaBase64('tecnico');
            const assinaturaClienteImg = obterAssinaturaBase64('cliente');

            const signatureBoxWidth = (contentWidth / 2) - 10;
            const signatureBoxHeight = 22;
            const signaturePadding = 4;

            const tecnicoSigX = pageMarginX + 5;
            pdf.setDrawColor(180, 180, 180);
            pdf.roundedRect(tecnicoSigX, y + signaturePadding, signatureBoxWidth, signatureBoxHeight, 2, 2, 'S');
            if (assinaturaTecnicoImg) {
                pdf.addImage(assinaturaTecnicoImg, 'JPEG', tecnicoSigX + 2, y + signaturePadding + 2, signatureBoxWidth - 4, signatureBoxHeight - 4);
            }

            const clienteSigX = pageMarginX + (contentWidth / 2) + 5;
            pdf.roundedRect(clienteSigX, y + signaturePadding, signatureBoxWidth, signatureBoxHeight, 2, 2, 'S');
            if (assinaturaClienteImg) {
                pdf.addImage(assinaturaClienteImg, 'JPEG', clienteSigX + 2, y + signaturePadding + 2, signatureBoxWidth - 4, signatureBoxHeight - 4);
            }

            if (nomeAssinante) {
                pdf.setFontSize(9);
                pdf.setFont(undefined, 'normal');
                pdf.setTextColor(80, 80, 80);
                pdf.text(nomeAssinante, clienteSigX + signatureBoxWidth / 2, y + signaturePadding + signatureBoxHeight + 4, { align: 'center' });
            }

            y += signatureBoxHeight + signaturePadding + 8;

            // --- Fotos do Serviço ---
            const fotos = window.imagensServico || [];
            if (fotos.length > 0) {
                const fotoGap    = 6;
                const fotoWidth  = (contentWidth - fotoGap) / 2;
                const fotoHeight = fotoWidth * 0.72;
                const labelH     = 8;

                // Espaço mínimo: título (8mm) + cabeçalhos das colunas (7mm) + uma linha de fotos
                const espacoMinimoFotos = 15 + fotoHeight + fotoGap;
                let fy;
                if (y + espacoMinimoFotos > 282) {
                    pdf.addPage();
                    fy = 15;
                } else {
                    fy = y + 8;
                }

                pdf.setFontSize(12);
                pdf.setFont(undefined, 'bold');
                pdf.setTextColor(sectionTitleColor[0], sectionTitleColor[1], sectionTitleColor[2]);
                pdf.text('Fotos do Serviço', 105, fy, { align: 'center' });
                fy += 8;

                const fxAntes  = pageMarginX;
                const fxDepois = pageMarginX + fotoWidth + fotoGap;

                const drawColHeaders = (startY) => {
                    pdf.setFontSize(10);
                    pdf.setFont(undefined, 'bold');
                    pdf.setTextColor(30, 100, 200);
                    pdf.text('ANTES', fxAntes + fotoWidth / 2, startY, { align: 'center' });
                    pdf.setTextColor(200, 90, 20);
                    pdf.text('DEPOIS', fxDepois + fotoWidth / 2, startY, { align: 'center' });
                    pdf.setFont(undefined, 'normal');
                    return startY + 7;
                };

                fy = drawColHeaders(fy);

                const fotosAntes  = fotos.filter(f => (f.tipo || 'antes') === 'antes');
                const fotosDepois = fotos.filter(f => f.tipo === 'depois');
                const totalRows   = Math.max(fotosAntes.length, fotosDepois.length);

                const borderAntes  = [30, 100, 200];
                const borderDepois = [200, 90, 20];

                const drawFotoNaColuna = async (foto, fx, fy, tipo) => {
                    const [r, g, b] = tipo === 'depois' ? borderDepois : borderAntes;
                    if (!foto) {
                        pdf.setFillColor(250, 250, 250);
                        pdf.setDrawColor(r, g, b);
                        pdf.setLineWidth(0.6);
                        pdf.rect(fx, fy, fotoWidth, fotoHeight, 'FD');
                        pdf.setLineWidth(0.2);
                        return;
                    }
                    try {
                        const tmpImg = new Image();
                        await new Promise(res => { tmpImg.onload = res; tmpImg.src = foto.dataUrl; });
                        const ratio    = tmpImg.naturalWidth / tmpImg.naturalHeight;
                        const boxRatio = fotoWidth / fotoHeight;
                        let iw, ih, ix, iy;
                        if (ratio >= boxRatio) {
                            iw = fotoWidth; ih = iw / ratio;
                            ix = fx; iy = fy + (fotoHeight - ih) / 2;
                        } else {
                            ih = fotoHeight; iw = ih * ratio;
                            ix = fx + (fotoWidth - iw) / 2; iy = fy;
                        }
                        pdf.setFillColor(245, 245, 245);
                        pdf.rect(fx, fy, fotoWidth, fotoHeight, 'F');
                        pdf.addImage(foto.dataUrl, 'JPEG', ix, iy, iw, ih);
                        pdf.setDrawColor(r, g, b);
                        pdf.setLineWidth(0.6);
                        pdf.rect(fx, fy, fotoWidth, fotoHeight, 'S');
                        pdf.setLineWidth(0.2);
                    } catch (e) {
                        console.warn('Erro ao adicionar foto:', e);
                    }
                };

                for (let i = 0; i < totalRows; i++) {
                    if (fy + fotoHeight + labelH > 282) {
                        pdf.addPage();
                        fy = 15;
                        fy = drawColHeaders(fy);
                    }

                    await drawFotoNaColuna(fotosAntes[i],  fxAntes,  fy, 'antes');
                    await drawFotoNaColuna(fotosDepois[i], fxDepois, fy, 'depois');

                    fy += fotoHeight + fotoGap;
                }
            }

            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(160, 160, 160);
            pdf.text('Gerado automaticamente pelo sistema Refrigeração Fidelis', 105, 295, { align: 'center' });

            pdf.save('ordem-de-servico.pdf');

        } catch (err) {
            showToast('Erro ao gerar PDF!', false);
            console.error(err);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Gerar PDF';
            btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
            btn.classList.add('bg-dark-700', 'hover:bg-dark-900');
        }
    });
});

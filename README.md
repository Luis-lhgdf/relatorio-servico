# Relatório de Serviço — Refrigeração Fidelis

Sistema web completo para geração, envio e impressão de ordens de serviço, com layout moderno, integração com Google Sheets e geração de PDF fiel ao frontend.

---

## Funcionalidades

- **Formulário de Ordem de Serviço Completo**  
  - Campos para dados do cliente, técnico, serviço, materiais, valores, garantia e assinaturas.
  - **Campos obrigatórios:** Data do Serviço, Status, Técnico Responsável, Nome Fantasia (Cliente), CNPJ (Cliente) e assinaturas.
  - Máscara automática para CNPJ e valores em reais.
  - Exibição condicional do campo "Outro Técnico".
  - Opção de exibir ou ocultar valores de material/serviço no PDF.

- **Sistema de Materiais Dinâmicos**  
  - Adição/remoção dinâmica de materiais com campos para descrição, quantidade, valor unitário.
  - Cálculo automático de subtotais e valor total dos materiais.
  - Campo para valor da mão de obra com cálculo automático do valor total do serviço.
  - Tabela organizada no PDF com cabeçalho repetido em novas páginas.

- **Assinatura Digital**  
  - Captura de assinatura do técnico e do cliente via canvas.
  - Botão para limpar assinatura individual.
  - Assinaturas incluídas no PDF gerado.

- **Controles de Formulário**  
  - Botão "Gerar PDF" para download do documento.
  - Botão "Salvar" para envio ao Google Sheets (formulário não é limpo automaticamente).
  - Botão "Limpar Formulário" com modal de confirmação moderno.
  - Layout responsivo dos botões (lado a lado no desktop, empilhados no mobile).

- **Envio para Google Sheets**  
  - Envio dos dados do formulário diretamente para uma planilha via Google Apps Script.
  - Consolidação dos materiais em uma única célula com quebras de linha.
  - Feedback visual (toast) de sucesso ou erro no envio.
  - Mapeamento correto de todos os campos incluindo valores calculados.

- **Geração de PDF Profissional**  
  - PDF gerado campo a campo, com layout fiel ao frontend.
  - Cabeçalho com logo, dados da empresa e divisórias.
  - Tabela de materiais com quebras de linha automáticas para descrições longas.
  - Inclusão das assinaturas no PDF.
  - Respeita as opções de exibição dos valores.
  - Cabeçalho da tabela repetido em novas páginas.

- **Ferramentas de Desenvolvimento**  
  - Script de preenchimento automático para testes (`js/preencher-teste.js`).
  - Botão flutuante para preencher o formulário com dados de exemplo.
  - Cálculos automáticos disparados ao preencher dados de teste.

- **Visual Moderno e Responsivo**  
  - Interface responsiva e bonita com Tailwind CSS.
  - Layout limpo, campos bem espaçados e feedback visual.
  - Modal de confirmação moderno para limpeza do formulário.
  - Cores consistentes: verde para salvar, vermelho para limpar.

---

## Estrutura dos Arquivos

```
index.html           # Página principal com o formulário completo
dist/tailwind.css    # Estilos gerados pelo Tailwind
assets/
  ├─ icon.png        # Ícone da empresa
  └─ logo.png        # Logo da empresa
js/
  ├─ main.js         # Lógica do formulário, máscaras, campos dinâmicos e cálculos
  ├─ assinatura.js   # Captura e limpeza das assinaturas
  ├─ gerarPDF.js     # Geração do PDF fiel ao frontend
  ├─ toast-form.js   # Feedback visual (toast) no envio do formulário
  ├─ utils.js        # Funções utilitárias (formatação de data, CNPJ, valores)
  └─ preencher-teste.js # Script para preenchimento automático de testes
tailwind.config.js   # Configuração do Tailwind CSS
package.json         # Dependências do projeto
README-appscript.md  # Documentação do Google Apps Script para integração com Sheets
```

---

## Como Usar

1. **Instale as dependências do Tailwind (se for customizar o CSS):**
   ```bash
   npm install
   npm run build
   ```

2. **Abra o `index.html` em seu navegador.**

3. **Preencha o formulário:**
   - Os campos obrigatórios estão marcados com *.
   - Para outro técnico, selecione "Outro" e preencha o nome.
   - Adicione materiais clicando em "Adicionar Material" e preencha os campos.
   - Os cálculos são feitos automaticamente.
   - Assine nos campos de assinatura.

4. **Gere o PDF:**
   - Clique em **Gerar PDF** para baixar um PDF fiel ao formulário preenchido, incluindo as assinaturas.

5. **Envie a ordem:**
   - Clique em **Salvar** para enviar para o Google Sheets.
   - Um toast de sucesso/erro será exibido.
   - O formulário não será limpo automaticamente.

6. **Limpe o formulário (opcional):**
   - Clique em **Limpar Formulário** para limpar todos os campos.
   - Confirme a ação no modal que aparecerá.

7. **Para testes rápidos:**
   - Use o botão flutuante "Preencher Teste" para popular o formulário com dados de exemplo.

---

## Observações Técnicas

- **Google Sheets:**  
  O envio é feito via POST para um Google Apps Script configurado como endpoint web. Os nomes dos campos do formulário devem ser idênticos aos nomes das colunas da planilha. Os materiais são consolidados em uma única célula com quebras de linha.

- **PDF:**  
  O PDF é gerado usando [jsPDF](https://github.com/parallax/jsPDF). Não é feito print da tela, mas sim montagem manual campo a campo, garantindo fidelidade e responsividade. A tabela de materiais suporta quebras de linha automáticas e cabeçalho repetido.

- **Cálculos:**  
  Todos os cálculos (subtotais, totais) são feitos automaticamente com arredondamento para evitar imprecisões de ponto flutuante.

- **Utilitários:**  
  Funções de formatação de data, CNPJ e valores estão em `js/utils.js` e são usadas em todo o projeto.

---

## Customização

- **Paleta de cores:**  
  Editável em `tailwind.config.js`.
- **Campos do formulário:**  
  Editáveis em `index.html`.
- **Funções utilitárias:**  
  Adicione novas funções em `js/utils.js` conforme necessário.
- **Dados de teste:**  
  Modifique `js/preencher-teste.js` para alterar os dados de exemplo.

---

## Licença

Projeto de uso interno para Refrigeração Fidelis.  

---

## Documentação da Integração com Google Sheets

Consulte o arquivo [`README-appscript.md`](./README-appscript.md) para ver o passo a passo de configuração do Google Apps Script e integração com o formulário HTML.  

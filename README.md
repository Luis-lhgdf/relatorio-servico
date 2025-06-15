# Relatório de Serviço — Refrigeração Fidelis

Sistema web para geração, envio e impressão de ordens de serviço, com layout moderno, integração com Google Sheets e geração de PDF fiel ao frontend.

---

## Funcionalidades

- **Formulário de Ordem de Serviço**  
  - Campos para dados do cliente, serviço, materiais, valores, garantia e assinaturas.
  - Máscara automática para CNPJ e valores em reais.
  - Exibição condicional do campo "Outro Técnico".
  - Opção de exibir ou ocultar valores de material/serviço no PDF.

- **Assinatura Digital**  
  - Captura de assinatura do técnico e do cliente via canvas.
  - Botão para limpar assinatura.

- **Envio para Google Sheets**  
  - Envio dos dados do formulário diretamente para uma planilha via Google Apps Script.
  - Feedback visual (toast) de sucesso ou erro no envio.

- **Geração de PDF**  
  - PDF gerado campo a campo, com layout fiel ao frontend.
  - Cabeçalho com logo, dados da empresa e divisórias.
  - Inclusão das assinaturas no PDF.
  - Respeita as opções de exibição dos valores.

- **Visual Moderno**  
  - Interface responsiva e bonita com Tailwind CSS.
  - Layout limpo, campos bem espaçados e feedback visual.

---

## Estrutura dos Arquivos

```
index.html           # Página principal com o formulário
dist/tailwind.css    # Estilos gerados pelo Tailwind
assets/icon.png      # Logo da empresa
js/
  ├─ main.js         # Lógica do formulário, máscaras e campos dinâmicos
  ├─ assinatura.js   # Captura e limpeza das assinaturas
  ├─ gerarPDF.js     # Geração do PDF fiel ao frontend
  ├─ toast-form.js   # Feedback visual (toast) no envio do formulário
  └─ utils.js        # Funções utilitárias (formatação de data, CNPJ, valores)
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
   - Assine nos campos de assinatura.

4. **Envie a ordem:**
   - Clique em **Salvar** para enviar para o Google Sheets.
   - Um toast de sucesso/erro será exibido.

5. **Gere o PDF:**
   - Clique em **Gerar PDF** para baixar um PDF fiel ao formulário preenchido, incluindo as assinaturas.

---

## Observações Técnicas

- **Google Sheets:**  
  O envio é feito via POST para um Google Apps Script configurado como endpoint web. Os nomes dos campos do formulário devem ser idênticos aos nomes das colunas da planilha.

- **PDF:**  
  O PDF é gerado usando [jsPDF](https://github.com/parallax/jsPDF). Não é feito print da tela, mas sim montagem manual campo a campo, garantindo fidelidade e responsividade.

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

---

## Licença

Projeto de uso interno para Refrigeração Fidelis.  

---

## Documentação da Integração com Google Sheets

Consulte o arquivo [`README-appscript.md`](./README-appscript.md) para ver o passo a passo de configuração do Google Apps Script e integração com o formulário HTML.  

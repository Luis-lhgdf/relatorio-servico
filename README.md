# Relatório de Serviço — Refrigeração Fidelis

Sistema web para geração de ordens de serviço em PDF, com layout moderno e responsivo.

---

## Funcionalidades

- **Formulário de Ordem de Serviço Completo**
  - Campos para dados do cliente, técnico, equipamentos, defeito, serviço, materiais, valores, garantia e assinaturas.
  - Campos obrigatórios: Data do Serviço, Status, Técnico Responsável e Nome do Cliente.
  - Toggle **Pessoa Física / Jurídica** — exibe CNPJ (PJ) ou CPF (PF) com máscara automática.
  - Exibição condicional do campo "Outro Técnico".
  - Opção de exibir ou ocultar valores monetários no PDF.

- **Equipamentos Dinâmicos**
  - Adição/remoção de equipamentos com campos para nome e ID/número de série.
  - Aparece no PDF como lista organizada dentro da seção de serviço.

- **Materiais e Peças Dinâmicos**
  - Adição/remoção de itens com descrição, quantidade e valor unitário.
  - Subtotais e total calculados automaticamente.
  - Campo para mão de obra com cálculo do valor total do serviço.

- **Fotos do Serviço**
  - Upload de múltiplas fotos com compressão automática.
  - Cada foto recebe um label **Antes** ou **Depois** que aparece no PDF.
  - Fotos exibidas em grade no PDF com proporção preservada.

- **Assinatura Digital**
  - Captura de assinatura do técnico e do cliente via canvas.
  - Campo de nome legível do assinante (cliente), útil quando a assinatura é rubrica.

- **Geração de PDF**
  - PDF gerado campo a campo (sem print da tela) usando [jsPDF](https://github.com/parallax/jsPDF).
  - Cabeçalho com logo e dados da empresa.
  - Seção de equipamentos, defeito e serviço em bloco organizado.
  - Tabela de materiais com cabeçalho repetido em novas páginas.
  - Assinaturas e nome do assinante incluídos.
  - Fotos em página dedicada com label Antes/Depois.

- **Modo de Teste**
  - Variável de ambiente em `js/config.js` controla o ambiente (`test` / `prod`).
  - Em `test`, exibe um botão flutuante amarelo que preenche o formulário com dados fictícios.

---

## Estrutura dos Arquivos

```
index.html              # Página principal com o formulário completo
assets/
  ├─ icon.png           # Ícone da empresa
  └─ favicon.ico        # Favicon
js/
  ├─ config.js          # Variável de ambiente (APP_ENV: 'test' | 'prod')
  ├─ main.js            # Lógica do formulário, máscaras, campos dinâmicos e cálculos
  ├─ assinatura.js      # Captura e limpeza das assinaturas via canvas
  ├─ gerarPDF.js        # Geração do PDF campo a campo
  ├─ preencher-teste.js # Dados fictícios para teste (ativo somente em APP_ENV=test)
  └─ utils.js           # Funções utilitárias (data, CNPJ, CPF, valores)
```

---

## Como Usar

1. **Abra o `index.html` em um servidor local** (ex: Live Server no VS Code ou `npx serve .`).

   > Não abra como `file://` — os módulos ES (`type="module"`) exigem servidor HTTP.

2. **Preencha o formulário:**
   - Selecione o tipo de cliente (PJ ou PF) antes de preencher os dados do cliente.
   - Adicione equipamentos com nome e ID clicando em **Adicionar Equipamento**.
   - Adicione materiais clicando em **Adicionar Material ou Peça**.
   - Assine nos campos de assinatura e, se necessário, preencha o nome do assinante.
   - Adicione fotos e marque cada uma como **Antes** ou **Depois**.

3. **Gere o PDF:**
   - Clique em **Gerar PDF** para baixar a ordem de serviço em PDF.

4. **Limpe o formulário:**
   - Clique em **Limpar Formulário** e confirme no modal.

5. **Testes rápidos:**
   - Com `APP_ENV = 'test'` em `js/config.js`, um botão amarelo **Preencher Teste** aparece no canto inferior esquerdo.
   - Clique nele para popular o formulário com dados fictícios e testar a geração de PDF.

---

## Configuração de Ambiente

Edite `js/config.js`:

```javascript
// 'test' → ativa botão de preenchimento fictício
// 'prod' → desativa todos os recursos de teste
window.APP_ENV = 'test';
```

Antes de colocar em produção, altere para `'prod'`.

---

## Observações Técnicas

- **PDF:** gerado com [jsPDF](https://github.com/parallax/jsPDF) — montagem manual campo a campo, sem captura de tela.
- **Cálculos:** subtotais e totais com arredondamento via `Math.round` para evitar imprecisões de ponto flutuante.
- **Fotos:** comprimidas para no máximo 1400 px e qualidade JPEG 80% antes de serem armazenadas em memória.
- **Módulos:** `main.js` e `gerarPDF.js` usam `type="module"` — requerem servidor HTTP.

---

## Customização

- **Dados de teste:** edite o objeto `DADOS` em `js/preencher-teste.js`.
- **Técnicos disponíveis:** edite as `<option>` do `<select id="tecnico">` em `index.html`.
- **Dados da empresa (cabeçalho do PDF):** edite diretamente em `js/gerarPDF.js` na seção `Cabeçalho`.

---

## Licença

Projeto de uso interno para Refrigeração Fidelis.

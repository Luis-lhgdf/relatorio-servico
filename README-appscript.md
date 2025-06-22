# Google Apps Script — Recebimento de Formulário HTML no Google Sheets

Este script permite receber dados de um formulário HTML diretamente em uma planilha Google Sheets, de forma simples, segura e sem backend próprio.

> **Baseado e adaptado do repositório:**  
> [levinunnink/html-form-to-google-sheet](https://github.com/levinunnink/html-form-to-google-sheet)  
> Créditos ao autor original pela base do método!

---

## Como funciona

- O formulário HTML do seu sistema envia os dados via POST para a URL do Apps Script publicado como Web App.
- O Apps Script recebe os dados, faz o mapeamento automático para as colunas da planilha e salva cada submissão em uma nova linha.
- O campo especial `"Data de Envio"` (se existir na planilha) é preenchido automaticamente com a data/hora do envio.
- **Campos especiais:** Os materiais são consolidados em uma única célula com quebras de linha, e os valores calculados são enviados corretamente.

---

## Código utilizado

```javascript
const sheetName = 'paginaum'; // nome da aba na planilha
const scriptProp = PropertiesService.getScriptProperties();

function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    const sheet = doc.getSheetByName(sheetName);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]; // primeira linha com os nomes das colunas
    const nextRow = sheet.getLastRow() + 1;

    const newRow = headers.map(header => {
      return header === 'Data de Envio' ? new Date() : e.parameter[header] || '';
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', row: nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

---

## Estrutura da Planilha

A planilha deve ter as seguintes colunas na primeira linha (nomes exatos dos campos do formulário):

### Campos Básicos
- `Data do Serviço`
- `Status`
- `Técnico Responsável`
- `Outro Técnico` (opcional)
- `Nome Fantasia`
- `CNPJ`
- `Endereço`
- `Telefone`
- `Email`
- `Descrição do Serviço`
- `Observações`
- `Garantia`

### Campos de Materiais e Valores
- `Materiais` (consolidado com quebras de linha)
- `Valor Total dos Materiais`
- `Valor da Mão de Obra`
- `Valor Total do Serviço`

### Campos de Assinatura
- `Assinatura Técnico`
- `Assinatura Cliente`

### Campo Automático
- `Data de Envio` (preenchido automaticamente)

---

## Passos para configurar

1. **Crie uma nova planilha no Google Sheets.**
2. **Na primeira linha, coloque os nomes das colunas** exatamente iguais aos atributos `name` dos campos do seu formulário HTML.  
   > ⚠️ **Atenção:** Não mude os nomes das colunas depois de integrar, pois isso pode causar erro no recebimento dos dados!
3. **No menu da planilha, vá em `Extensões > Apps Script`.**
4. **Cole o código acima** no editor, substituindo qualquer código existente.
5. **Altere o valor de `sheetName`** para o nome da aba onde deseja salvar os dados (exemplo: `'paginaum'`).
6. **Salve o projeto.**
7. **Execute a função `initialSetup`** manualmente no editor para autorizar o script.
8. **Publique como Web App:**  
   - Clique em `Implantar > Nova implantação`.
   - Selecione `Web App`.
   - Defina quem pode acessar: `Qualquer pessoa`.
   - Copie a URL gerada.
9. **No seu formulário HTML, defina o atributo `action` do `<form>` para a URL do Web App.**

---

## Observações importantes

- **Os nomes dos campos do formulário (`name="..."`) DEVEM ser idênticos aos nomes das colunas da planilha.**
- Se mudar o nome de uma coluna, atualize também o formulário, ou os dados não serão salvos corretamente.
- O campo `"Data de Envio"` (se existir) será preenchido automaticamente com a data/hora do envio.
- **Materiais:** O campo `"Materiais"` receberá todos os materiais consolidados em uma única célula, separados por quebras de linha.
- **Valores calculados:** Os campos `"Valor Total dos Materiais"` e `"Valor Total do Serviço"` são calculados automaticamente no formulário e enviados como valores numéricos.

---

## Exemplo de Estrutura da Planilha

| Data do Serviço | Status | Técnico Responsável | Nome Fantasia | CNPJ | Materiais | Valor Total dos Materiais | Valor da Mão de Obra | Valor Total do Serviço | Assinatura Técnico | Assinatura Cliente | Data de Envio |
|-----------------|--------|-------------------|---------------|------|-----------|---------------------------|---------------------|------------------------|-------------------|-------------------|---------------|
| 15/12/2024      | Concluído | João Silva | Empresa ABC | 12.345.678/0001-90 | 1x Compressor R$ 500,00\n2x Gás R$ 100,00 | 700,00 | 200,00 | 900,00 | [assinatura] | [assinatura] | 15/12/2024 14:30 |

---

## Créditos

Baseado em: [levinunnink/html-form-to-google-sheet](https://github.com/levinunnink/html-form-to-google-sheet)  
Adaptação para integração com sistema de Ordem de Serviço — Refrigeração Fidelis.


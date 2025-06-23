// Funções utilitárias globais

/**
 * Formata uma data ISO (yyyy-mm-dd) para o padrão brasileiro (dd/mm/aaaa)
 * @param {string} dataISO
 * @returns {string}
 */
export function formatarDataBR(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  if (!ano || !mes || !dia) return dataISO;
  return `${dia}/${mes}/${ano}`;
}

/**
 * Formata um CNPJ para o padrão XX.XXX.XXX/XXXX-XX
 * @param {string} cnpj
 * @returns {string}
 */
export function formatarCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  cnpj = cnpj.substring(0, 14);
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

/**
 * Formata um valor para moeda brasileira (R$)
 * @param {string} valor
 * @returns {string}
 */
export function formatarValor(valor) {
  valor = valor.replace(/\D/g, '');
  if (!valor) return '';
  const numero = parseInt(valor);
  if (isNaN(numero)) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero / 100);
}

/**
 * Converte um valor em formato de moeda (R$ 1.234,56) para um número (1234.56)
 * @param {string} valorFormatado
 * @returns {number}
 */
export function parseValor(valorFormatado) {
    if (typeof valorFormatado !== 'string' || !valorFormatado) return 0;
    const numeroLimpo = valorFormatado.replace(/\D/g, '');
    if (numeroLimpo === '') return 0;
    return parseFloat(numeroLimpo) / 100;
} 
/**
 * Identidad legal del sitio, usada por los cuatro documentos
 * (aviso legal, privacidad, cookies y términos de uso).
 * Centralizada aquí para que los cuatro textos coincidan siempre.
 * El domicilio particular no se publica a petición del titular.
 */
export const LEGAL_INFO = {
  titular: "Mateo Fernández Prieto",
  nif: "71572693M",
  phone: "644 869 070",
  email: "a.prieto@maristasccv.es",
} as const;

export const IDENTIFICATION = `Titular: ${LEGAL_INFO.titular}. NIF: ${LEGAL_INFO.nif}. Teléfono: ${LEGAL_INFO.phone}. Correo electrónico: ${LEGAL_INFO.email}.`;

export const CONTACT_CHANNELS = `Puede dirigirse a ${LEGAL_INFO.titular} escribiendo a ${LEGAL_INFO.email} o llamando al teléfono ${LEGAL_INFO.phone}.`;

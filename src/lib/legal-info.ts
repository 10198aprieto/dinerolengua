/**
 * Identidad legal del sitio, usada por los cuatro documentos
 * (aviso legal, privacidad, cookies y términos de uso).
 * Centralizada aquí para que los cuatro textos coincidan siempre.
 */
export const LEGAL_INFO = {
  titular: "Mateo Fernández Prieto",
  nif: "71572693M",
  address: "C/ San Quince, nº 7, Chalet, 47195 — Arroyo de la Encomienda (Valladolid), España",
  phone: "644 869 070",
  email: "a.prieto@maristasccv.es",
} as const;

export const IDENTIFICATION = `Titular: ${LEGAL_INFO.titular}. NIF: ${LEGAL_INFO.nif}. Domicilio: ${LEGAL_INFO.address}. Teléfono: ${LEGAL_INFO.phone}. Correo electrónico: ${LEGAL_INFO.email}.`;

export const CONTACT_CHANNELS = `Puede dirigirse a ${LEGAL_INFO.titular} escribiendo a ${LEGAL_INFO.email}, llamando al teléfono ${LEGAL_INFO.phone} o por correo postal a ${LEGAL_INFO.address}.`;

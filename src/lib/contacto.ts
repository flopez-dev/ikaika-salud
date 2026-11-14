/**
 * Datos de contacto de la clínica, sacados de https://ikaikasalud.es/ (noviembre de 2026).
 * Diferencias a propósito con esa web: el enlace de WhatsApp lleva el prefijo 34 (sin él,
 * wa.me no abre el chat) y el email es el del dominio real (el pie de la web antigua
 * apuntaba a ikaika.es).
 */
const telefonoE164 = '+34614024609';

export const contacto = {
  telefono: '614 02 46 09',
  telefonoHref: `tel:${telefonoE164}`,
  whatsappHref: `https://wa.me/34614024609?text=${encodeURIComponent('¡Hola! Quiero hacer una consulta.')}`,
  email: 'contacto@ikaikasalud.es',
  calle: 'C/ Alcalde Conangla, 24',
  codigoPostal: '02001',
  ciudad: 'Albacete',
  mapaHref:
    'https://www.google.com/maps/search/?api=1&query=Ikaika+Salud+C%2F+Alcalde+Conangla+24+02001+Albacete',
  instagram: 'https://www.instagram.com/ikaika.salud/',
  facebook: 'https://www.facebook.com/profile.php?id=61580357907938',
} as const;

export const horario = [
  { dias: 'Lunes a jueves', horas: 'de 9:00 a 14:00 y de 16:00 a 21:00' },
  { dias: 'Viernes', horas: 'de 9:00 a 14:00 y de 16:00 a 19:00' },
  { dias: 'Sábados y domingos', horas: 'Cerrado' },
] as const;

/** Formato schema.org de `horario`, para el JSON-LD. */
export const horarioSchema = [
  'Mo-Th 09:00-14:00',
  'Mo-Th 16:00-21:00',
  'Fr 09:00-14:00',
  'Fr 16:00-19:00',
];

export const aparcamiento = [
  'Zona azul del Parque Lineal, frente a la clínica',
  'Parking APK2 Plaza del Sembrador',
  'Parking del Centro Comercial Albacenter',
] as const;

/** Las páginas legales siguen en la web actual hasta que se migren. */
export const legales = [
  { texto: 'Aviso legal', href: 'https://ikaikasalud.es/aviso-legal' },
  { texto: 'Política de privacidad', href: 'https://ikaikasalud.es/politica-de-privacidad' },
  { texto: 'Política de cookies', href: 'https://ikaikasalud.es/politica-de-cookies' },
] as const;

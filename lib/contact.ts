export const WHATSAPP_NUMBER = '59899919535';

export const whatsappUrl = (text?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

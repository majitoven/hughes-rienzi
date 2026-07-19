import { BlogPost } from './types';

const PENDING = 'Contenido pendiente — se va a completar desde el panel de administración.';

export const FALLBACK_BLOG: BlogPost[] = [
  {
    id: 'estudio-rocio-nicola',
    title: 'Estudio Rocío Nicola',
    date: '05 Mayo, 2026',
    coverImage: '/images/charlas/rocio.png',
    gallery: ['/images/charlas/rocio.png'],
    content: PENDING,
    order: 0,
    createdAt: null,
  },
  {
    id: 'nicolas-rienzi-adolfo-hughes',
    title: 'Nicolás Rienzi y Adolfo Hughes',
    date: '24 Octubre, 2025',
    coverImage: '/images/charlas/nicolas.png',
    gallery: ['/images/charlas/nicolas.png'],
    content: PENDING,
    order: 1,
    createdAt: null,
  },
  {
    id: 'paula-piquet',
    title: 'Paula Piquet',
    date: '22 Julio, 2025',
    coverImage: '/images/charlas/paula.png',
    gallery: ['/images/charlas/paula.png'],
    content: PENDING,
    order: 2,
    createdAt: null,
  },
  {
    id: 'lorena-ponce-de-leon',
    title: 'Lorena Ponce de León',
    date: '05 Mayo, 2026',
    coverImage: '/images/charlas/lorena.png',
    gallery: ['/images/charlas/lorena.png'],
    content: PENDING,
    order: 3,
    createdAt: null,
  },
  {
    id: 'ines-chicurel-martha-zerbino',
    title: 'Inés Chicurel y Ma. Martha Zerbino',
    date: '24 Octubre, 2025',
    coverImage: '/images/charlas/ines.png',
    gallery: ['/images/charlas/ines.png'],
    content: PENDING,
    order: 4,
    createdAt: null,
  },
];

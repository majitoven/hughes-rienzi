import { Project } from './types';

const STUB_CONTENT = (label: string, image: string): Project['content'] => [
  { id: '1', type: 'images', images: [image] },
  { id: '2', type: 'text', headline: `${label}`, body: 'Contenido en preparación — se va a completar desde el panel de administración.' },
];

export const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'ona',
    title: 'ONA',
    subtitle: 'Lake Village',
    location: 'Lago La Caleta',
    coverImage: '/images/home/ona.png',
    heroImage: '/images/proyectos/hero.png',
    logoImage: '/images/proyectos/ona-logo.png',
    status: 'Construcción',
    externalUrl: 'https://hr.com.uy',
    facts: [
      { id: '1', label: 'Ubicación', value: 'Lago La Caleta' },
      { id: '2', label: 'Estado', value: 'En construcción' },
      { id: '3', label: 'Año', value: '2026' },
      { id: '4', label: 'Terreno', value: '10.200 m²' },
      { id: '5', label: 'Unidades', value: 'A confirmar' },
    ],
    content: [
      { id: '1', type: 'images', images: ['/images/proyectos/ona-laguna-02.png'] },
      {
        id: '2', type: 'text',
        headline: 'El arte de vivir en armonía con la naturaleza.',
        body: 'Diseñamos un proyecto respetuoso del entorno y fuimos más allá: el paisaje se convierte en el hilo que lo conecta todo.\n\nONA es un desarrollo en el que arquitectura y naturaleza conviven a través de un diseño paisajístico pensado como experiencia. Sus cuatro bloques están armónicamente dispuestos sobre un parque de más de 10.000 m2, donde los recorridos peatonales, las especies nativas y las texturas del suelo crean una geografía común entre el lago, el bosque y la arquitectura.',
      },
      { id: '3', type: 'images', images: ['/images/proyectos/ona-pil-01.png', '/images/proyectos/ona-interior-bosque.png'] },
      {
        id: '4', type: 'phrase',
        headline: 'Vista al lago. Vista al bosque. Vista a la vida que estás buscando.',
      },
      {
        id: '5', type: 'amenities', amenitiesColumns: 2,
        amenities: [
          'Playa y muelle sobre el lago', 'Plaza para niños', 'Piscina abierta con solárium', 'Piscina cerrada',
          'Gimnasio', 'Cowork', 'Barbacoa con parrillero', 'Clubhouse gourmet c/sala de pool',
        ],
      },
      { id: '6', type: 'gallery', images: ['/images/proyectos/ona-int-laguna.png', '/images/proyectos/ona-ame-01.png', '/images/proyectos/ona-pil-exterior.png'] },
    ],
    featured: true,
    featuredSize: 'large',
    order: 0,
    createdAt: null,
  },
  {
    id: 'angra', title: 'Angra', subtitle: 'Lake Homes', location: 'Carrasco Este',
    coverImage: '/images/home/angra.png',
    logoImage: '/images/proyectos/angra-logo.png',
    facts: [], content: STUB_CONTENT('Angra Lake Homes', '/images/home/angra.png'),
    featured: true, featuredSize: 'small', order: 1, createdAt: null,
  },
  {
    id: 'quo', title: 'Quo', subtitle: 'Park Homes', location: 'Parque Miramar',
    coverImage: '/images/home/QUO.png',
    logoImage: '/images/proyectos/quo-logo.png',
    facts: [], content: STUB_CONTENT('Quo Park Homes', '/images/home/QUO.png'),
    featured: true, featuredSize: 'small', order: 2, createdAt: null,
  },
  {
    id: 'duet', title: 'Duet', subtitle: 'Park Homes', location: 'Parques, Barrio Jardín',
    coverImage: '/images/home/DUET.png',
    logoImage: '/images/proyectos/duet-logo.png',
    facts: [], content: STUB_CONTENT('Duet Park Homes', '/images/home/DUET.png'),
    featured: true, featuredSize: 'small', order: 3, createdAt: null,
  },
  {
    id: 'laq', title: 'Laq', subtitle: 'Lake Homes', location: '',
    coverImage: '/images/home/LAQ.png',
    logoImage: '/images/proyectos/laq-logo.png',
    facts: [], content: STUB_CONTENT('Laq Lake Homes', '/images/home/LAQ.png'),
    featured: true, featuredSize: 'small', order: 4, createdAt: null,
  },
  {
    id: 'la-candelaria', title: 'La Candelaria', subtitle: 'Pueblo Jardín', location: 'Barrios Privados de Carrasco',
    coverImage: '/images/home/barriocandelaria.png',
    heroImage: '/images/home/barriocandelaria.png',
    logoImage: '/images/home/logocandelaria.png',
    facts: [], content: STUB_CONTENT('La Candelaria · Pueblo Jardín', '/images/home/barriocandelaria.png'),
    featured: true, featuredSize: 'large', order: 5, createdAt: null,
  },
];

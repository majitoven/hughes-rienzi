import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'serviceAccount.json'), 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const STUB_CONTENT = (coverImage) => [
  { id: '1', type: 'images', images: [coverImage] },
  { id: '2', type: 'text', headline: 'Lorem ipsum dolor sit amet consectetur.', body: LOREM },
  { id: '3', type: 'images', images: [coverImage, coverImage] },
  { id: '4', type: 'text', headline: 'Ut enim ad minim veniam quis nostrud.', body: LOREM },
  { id: '5', type: 'images', images: [coverImage] },
];

const STUB_FACTS = (ubicacion) => [
  { id: '1', label: 'Ubicación', value: ubicacion || 'A confirmar' },
  { id: '2', label: 'Estado', value: 'A confirmar' },
  { id: '3', label: 'Año', value: 'A confirmar' },
  { id: '4', label: 'Cantidad de unidades', value: 'A confirmar' },
  { id: '5', label: 'Tipología', value: 'A confirmar' },
  { id: '6', label: 'Terreno', value: 'A confirmar' },
];

const now = Timestamp.now();

const projects = [
  {
    id: 'ona',
    title: 'ONA',
    subtitle: 'Lake Village',
    location: 'Lago La Caleta',
    coverImage: '/images/home/ona.png',
    heroImage: '/images/proyectos/hero.png',
    logoImage: '/images/proyectos/ona-logo.png',
    status: 'Construcción',
    facts: [
      { id: '1', label: 'Ubicación', value: 'Lago La Caleta' },
      { id: '2', label: 'Estado', value: 'En construcción' },
      { id: '3', label: 'Año', value: '2026' },
      { id: '4', label: 'Cantidad de unidades', value: 'A confirmar' },
      { id: '5', label: 'Tipología', value: '1 a 4 dormitorios' },
      { id: '6', label: 'Terreno', value: '10.200 m²' },
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
        id: '4', type: 'text',
        headline: 'Vista al lago. Vista al bosque. Vista a la vida que estás buscando.',
        body: 'Ya no se trata de vegetación cautivante, sino de una naturaleza que se extiende, se enmarca, te guía y te invita a permanecer. Canteros envolventes, árboles de gran porte, mobiliario urbano integrado y una piscina junto al lago componen una escena serena y vibrante a la vez.\n\nUn parque vivo. Un nuevo lenguaje para vincular paisaje y ciudad desde el suelo hacia el cielo.',
      },
      { id: '5', type: 'images', images: ['/images/proyectos/ona-int-laguna.png'] },
      { id: '6', type: 'images', images: ['/images/proyectos/ona-ame-01.png', '/images/proyectos/ona-pil-exterior.png'] },
    ],
    featured: true,
    featuredSize: 'large',
    order: 0,
  },
  {
    id: 'angra', title: 'Angra', subtitle: 'Lake Homes', location: 'Carrasco Este',
    coverImage: '/images/home/angra.png',
    logoImage: '/images/proyectos/angra-logo.png',
    facts: STUB_FACTS('Carrasco Este'),
    content: STUB_CONTENT('/images/home/angra.png'),
    featured: true, featuredSize: 'small', order: 1,
  },
  {
    id: 'quo', title: 'Quo', subtitle: 'Park Homes', location: 'Parque Miramar',
    coverImage: '/images/home/QUO.png',
    logoImage: '/images/proyectos/quo-logo.png',
    facts: STUB_FACTS('Parque Miramar'),
    content: STUB_CONTENT('/images/home/QUO.png'),
    featured: true, featuredSize: 'small', order: 2,
  },
  {
    id: 'duet', title: 'Duet', subtitle: 'Park Homes', location: 'Parques, Barrio Jardín',
    coverImage: '/images/home/DUET.png',
    logoImage: '/images/proyectos/duet-logo.png',
    facts: STUB_FACTS('Parques, Barrio Jardín'),
    content: STUB_CONTENT('/images/home/DUET.png'),
    featured: true, featuredSize: 'small', order: 3,
  },
  {
    id: 'laq', title: 'Laq', subtitle: 'Lake Homes', location: 'A confirmar',
    coverImage: '/images/home/LAQ.png',
    logoImage: '/images/proyectos/laq-logo.png',
    facts: STUB_FACTS(''),
    content: STUB_CONTENT('/images/home/LAQ.png'),
    featured: true, featuredSize: 'small', order: 4,
  },
  {
    id: 'la-candelaria', title: 'La Candelaria', subtitle: 'Pueblo Jardín', location: 'Barrios Privados de Carrasco',
    coverImage: '/images/home/barriocandelaria.png',
    heroImage: '/images/home/barriocandelaria.png',
    logoImage: '/images/home/logocandelaria.png',
    facts: STUB_FACTS('Barrios Privados de Carrasco'),
    content: STUB_CONTENT('/images/home/barriocandelaria.png'),
    featured: true, featuredSize: 'large', order: 5,
  },
];

const blogPosts = [
  { id: 'estudio-rocio-nicola', title: 'Estudio Rocío Nicola', date: '05 Mayo, 2026', coverImage: '/images/charlas/rocio.png', gallery: ['/images/charlas/rocio.png', '/images/charlas/rocio.png'], content: LOREM, order: 0 },
  { id: 'nicolas-rienzi-adolfo-hughes', title: 'Nicolás Rienzi y Adolfo Hughes', date: '24 Octubre, 2025', coverImage: '/images/charlas/nicolas.png', gallery: ['/images/charlas/nicolas.png', '/images/charlas/nicolas.png'], content: LOREM, order: 1 },
  { id: 'paula-piquet', title: 'Paula Piquet', date: '22 Julio, 2025', coverImage: '/images/charlas/paula.png', gallery: ['/images/charlas/paula.png', '/images/charlas/paula.png'], content: LOREM, order: 2 },
  { id: 'lorena-ponce-de-leon', title: 'Lorena Ponce de León', date: '05 Mayo, 2026', coverImage: '/images/charlas/lorena.png', gallery: ['/images/charlas/lorena.png', '/images/charlas/lorena.png'], content: LOREM, order: 3 },
  { id: 'ines-chicurel-martha-zerbino', title: 'Inés Chicurel y Ma. Martha Zerbino', date: '24 Octubre, 2025', coverImage: '/images/charlas/ines.png', gallery: ['/images/charlas/ines.png', '/images/charlas/ines.png'], content: LOREM, order: 4 },
];

async function seed() {
  console.log(`Seeding ${projects.length} projects into "hughes-rienzi"...`);
  for (const p of projects) {
    const { id, ...data } = p;
    await db.collection('projects').doc(id).set({ ...data, createdAt: now, updatedAt: null });
    console.log(`  ✓ projects/${id}`);
  }

  console.log(`Seeding ${blogPosts.length} blog posts...`);
  for (const b of blogPosts) {
    const { id, ...data } = b;
    await db.collection('blogPosts').doc(id).set({ ...data, createdAt: now, updatedAt: null });
    console.log(`  ✓ blogPosts/${id}`);
  }

  console.log('Done.');
}

seed().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });

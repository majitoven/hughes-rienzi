export interface Project {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  coverImage: string;
  heroImage?: string;
  logoImage?: string;
  status?: string;
  externalUrl?: string;
  facts: ProjectFact[];
  content: ProjectBlock[];
  featured: boolean;
  featuredSize?: 'large' | 'small';
  createdAt: any;
  updatedAt?: any;
  order?: number;
}

export interface ProjectFact {
  id: string;
  label: string;
  value: string;
}

export interface ProjectBlock {
  id: string;
  type: 'text' | 'images' | 'phrase' | 'amenities' | 'gallery';
  headline?: string;
  subtitle?: string;
  body?: string;
  images?: string[];
  amenities?: string[];
  amenitiesColumns?: 1 | 2;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  coverImage: string;
  gallery: string[];
  content: string;
  externalUrl?: string;
  createdAt: any;
  updatedAt?: any;
  order?: number;
}

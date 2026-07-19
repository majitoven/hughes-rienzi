export interface Project {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  coverImage: string;
  heroImage?: string;
  logoImage?: string;
  status?: string;
  facts: ProjectFact[];
  content: ProjectBlock[];
  featured: boolean;
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
  type: 'text' | 'images';
  headline?: string;
  body?: string;
  images?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  coverImage: string;
  gallery: string[];
  content: string;
  createdAt: any;
  updatedAt?: any;
  order?: number;
}

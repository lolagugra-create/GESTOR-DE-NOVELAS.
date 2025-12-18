
export interface Novel {
  id: string;
  title: string;
  createdAt: number;
  lastModified: number;
}

export interface Part {
  id: string;
  name: string;
  order: number;
  createdAt: number;
}

export interface Chapter {
  id: string;
  partId: string;
  title: string;
  content: string;
  order: number;
  createdAt: number;
  linkedCharacters?: string[];
  linkedLocations?: string[];
}

export interface Idea {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: number;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  // Físico
  edad?: string;
  genero?: string;
  sexualidad?: string;
  origen?: string;
  raza?: string;
  residencia?: string;
  ojos?: string;
  pelo?: string;
  piel?: string;
  constitucion?: string;
  altura?: string;
  vestimenta?: string;
  otrosFisico?: string;
  // Psicología
  ideologia?: string;
  cualidades?: string;
  defectos?: string;
  manias?: string;
  miedos?: string;
  motivaciones?: string;
  ama?: string;
  detesta?: string;
  // Social/Relaciones
  familia?: string;
  amigos?: string;
  amor?: string;
  enemigos?: string;
  otrosRelaciones?: string;
  trasfondo?: string;
  notas?: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
}

export interface Relation {
  id: string;
  from: string;
  to: string;
  type: string;
  intensity: string;
}

export interface TrashItem {
  id: string;
  originalCollection: string;
  data: any;
  deletedAt: number;
}

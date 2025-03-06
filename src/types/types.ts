
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ImageData {
  id: string;
  url: string;
  thumbnail?: string;
  caption?: string;
}

export interface ProjectType {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  createdAt: number;
  updatedAt?: number;
}

export interface ObservationType {
  id: string;
  projectId: string;
  date: string;
  species: string;
  location: string;
  coordinates: Coordinates;
  images: ImageData[];
  habitat?: string;
  weather?: string;
  notes?: string;
  tags?: string[];
  createdAt: number;
  updatedAt?: number;
}

export interface FormValues {
  species: string;
  habitat: string;
  weather: string;
  notes: string;
  tags: string;
  location: string;
}

export interface ProjectFormValues {
  name: string;
  description: string;
}


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

export interface ObservationType {
  id: string;
  date: string;
  species: string;
  location: string;
  coordinates: Coordinates;
  images: ImageData[];
  habitat?: string;
  weather?: string;
  notes?: string;
  tags?: string[];
  createdAt: number; // timestamp
  updatedAt?: number; // timestamp
}

export interface FormValues {
  species: string;
  habitat: string;
  weather: string;
  notes: string;
  tags: string;
  location: string;
}

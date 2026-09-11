export interface Crop {
  id: number;
  name: string;
  variety: string;
  category: string;
  cycle: number;
  temperature: string;
  water: string;
  color: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

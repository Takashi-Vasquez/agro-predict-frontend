export interface TrainingField {
  id: number;
  fieldKey: string;
  label: string;
  fieldType: string;
  category: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  options?: string[];
  isRequired: boolean;
  orderIndex: number;
}

export interface UploadErrorRecord {
  row: number;
  error: string;
  [fieldKey: string]: string | number | undefined; // columnas dinámicas del Excel
  // crop?: string;
  // variety?: string;
  // campaign?: string;
  // location?: string;
  // soil_type?: string;
  // temperature?: string;
  // humidity?: string;
  // ph_soil?: string;
  // nitrogen?: string;
  // phosphorus?: string;
  // potassium?: string;
  // rainfall?: string;
  // irrigation_type?: string;
  // target_yield?: string;
}

export interface UploadResult {
  total: number;
  has_errors: boolean;
  records?: UploadErrorRecord[];
  batch_id?: string;
  saved?: number;
}

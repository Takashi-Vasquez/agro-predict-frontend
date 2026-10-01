export interface TrainingRecordsDto {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  phSoil: number;
  rainfall: number;
  targetYield: number;
}

export interface TrainingRecords extends TrainingRecordsDto {
  id: number;
  userId: number;
  cropId: any;
  campaign: any;
  location: any;
  extraData: any;
  source: string;
  rowNumber: any;
  importBatchId: any;
  errorMessage: any;
  status: string;
  createdAt: string;
}

export type UpdateTrainingRecordsDto = Partial<TrainingRecordsDto>;

export interface UploadTrainingRecordsResult {
  has_errors: boolean;
  records: Array<{ row: number; error?: string; data: Record<string, unknown> }>;
  // ajusta según lo que realmente devuelva process_upload
}

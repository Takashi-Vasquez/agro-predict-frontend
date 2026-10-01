export interface TrainingRecordsDto {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  phSoil: number;
  rainfall: number;
}

export interface TrainingRecords extends TrainingRecordsDto {
  id: number;
  userId: number;
  cropId: any;
  campaign: any;
  location: any;
  extraData: any;
  targetYield: number;
  source: string;
  rowNumber: any;
  importBatchId: any;
  errorMessage: any;
  status: string;
  createdAt: string;
}

export type UpdateTrainingRecordsDto = Partial<TrainingRecordsDto>;

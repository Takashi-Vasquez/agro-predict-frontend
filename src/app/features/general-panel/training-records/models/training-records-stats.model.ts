export interface CandidateMetrics {
  r2: number;
  mae: number;
  rmse: number;
}

export interface TrainingRecordModelVersion {
  version: string;
  trainedAt: string | null;
  dataFrom: string | null;
  dataTo: string | null;
  metrics: CandidateMetrics | null;
}

export interface TrainingRecordsStats {
  modelVersion: TrainingRecordModelVersion | null;
  total: number;
  countCrop: number;
  countCampaign: number;
  isAllTrained: boolean;
}

import { StatusCampaignType } from '../../../core/constants';

export interface CampaignDto {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  cropId: number;
  status: StatusCampaignType;
}

export interface Campaign extends CampaignDto {
  id: number;
  userId: number;
  cropName: string;
  createdAt: string;
  updatedAt: string;
}

export type UpdateCampaignDto = Partial<CampaignDto>;

import type { SnackPlanSummary } from '@snacks/shared';

export type OfficeSnackPlanModel = SnackPlanSummary;

export interface OfficeSnackPlanInput {
  name: string;
  participantCount: number;
  budgetTargetCents: number;
  preferredCategories?: string[];
  preferredTags?: string[];
}

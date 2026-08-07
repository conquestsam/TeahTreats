import type { BundlePreviewSummary } from '@snacks/shared';

export type CustomerBundlePreviewModel = BundlePreviewSummary;

export interface CustomerBundlePreviewInput {
  participantCount?: number;
  budgetTargetCents?: number;
}

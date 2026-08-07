import type { GroupCartSummary } from '@snacks/shared';

export type GroupCartModel = GroupCartSummary;

export interface CreateGroupCartInput {
  name: string;
}

export interface AddGroupCartItemInput {
  skuId: string;
  quantity: number;
  participantName?: string;
  participantEmail?: string;
  note?: string;
}

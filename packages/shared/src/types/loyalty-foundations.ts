export interface LoyaltyQuestSummary {
  id: string;
  name: string;
  description: string | null;
  goalType: string;
  goalTarget: number;
  progress: number;
  rewardPoints: number;
  completed: boolean;
  rewardClaimed: boolean;
}

export interface LoyaltySummary {
  pointsBalance: number;
  quests: LoyaltyQuestSummary[];
  ledger: Array<{
    id: string;
    points: number;
    type: string;
    reason: string;
    createdAt: string;
  }>;
}

export interface BundlePreviewSummary {
  templateId: string | null;
  title: string;
  subtotalCents: number;
  currency: string;
  items: Array<{
    productId: string;
    skuId: string;
    productName: string;
    skuName: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }>;
}

export interface SnackPlanSummary {
  id: string;
  name: string;
  participantCount: number;
  budgetTargetCents: number;
  preferredCategories: string[];
  preferredTags: string[];
  status: string;
  suggestion: unknown;
  createdAt: string;
}

export interface GroupCartSummary {
  id: string;
  name: string;
  shareToken: string;
  status: string;
  items: Array<{
    id: string;
    skuId: string;
    productName: string;
    skuName: string;
    quantity: number;
    participantName: string | null;
  }>;
  createdAt: string;
}

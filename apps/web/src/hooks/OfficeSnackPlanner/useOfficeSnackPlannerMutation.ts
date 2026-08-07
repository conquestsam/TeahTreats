'use client';

import { useMutation } from '@tanstack/react-query';
import { createOfficeSnackPlan } from '@/services/OfficeSnackPlanner/officeSnackPlannerApi';

export function useOfficeSnackPlannerMutation() {
  return useMutation({ mutationFn: createOfficeSnackPlan });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { groupCartQueryKey } from '@/constants/GroupCart/groupCartConstants';
import { listGroupCarts } from '@/services/GroupCart/groupCartApi';

export function useGroupCartQuery() {
  return useQuery({ queryKey: groupCartQueryKey, queryFn: listGroupCarts });
}

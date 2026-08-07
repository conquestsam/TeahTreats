import { useQuery } from '@tanstack/react-query';
import { adminProductQueryKey } from '@/constants/AdminProduct/adminProductConstants';
import { listAdminProducts } from '@/services/AdminProduct/adminProductApi';

export function useAdminProductQuery() {
  return useQuery({
    queryKey: adminProductQueryKey,
    queryFn: listAdminProducts
  });
}

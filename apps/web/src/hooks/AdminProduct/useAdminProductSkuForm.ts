import { useForm } from '@mantine/form';
import {
  validateAdminProductSkuName,
  validateAdminProductSkuPrice
} from '@/validation/AdminProduct/adminProductSkuValidation';

export function useAdminProductSkuForm() {
  return useForm({
    initialValues: {
      name: '',
      priceCents: 1,
      currency: 'USD',
      active: true,
      size: '',
      packCount: 1,
      unitLabel: '',
      barcode: '',
      weight: '',
      dimensions: '',
      perishableOverride: false
    },
    validate: {
      name: validateAdminProductSkuName,
      priceCents: validateAdminProductSkuPrice
    }
  });
}

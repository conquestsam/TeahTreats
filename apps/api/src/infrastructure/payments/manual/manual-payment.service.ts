import { Injectable } from '@nestjs/common';

@Injectable()
export class ManualPaymentService {
  getConfiguredMethods() {
    return [
      { key: 'cashapp', label: 'Cash App', enabled: true },
      { key: 'venmo', label: 'Venmo', enabled: true },
      { key: 'zelle', label: 'Zelle', enabled: true }
    ];
  }
}

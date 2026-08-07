import { AppShell } from '@/components/layout/app-shell';
import { CustomerBundleContent } from '../../../contents/functional-contents/CustomerBundle/CustomerBundleContent';

export default function BundlesPage() {
  return (<AppShell> 
    <CustomerBundleContent />
    </AppShell> 
    )
  }
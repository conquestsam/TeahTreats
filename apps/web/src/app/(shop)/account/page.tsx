import { AppShell } from '../../../components/layout/app-shell';
import { CustomerDashboardContent } from '../../../contents/CustomerDashboard/CustomerDashboardContent';

export default function CustomerDashboardPage() {
    return (
        <AppShell>
            <CustomerDashboardContent />
        </AppShell>
    );
}

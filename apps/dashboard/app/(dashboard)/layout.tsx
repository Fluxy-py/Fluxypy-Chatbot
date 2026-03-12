import DashboardShell from '@/components/layout/dashboard-shell';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </DashboardShell>
  );
}
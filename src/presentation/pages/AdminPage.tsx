

import { useEffect } from 'react';
import { Users, BarChart2, CalendarClock, FileText, AlertCircle, ShieldCheck } from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { TopBar } from '../components/common/TopBar';
import { PlatformToggles } from '../components/admin/PlatformToggles';
import { UserManagementTable } from '../components/admin/UserManagementTable';
import { EmptyState } from '../components/common/EmptyState';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAdminDataThunk, selectAdminMetrics, selectAdminLoading, selectAdminUsers, clearAdminError } from '../../store/slices/adminSlice';

export function AdminPage() {
  const dispatch = useAppDispatch();
  const metrics = useAppSelector(selectAdminMetrics);
  const isLoading = useAppSelector(selectAdminLoading);
  const users = useAppSelector(selectAdminUsers);

  useEffect(() => {
    dispatch(fetchAdminDataThunk());
    return () => { dispatch(clearAdminError()); };
  }, [dispatch]);

  const statsCards = [
    { label: 'Total Users', value: metrics.totalUsers, Icon: Users, variant: 'accent' },
    { label: 'Total Posts', value: metrics.totalPosts, Icon: FileText, variant: 'success' },
    { label: 'Scheduled', value: metrics.scheduledPosts, Icon: CalendarClock, variant: 'warning' },
    { label: 'Published', value: metrics.publishedPosts, Icon: BarChart2, variant: 'success' },
  ];

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <TopBar
          title="Admin Control Panel"
          subtitle="Global platform settings and user oversight"
          actions={
            <span className="badge" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} /> Admin Access
            </span>
          }
        />
        <div className="page-content">
          {isLoading ? (
            <div className="loading-overlay">
              <div className="spinner" />
            </div>
          ) : (
            <div className="animate-fade-in">
              {}
              <div className="section-header">
                <div>
                  <div className="section-title">Overview</div>
                  <div className="section-subtitle">Platform-wide statistics</div>
                </div>
              </div>

              <div className="stats-grid">
                {statsCards.map(({ label, value, Icon, variant }) => (
                  <div key={label} className={`stat-card stat-card--${variant}`} id={`stat-card-${label.toLowerCase().replace(' ', '-')}`}>
                    <div className="stat-card__icon">
                      <Icon size={20} />
                    </div>
                    <div className="stat-card__value">{value}</div>
                    <div className="stat-card__label">{label}</div>
                  </div>
                ))}
              </div>

              {}
              <div className="section-header">
                <div>
                  <div className="section-title">Platform Controls</div>
                  <div className="section-subtitle">Enable or disable publishing capabilities</div>
                </div>
              </div>
              <PlatformToggles />

              <div className="divider" style={{ margin: '32px 0' }} />

              {}
              <div className="section-header">
                <div>
                  <div className="section-title">User Management</div>
                  <div className="section-subtitle">View and audit all registered users</div>
                </div>
              </div>

              {users.length === 0 ? (
                <EmptyState
                  variant="admin"
                  title="No users found"
                  description="Users will appear here once they register."
                />
              ) : (
                <UserManagementTable />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

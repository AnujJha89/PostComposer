

import { Users, Shield, Clock } from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';
import { selectAdminUsers } from '../../../store/slices/adminSlice';

export function UserManagementTable() {
  const users = useAppSelector(selectAdminUsers);

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <div className="card__title">User Management</div>
          <div className="card__subtitle">{users.length} registered account{users.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={16} color="var(--color-text-tertiary)" />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" id="user-management-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Total Posts</th>
              <th>Scheduled</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} id={`user-row-${user.id}`}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: 32, height: 32,
                        borderRadius: '50%',
                        background: user.role === 'ADMIN' ? 'var(--color-accent)' : 'var(--color-bg-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700,
                        color: user.role === 'ADMIN' ? '#fff' : 'var(--color-text-secondary)',
                        flexShrink: 0,
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{user.displayName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  {user.role === 'ADMIN' ? (
                    <span className="badge" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
                      <Shield size={10} /> Admin
                    </span>
                  ) : (
                    <span className="badge badge--draft">
                      <Users size={10} /> User
                    </span>
                  )}
                </td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge--published' : 'badge--failed'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{user.postCount}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} color="var(--color-accent)" />
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{user.scheduledPostCount}</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

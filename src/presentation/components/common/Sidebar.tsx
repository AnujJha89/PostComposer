

import { NavLink, useNavigate } from 'react-router-dom';
import { PenLine, CalendarClock, LayoutDashboard, LogOut, Settings, Link2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logout, selectCurrentUser, selectIsAdmin } from '../../../store/slices/authSlice';

export function Sidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = useAppSelector(selectIsAdmin);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const initials = user.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-mark">
          <div className="sidebar__logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div>
            <div className="sidebar__logo-text">PostComposer</div>
            <div className="sidebar__logo-sub">Social Media Hub</div>
          </div>
        </div>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__nav-label">Workspace</div>

        <NavLink
          to="/compose"
          className={({ isActive }) => `sidebar__nav-item${isActive ? ' active' : ''}`}
        >
          <PenLine size={16} />
          Compose
        </NavLink>

        <NavLink
          to="/scheduled"
          className={({ isActive }) => `sidebar__nav-item${isActive ? ' active' : ''}`}
        >
          <CalendarClock size={16} />
          Scheduled Posts
        </NavLink>

        <NavLink
          to="/connect"
          className={({ isActive }) => `sidebar__nav-item${isActive ? ' active' : ''}`}
        >
          <Link2 size={16} />
          Connect Accounts
        </NavLink>

        {isAdmin && (
          <>
            <div className="sidebar__nav-label" style={{ marginTop: '12px' }}>Administration</div>
            <NavLink
              to="/admin"
              className={({ isActive }) => `sidebar__nav-item${isActive ? ' active' : ''}`}
            >
              <LayoutDashboard size={16} />
              Admin Panel
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">{initials}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user.displayName ?? user.email ?? 'User'}</div>
            <div className="sidebar__user-role">{user.role}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{ color: '#4A5568', padding: '4px', marginLeft: 'auto', flexShrink: 0 }}
            className="btn--ghost"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

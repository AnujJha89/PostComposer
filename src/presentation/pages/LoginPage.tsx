
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Key, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginThunk, selectIsAuthenticated, selectAuthLoading, selectAuthError, clearAuthError } from '../../store/slices/authSlice';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/compose';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    return () => { dispatch(clearAuthError()); };
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    dispatch(loginThunk({ email: email.trim(), password }));
  };

  const fillDemo = (type: 'admin' | 'user') => {
    setEmail(type === 'admin' ? 'admin@example.com' : 'user@example.com');
    setPassword(type === 'admin' ? 'Admin123!' : 'User123!');
    dispatch(clearAuthError());
  };

  return (
    <div className="login-page">
      <div className="login-page__card-wrapper">

        <div className="login-page__brand">
          <img
            src="/login-hero.png"
            alt="Desert dunes at twilight"
            className="login-page__brand-image"
          />
          <div className="login-page__brand-overlay" />
          <div className="login-page__brand-content">
            <h1 className="login-page__brand-title">
              Capturing Ideas,<br/>Creating Impact
            </h1>
          </div>
        </div>

        <div className="login-page__panel">
          <div className="login-card">
            <div className="login-card__header">
              <h2 className="login-card__title">Welcome back</h2>
              <p className="login-card__subtitle">Sign in to your workspace</p>
            </div>

            <div className="login-demo-hint">
              <strong>Demo Credentials</strong>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn--sm btn--secondary" onClick={() => fillDemo('admin')} id="fill-admin-btn">
                  <Key size={14} /> Fill Admin
                </button>
                <button type="button" className="btn btn--sm btn--secondary" onClick={() => fillDemo('user')} id="fill-user-btn">
                  <User size={14} /> Fill User
                </button>
              </div>
            </div>

            <form className="login-form" onSubmit={handleSubmit} id="login-form">
              {authError && (
                <div className="alert alert--error" id="login-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="alert__icon">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <div className="alert__content">{authError}</div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    id="toggle-password-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                className={`btn btn--primary btn--full btn--lg${isLoading ? ' btn--loading' : ''}`}
                disabled={isLoading || !email || !password}
              >
                Sign In
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

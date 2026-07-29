

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ProtectedRoute, AdminRoute } from './presentation/components/common/RouteGuards';

const LoginPage = lazy(() => import('./presentation/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ComposerPage = lazy(() => import('./presentation/pages/ComposerPage').then(m => ({ default: m.ComposerPage })));
const ScheduledPostsPage = lazy(() => import('./presentation/pages/ScheduledPostsPage').then(m => ({ default: m.ScheduledPostsPage })));
const AdminPage = lazy(() => import('./presentation/pages/AdminPage').then(m => ({ default: m.AdminPage })));
const ConnectAccountsPage = lazy(() => import('./presentation/pages/ConnectAccountsPage').then(m => ({ default: m.ConnectAccountsPage })));

export function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={
          <div className="loading-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="spinner" />
          </div>
        }>
          <Routes>
            {}
            <Route path="/login" element={<LoginPage />} />

            {}
            <Route
              path="/compose"
              element={<ProtectedRoute><ComposerPage /></ProtectedRoute>}
            />
            <Route
              path="/scheduled"
              element={<ProtectedRoute><ScheduledPostsPage /></ProtectedRoute>}
            />
            <Route
              path="/connect"
              element={<ProtectedRoute><ConnectAccountsPage /></ProtectedRoute>}
            />

            {}
            <Route
              path="/admin"
              element={<AdminRoute><AdminPage /></AdminRoute>}
            />

            {}
            <Route path="/" element={<Navigate to="/compose" replace />} />
            <Route path="*" element={<Navigate to="/compose" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
}

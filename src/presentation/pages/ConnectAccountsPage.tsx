import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchConnectionsThunk, disconnectPlatformThunk, selectSocialConnections, selectSocialLoading } from '../../store/slices/socialTokensSlice';
import { useOAuthPopup } from '../components/common/useOAuthPopup';
import { Sidebar } from '../components/common/Sidebar';
import { TopBar } from '../components/common/TopBar';
import { Link2, Unlink } from 'lucide-react';
import { XIcon, LinkedInIcon, FacebookIcon } from '../components/common/PlatformIcons';

export function ConnectAccountsPage() {
  const dispatch = useAppDispatch();
  const connections = useAppSelector(selectSocialConnections);
  const isLoading = useAppSelector(selectSocialLoading);

  useEffect(() => {
    dispatch(fetchConnectionsThunk());
  }, [dispatch]);

  const handleConnect = async (platform: string) => {
    try {
      const res = await fetch(`http://localhost:3001/auth/${platform}/login`, { credentials: 'include' });
      const data = await res.json();
      if (data.url) {
        
        const popup = window.open(data.url, 'Connect', 'width=600,height=600');
        const timer = setInterval(() => {
          if (popup?.closed) {
            clearInterval(timer);
            dispatch(fetchConnectionsThunk());
          }
        }, 500);
      }
    } catch (err) {
      alert('Failed to initiate OAuth. Is the backend running with .env configured?');
    }
  };

  const handleDisconnect = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    dispatch(disconnectPlatformThunk(platform));
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <TopBar
          title="Connect Accounts"
          subtitle="Link your social media profiles to post directly."
        />
        <div className="page-content">
          <div className="card">
            <h3>Connected Platforms</h3>
            <p className="text-sm text-muted">Connect to real social media APIs. (Requires Express backend + .env keys)</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              {}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'var(--color-bg-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <XIcon size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>X (Twitter)</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                      {connections.twitter.connected ? `Connected as @${connections.twitter.username}` : 'Not connected'}
                    </div>
                  </div>
                </div>
                {connections.twitter.connected ? (
                  <button className="btn btn--secondary" onClick={() => handleDisconnect('twitter')}><Unlink size={16}/> Disconnect</button>
                ) : (
                  <button className="btn btn--primary" onClick={() => handleConnect('twitter')}><Link2 size={16}/> Connect X</button>
                )}
              </div>

              {}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'var(--color-bg-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(10, 102, 194, 0.2)', color: '#60A5FA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LinkedInIcon size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>LinkedIn</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                      {connections.linkedin.connected ? `Connected as ${connections.linkedin.name}` : 'Not connected'}
                    </div>
                  </div>
                </div>
                {connections.linkedin.connected ? (
                  <button className="btn btn--secondary" onClick={() => handleDisconnect('linkedin')}><Unlink size={16}/> Disconnect</button>
                ) : (
                  <button className="btn btn--primary" onClick={() => handleConnect('linkedin')}><Link2 size={16}/> Connect LinkedIn</button>
                )}
              </div>

              {}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'var(--color-bg-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(24, 119, 242, 0.2)', color: '#60A5FA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FacebookIcon size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Facebook Pages</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                      {connections.facebook.connected 
                        ? `Connected (${connections.facebook.pages.length} pages available)` 
                        : 'Not connected'}
                    </div>
                  </div>
                </div>
                {connections.facebook.connected ? (
                  <button className="btn btn--secondary" onClick={() => handleDisconnect('facebook')}><Unlink size={16}/> Disconnect</button>
                ) : (
                  <button className="btn btn--primary" onClick={() => handleConnect('facebook')}><Link2 size={16}/> Connect Facebook</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

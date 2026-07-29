

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: 'posts' | 'admin' | 'default';
}

function PostsIllustration() {
  return (
    <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {}
      <rect x="30" y="20" width="120" height="100" rx="10" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5"/>
      {}
      <rect x="46" y="40" width="88" height="6" rx="3" fill="#7C3AED" opacity="0.6">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="46" y="54" width="68" height="6" rx="3" fill="rgba(255, 255, 255, 0.15)"/>
      <rect x="46" y="68" width="76" height="6" rx="3" fill="rgba(255, 255, 255, 0.15)"/>
      {}
      <circle cx="46" cy="90" r="6" fill="#FFFFFF" opacity="0.8">
        <animate attributeName="r" values="6;7;6" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="62" cy="90" r="6" fill="#60A5FA">
        <animate attributeName="r" values="6;7;6" dur="2s" begin="0.3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="78" cy="90" r="6" fill="#06B6D4">
        <animate attributeName="r" values="6;7;6" dur="2s" begin="0.6s" repeatCount="indefinite"/>
      </circle>
      {}
      <circle cx="140" cy="36" r="18" fill="#7C3AED" opacity="0.2"/>
      <circle cx="140" cy="36" r="12" fill="#7C3AED"/>
      <line x1="140" y1="30" x2="140" y2="42" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="134" y1="36" x2="146" y2="36" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function AdminIllustration() {
  return (
    <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="30" width="60" height="80" rx="8" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5"/>
      <rect x="100" y="50" width="60" height="60" rx="8" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5"/>
      <rect x="36" y="46" width="30" height="24" rx="4" fill="#7C3AED" opacity="0.2"/>
      <rect x="36" y="46" width="30" height="24" rx="4" fill="none" stroke="#7C3AED" strokeWidth="1.2"/>
      <rect x="36" y="80" width="30" height="6" rx="3" fill="rgba(255, 255, 255, 0.2)"/>
      <rect x="36" y="92" width="20" height="6" rx="3" fill="rgba(255, 255, 255, 0.1)"/>
      {}
      <rect x="112" y="88" width="8" height="12" rx="2" fill="#7C3AED" opacity="0.6">
        <animate attributeName="height" values="12;20;12" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="y" values="88;80;88" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="124" y="80" width="8" height="20" rx="2" fill="#06B6D4" opacity="0.8">
        <animate attributeName="height" values="20;14;20" dur="2s" begin="0.4s" repeatCount="indefinite"/>
        <animate attributeName="y" values="80;86;80" dur="2s" begin="0.4s" repeatCount="indefinite"/>
      </rect>
      <rect x="136" y="84" width="8" height="16" rx="2" fill="#34D399">
        <animate attributeName="height" values="16;24;16" dur="2s" begin="0.8s" repeatCount="indefinite"/>
        <animate attributeName="y" values="84;76;84" dur="2s" begin="0.8s" repeatCount="indefinite"/>
      </rect>
    </svg>
  );
}

function DefaultIllustration() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="50" r="36" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5"/>
      <path d="M46 50h28M60 36v28" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function EmptyState({ title, description, action, variant = 'default' }: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state__illustration">
        {variant === 'posts' && <PostsIllustration />}
        {variant === 'admin' && <AdminIllustration />}
        {variant === 'default' && <DefaultIllustration />}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__desc">{description}</p>
      {action}
    </div>
  );
}

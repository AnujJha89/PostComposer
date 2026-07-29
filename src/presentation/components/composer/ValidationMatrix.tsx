

import { AlertCircle } from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';
import { selectComposer } from '../../../store/slices/postSlice';
import { Platform, PLATFORM_CONSTRAINTS } from '../../../domain/value-objects/Platform';
import { PlatformIcon, PLATFORM_META } from '../common/PlatformIcons';

function getMeterClass(pct: number): string {
  if (pct >= 100) return 'over';
  if (pct >= 80) return 'warn';
  return 'ok';
}

export function ValidationMatrix() {
  const { platforms, violations, characterUsage, content } = useAppSelector(selectComposer);

  if (platforms.length === 0) {
    return (
      <div className="card" style={{ background: 'var(--color-bg-subtle)', border: 'none' }}>
        <p className="text-xs text-muted" style={{ textAlign: 'center', padding: '8px' }}>
          Select platforms to see character limits
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card__header" style={{ marginBottom: '12px' }}>
        <span className="form-label">Character Limits</span>
        <span className="text-xs text-muted">{content.length} chars</span>
      </div>

      <div className="validation-matrix">
        {platforms.map((platform) => {
          const usage = characterUsage[platform];
          const constraint = PLATFORM_CONSTRAINTS[platform];
          const meta = PLATFORM_META[platform];
          if (!usage) {
            
            return (
              <div key={platform} className="char-meter">
                <div className="char-meter__header">
                  <span className="char-meter__label">
                    <PlatformIcon platform={platform} size={12} />
                    {meta?.label ?? platform}
                  </span>
                  <span className="char-meter__count">0 / {constraint.characterLimit.toLocaleString()}</span>
                </div>
                <div className="char-meter__bar">
                  <div className="char-meter__fill ok" style={{ width: '0%' }} />
                </div>
              </div>
            );
          }
          const cls = getMeterClass(usage.percentage);
          return (
            <div key={platform} className="char-meter">
              <div className="char-meter__header">
                <span className="char-meter__label">
                  <PlatformIcon platform={platform} size={12} />
                  {meta?.label ?? platform}
                </span>
                <span className={`char-meter__count ${cls === 'over' ? 'over' : ''}`}>
                  {usage.used.toLocaleString()} / {usage.limit.toLocaleString()}
                </span>
              </div>
              <div className="char-meter__bar">
                <div
                  className={`char-meter__fill ${cls}`}
                  style={{ width: `${Math.min(100, usage.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}

        {violations.length > 0 && (
          <div className="violation-list" style={{ marginTop: '8px' }}>
            {violations.map((v, i) => (
              <div key={i} className="violation-item">
                <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{v.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

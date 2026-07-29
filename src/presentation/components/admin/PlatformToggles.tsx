

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { togglePlatformThunk, selectPlatformStatuses, selectTogglingPlatform } from '../../../store/slices/adminSlice';
import { selectCurrentUser } from '../../../store/slices/authSlice';
import { PLATFORM_CONSTRAINTS } from '../../../domain/value-objects/Platform';
import type { Platform } from '../../../domain/value-objects/Platform';
import { PlatformIcon } from '../common/PlatformIcons';

const PLATFORM_COLORS: Record<Platform, string> = {
  TWITTER: 'rgba(255, 255, 255, 0.1)',
  LINKEDIN: 'rgba(10, 102, 194, 0.2)',
  FACEBOOK: 'rgba(24, 119, 242, 0.2)',
};

export function PlatformToggles() {
  const dispatch = useAppDispatch();
  const platformStatuses = useAppSelector(selectPlatformStatuses);
  const togglingPlatform = useAppSelector(selectTogglingPlatform);
  const user = useAppSelector(selectCurrentUser);

  const handleToggle = (platform: Platform) => {
    if (!user.userId || togglingPlatform) return;
    dispatch(togglePlatformThunk({ platform, adminId: user.userId }));
  };

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <div className="card__title">Platform API Controls</div>
          <div className="card__subtitle">Enable or disable posting capabilities per platform</div>
        </div>
      </div>

      <div className="platform-config-list">
        {platformStatuses.map(({ platform, isEnabled }) => {
          const constraint = PLATFORM_CONSTRAINTS[platform as Platform];
          const isToggling = togglingPlatform === platform;

          return (
            <div
              key={platform}
              className={`platform-config-item${!isEnabled ? ' disabled' : ''}`}
              id={`platform-config-${platform.toLowerCase()}`}
            >
              <div className="platform-config-item__info">
                <div
                  className="platform-config-item__icon"
                  style={{ background: PLATFORM_COLORS[platform as Platform] }}
                >
                  <PlatformIcon platform={platform as Platform} size={16} />
                </div>
                <div>
                  <div className="platform-config-item__name">{constraint.displayName}</div>
                  <div className="platform-config-item__limit">
                    {constraint.characterLimit.toLocaleString()} chars · Max {constraint.mediaConstraint.maxImages} images
                  </div>
                </div>
              </div>

              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id={`toggle-${platform.toLowerCase()}`}
                  checked={isEnabled}
                  onChange={() => handleToggle(platform as Platform)}
                  disabled={isToggling}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

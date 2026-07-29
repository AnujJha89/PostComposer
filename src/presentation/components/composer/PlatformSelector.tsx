

import { Platform, PLATFORM_CONSTRAINTS } from '../../../domain/value-objects/Platform';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setComposerPlatforms, selectComposer } from '../../../store/slices/postSlice';
import { PlatformIcon, PLATFORM_META } from '../common/PlatformIcons';

export function PlatformSelector() {
  const dispatch = useAppDispatch();
  const { platforms: selected } = useAppSelector(selectComposer);

  const toggle = (platform: Platform) => {
    if (selected.includes(platform)) {
      dispatch(setComposerPlatforms(selected.filter((p) => p !== platform)));
    } else {
      dispatch(setComposerPlatforms([...selected, platform]));
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">
        Publish To <span>— select all that apply</span>
      </label>
      <div className="platform-selector">
        {Object.values(Platform).map((platform) => {
          const meta = PLATFORM_META[platform];
          const isSelected = selected.includes(platform);
          const constraint = PLATFORM_CONSTRAINTS[platform];
          return (
            <button
              key={platform}
              type="button"
              onClick={() => toggle(platform)}
              className={`platform-option${isSelected ? ` selected--${meta.color}` : ''}`}
              title={`${meta.label} — ${constraint.characterLimit.toLocaleString()} chars`}
              aria-pressed={isSelected}
              id={`platform-option-${platform.toLowerCase()}`}
            >
              <span className="platform-option__icon">
                <PlatformIcon platform={platform} size={14} />
              </span>
              {meta.label}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="form-error">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          Select at least one platform
        </p>
      )}
    </div>
  );
}

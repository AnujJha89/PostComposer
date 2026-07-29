

import { useState, useEffect } from 'react';
import { Clock, Zap, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setComposerScheduleTime, selectComposer } from '../../../store/slices/postSlice';
import { PUBLISH_NOW_SENTINEL, MINIMUM_SCHEDULE_MINUTES } from '../../../domain/value-objects/ScheduleTime';

function getMinDateTime(): string {
  const min = new Date(Date.now() + (MINIMUM_SCHEDULE_MINUTES + 1) * 60 * 1000);
  
  return min.toISOString().slice(0, 16);
}

export function ScheduleTimePicker() {
  const dispatch = useAppDispatch();
  const { scheduleTime } = useAppSelector(selectComposer);
  const isNow = scheduleTime === PUBLISH_NOW_SENTINEL;
  const [mode, setMode] = useState<'now' | 'scheduled'>(isNow ? 'now' : 'scheduled');
  const [timeError, setTimeError] = useState<string | null>(null);

  const minDateTime = getMinDateTime();

  const handleModeChange = (newMode: 'now' | 'scheduled') => {
    setMode(newMode);
    setTimeError(null);
    if (newMode === 'now') {
      dispatch(setComposerScheduleTime(PUBLISH_NOW_SENTINEL));
    } else {
      
      const oneHour = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
      dispatch(setComposerScheduleTime(new Date(oneHour).toISOString()));
    }
  };

  const handleDateTimeChange = (value: string) => {
    if (!value) return;
    const selected = new Date(value);
    const minimum = new Date(Date.now() + MINIMUM_SCHEDULE_MINUTES * 60 * 1000);
    if (selected <= minimum) {
      setTimeError(`Must be at least ${MINIMUM_SCHEDULE_MINUTES} minutes in the future.`);
    } else {
      setTimeError(null);
    }
    dispatch(setComposerScheduleTime(selected.toISOString()));
  };

  const currentValue = !isNow
    ? new Date(scheduleTime).toISOString().slice(0, 16)
    : '';

  return (
    <div className="form-group">
      <label className="form-label">Schedule</label>
      <div className="schedule-picker">
        <div className="schedule-mode-tabs">
          <button
            type="button"
            id="schedule-tab-now"
            className={`schedule-tab${mode === 'now' ? ' active' : ''}`}
            onClick={() => handleModeChange('now')}
          >
            <Zap size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Publish Now
          </button>
          <button
            type="button"
            id="schedule-tab-later"
            className={`schedule-tab${mode === 'scheduled' ? ' active' : ''}`}
            onClick={() => handleModeChange('scheduled')}
          >
            <Clock size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Schedule
          </button>
        </div>

        {mode === 'scheduled' && (
          <div>
            <input
              id="schedule-datetime-input"
              type="datetime-local"
              className={`form-input${timeError ? ' error' : ''}`}
              min={minDateTime}
              value={currentValue}
              onChange={(e) => handleDateTimeChange(e.target.value)}
            />
            {timeError && (
              <div className="form-error" style={{ marginTop: '6px' }}>
                <AlertCircle size={12} /> {timeError}
              </div>
            )}
            {!timeError && (
              <p className="form-hint" style={{ marginTop: '6px' }}>
                Must be at least {MINIMUM_SCHEDULE_MINUTES} minutes in the future.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



export const MINIMUM_SCHEDULE_MINUTES = 15;
export const PUBLISH_NOW_SENTINEL = 'PUBLISH_NOW';

export type ScheduleTimeMode = 'SCHEDULED' | 'PUBLISH_NOW';

export class ScheduleTime {
  private readonly _timestamp: Date | null;
  private readonly _mode: ScheduleTimeMode;

  private constructor(timestamp: Date | null, mode: ScheduleTimeMode) {
    this._timestamp = timestamp;
    this._mode = mode;
  }

  static publishNow(): ScheduleTime {
    return new ScheduleTime(null, 'PUBLISH_NOW');
  }

  static scheduled(timestamp: Date): ScheduleTime {
    const now = new Date();
    const minimumTime = new Date(now.getTime() + MINIMUM_SCHEDULE_MINUTES * 60 * 1000);

    if (timestamp <= minimumTime) {
      throw new Error(
        `Scheduled time must be at least ${MINIMUM_SCHEDULE_MINUTES} minutes in the future. ` +
          `Provided: ${timestamp.toISOString()}, Minimum: ${minimumTime.toISOString()}`
      );
    }

    return new ScheduleTime(timestamp, 'SCHEDULED');
  }

  static fromString(value: string): ScheduleTime {
    if (value === PUBLISH_NOW_SENTINEL) {
      return ScheduleTime.publishNow();
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid timestamp: "${value}"`);
    }
    return ScheduleTime.scheduled(date);
  }

  static fromStringUnchecked(value: string): ScheduleTime {
    if (value === PUBLISH_NOW_SENTINEL) {
      return ScheduleTime.publishNow();
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid timestamp: "${value}"`);
    }
    return new ScheduleTime(date, 'SCHEDULED');
  }

  get mode(): ScheduleTimeMode {
    return this._mode;
  }

  get timestamp(): Date | null {
    return this._timestamp;
  }

  isPublishNow(): boolean {
    return this._mode === 'PUBLISH_NOW';
  }

  isScheduled(): boolean {
    return this._mode === 'SCHEDULED';
  }

  serialize(): string {
    if (this._mode === 'PUBLISH_NOW') return PUBLISH_NOW_SENTINEL;
    return this._timestamp!.toISOString();
  }

  displayLabel(): string {
    if (this._mode === 'PUBLISH_NOW') return 'Publish Now';
    return this._timestamp!.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  equals(other: ScheduleTime): boolean {
    if (this._mode !== other._mode) return false;
    if (this._mode === 'PUBLISH_NOW') return true;
    return this._timestamp!.getTime() === other._timestamp!.getTime();
  }
}

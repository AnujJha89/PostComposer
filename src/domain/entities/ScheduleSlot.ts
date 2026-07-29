

import { Platform } from '../value-objects/Platform';

export interface ScheduleSlotProps {
  id: string;
  postId: string;
  platform: Platform;
  scheduledAt: Date;
  executedAt?: Date;
  status: 'PENDING' | 'EXECUTING' | 'DONE' | 'FAILED';
  retryCount: number;
}

export class ScheduleSlot {
  private readonly _id: string;
  private readonly _postId: string;
  private readonly _platform: Platform;
  private readonly _scheduledAt: Date;
  private _executedAt?: Date;
  private _status: ScheduleSlotProps['status'];
  private _retryCount: number;

  constructor(props: ScheduleSlotProps) {
    this._id = props.id;
    this._postId = props.postId;
    this._platform = props.platform;
    this._scheduledAt = props.scheduledAt;
    this._executedAt = props.executedAt;
    this._status = props.status;
    this._retryCount = props.retryCount;
  }

  static create(props: Omit<ScheduleSlotProps, 'status' | 'retryCount' | 'executedAt'>): ScheduleSlot {
    return new ScheduleSlot({ ...props, status: 'PENDING', retryCount: 0 });
  }

  get id(): string { return this._id; }
  get postId(): string { return this._postId; }
  get platform(): Platform { return this._platform; }
  get scheduledAt(): Date { return this._scheduledAt; }
  get executedAt(): Date | undefined { return this._executedAt; }
  get status(): ScheduleSlotProps['status'] { return this._status; }
  get retryCount(): number { return this._retryCount; }

  markExecuting(): void { this._status = 'EXECUTING'; }
  markDone(): void { this._status = 'DONE'; this._executedAt = new Date(); }
  markFailed(): void { this._status = 'FAILED'; this._retryCount += 1; }

  toPlainObject(): ScheduleSlotProps {
    return {
      id: this._id,
      postId: this._postId,
      platform: this._platform,
      scheduledAt: this._scheduledAt,
      executedAt: this._executedAt,
      status: this._status,
      retryCount: this._retryCount,
    };
  }
}

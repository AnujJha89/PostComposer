

import { Platform } from '../value-objects/Platform';
import { PostContent } from '../value-objects/PostContent';
import { ScheduleTime } from '../value-objects/ScheduleTime';
import type { MediaFileProps } from './MediaFile';

export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED' | 'DELETED';

export interface PostProps {
  id: string;
  authorId: string;
  title: string;
  content: string;
  platforms: Platform[];
  mediaFiles: MediaFileProps[];
  scheduleTime: string; 
  status: PostStatus;
  isDeleted: boolean;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Post {
  private readonly _id: string;
  private readonly _authorId: string;
  private _title: string;
  private _content: PostContent;
  private _platforms: Platform[];
  private _mediaFiles: MediaFileProps[];
  private _scheduleTime: ScheduleTime;
  private _status: PostStatus;
  private _isDeleted: boolean;
  private _failureReason?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: PostProps) {
    this._id = props.id;
    this._authorId = props.authorId;
    this._title = props.title;
    this._content = PostContent.create(props.content);
    this._platforms = props.platforms;
    this._mediaFiles = props.mediaFiles;
    
    this._scheduleTime = ScheduleTime.fromStringUnchecked(props.scheduleTime);
    this._status = props.status;
    this._isDeleted = props.isDeleted;
    this._failureReason = props.failureReason;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: Omit<PostProps, 'createdAt' | 'updatedAt' | 'status' | 'isDeleted'>): Post {
    if (!props.id) throw new Error('Post id is required.');
    if (!props.authorId) throw new Error('Post authorId is required.');
    if (!props.title?.trim()) throw new Error('Post title is required.');
    if (!props.platforms || props.platforms.length === 0) {
      throw new Error('At least one platform must be selected.');
    }
    const now = new Date();
    return new Post({
      ...props,
      status: 'DRAFT',
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: PostProps): Post {
    return new Post(props);
  }

  get id(): string { return this._id; }
  get authorId(): string { return this._authorId; }
  get title(): string { return this._title; }
  get content(): PostContent { return this._content; }
  get platforms(): Platform[] { return [...this._platforms]; }
  get mediaFiles(): MediaFileProps[] { return [...this._mediaFiles]; }
  get scheduleTime(): ScheduleTime { return this._scheduleTime; }
  get status(): PostStatus { return this._status; }
  get isDeleted(): boolean { return this._isDeleted; }
  get failureReason(): string | undefined { return this._failureReason; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  update(updates: {
    title?: string;
    content?: string;
    platforms?: Platform[];
    mediaFiles?: MediaFileProps[];
    scheduleTime?: string;
  }): void {
    if (this._status === 'PUBLISHED') {
      throw new Error('Cannot edit a published post.');
    }
    if (this._isDeleted) {
      throw new Error('Cannot edit a deleted post.');
    }
    if (updates.title !== undefined) this._title = updates.title;
    if (updates.content !== undefined) this._content = PostContent.create(updates.content);
    if (updates.platforms !== undefined) {
      if (updates.platforms.length === 0) {
        throw new Error('At least one platform must be selected.');
      }
      this._platforms = updates.platforms;
    }
    if (updates.mediaFiles !== undefined) this._mediaFiles = updates.mediaFiles;
    if (updates.scheduleTime !== undefined) {
      this._scheduleTime = ScheduleTime.fromString(updates.scheduleTime);
    }
    this._updatedAt = new Date();
  }

  schedule(): void {
    if (this._isDeleted) throw new Error('Cannot schedule a deleted post.');
    if (this._status === 'PUBLISHED') throw new Error('Post is already published.');
    this._status = 'SCHEDULED';
    this._updatedAt = new Date();
  }

  markPublished(): void {
    this._status = 'PUBLISHED';
    this._updatedAt = new Date();
  }

  markFailed(reason: string): void {
    this._status = 'FAILED';
    this._failureReason = reason;
    this._updatedAt = new Date();
  }

  softDelete(): void {
    if (this._isDeleted) throw new Error('Post is already deleted.');
    this._isDeleted = true;
    this._status = 'DELETED';
    this._updatedAt = new Date();
  }

  restore(): void {
    if (!this._isDeleted) throw new Error('Post is not deleted.');
    this._isDeleted = false;
    this._status = 'DRAFT';
    this._updatedAt = new Date();
  }

  toPlainObject(): PostProps {
    return {
      id: this._id,
      authorId: this._authorId,
      title: this._title,
      content: this._content.value,
      platforms: [...this._platforms],
      mediaFiles: [...this._mediaFiles],
      scheduleTime: this._scheduleTime.serialize(),
      status: this._status,
      isDeleted: this._isDeleted,
      failureReason: this._failureReason,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

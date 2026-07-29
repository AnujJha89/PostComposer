

import type { Platform } from '../../domain/value-objects/Platform';
import type { PostStatus } from '../../domain/entities/Post';
import type { MediaFileProps } from '../../domain/entities/MediaFile';
import type { UserRole } from '../../domain/entities/User';

export interface CreatePostRequestDTO {
  authorId: string;
  title: string;
  content: string;
  platforms: Platform[];
  mediaFiles: MediaFileProps[];
  scheduleTime: string; 
}

export interface UpdatePostRequestDTO {
  postId: string;
  authorId: string;
  title?: string;
  content?: string;
  platforms?: Platform[];
  mediaFiles?: MediaFileProps[];
  scheduleTime?: string;
}

export interface DeletePostRequestDTO {
  postId: string;
  requesterId: string;
}

export interface SchedulePostRequestDTO {
  postId: string;
  requesterId: string;
}

export interface PostResponseDTO {
  id: string;
  authorId: string;
  title: string;
  content: string;
  contentPreview: string;
  platforms: Platform[];
  mediaFiles: MediaFileProps[];
  scheduleTime: string;
  scheduleTimeLabel: string;
  status: PostStatus;
  isDeleted: boolean;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthRequestDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface UserSummaryDTO {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  postCount: number;
  scheduledPostCount: number;
}



import type { Post } from '../../domain/entities/Post';
import type { PostResponseDTO } from '../dtos';

export function mapPostToDTO(post: Post): PostResponseDTO {
  return {
    id: post.id,
    authorId: post.authorId,
    title: post.title,
    content: post.content.value,
    contentPreview: post.content.preview(120),
    platforms: post.platforms,
    mediaFiles: post.mediaFiles,
    scheduleTime: post.scheduleTime.serialize(),
    scheduleTimeLabel: post.scheduleTime.displayLabel(),
    status: post.status,
    isDeleted: post.isDeleted,
    failureReason: post.failureReason,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

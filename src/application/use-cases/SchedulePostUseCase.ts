

import type { IPostRepository } from '../../domain/repositories/IPostRepository';
import type { SchedulePostRequestDTO, PostResponseDTO } from '../dtos';
import { mapPostToDTO } from './mappers';
import { PUBLISH_NOW_SENTINEL } from '../../domain/value-objects/ScheduleTime';
import { MINIMUM_SCHEDULE_MINUTES } from '../../domain/value-objects/ScheduleTime';

export class SchedulePostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(request: SchedulePostRequestDTO): Promise<PostResponseDTO> {
    const { postId, requesterId } = request;

    const post = await this.postRepository.findById(postId);
    if (!post) throw new Error(`Post "${postId}" not found.`);

    if (post.authorId !== requesterId) {
      throw new Error('Unauthorized: You can only schedule your own posts.');
    }

    if (post.isDeleted) throw new Error('Cannot schedule a deleted post.');
    if (post.status === 'PUBLISHED') throw new Error('Post is already published.');

    const scheduleTime = post.scheduleTime;
    if (scheduleTime.isScheduled()) {
      const timestamp = scheduleTime.timestamp!;
      const minimumTime = new Date(Date.now() + MINIMUM_SCHEDULE_MINUTES * 60 * 1000);
      if (timestamp <= minimumTime) {
        throw new Error(
          `Scheduled time must be at least ${MINIMUM_SCHEDULE_MINUTES} minutes in the future.`
        );
      }
    }

    post.schedule();
    await this.postRepository.save(post);
    return mapPostToDTO(post);
  }
}

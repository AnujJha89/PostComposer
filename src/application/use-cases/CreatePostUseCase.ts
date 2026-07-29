

import { Post } from '../../domain/entities/Post';
import { PlatformConstraintService } from '../../domain/services/PlatformConstraintService';
import type { IPostRepository } from '../../domain/repositories/IPostRepository';
import type { CreatePostRequestDTO, PostResponseDTO } from '../dtos';
import { mapPostToDTO } from './mappers';
import { generateId } from '../../infrastructure/utils/generateId';

export class CreatePostUseCase {
  private readonly constraintService = new PlatformConstraintService();

  constructor(private readonly postRepository: IPostRepository) {}

  async execute(request: CreatePostRequestDTO): Promise<PostResponseDTO> {
    const { authorId, title, content, platforms, mediaFiles, scheduleTime } = request;

    if (!title?.trim()) throw new Error('Post title is required.');
    if (!content?.trim()) throw new Error('Post content is required.');
    if (!platforms || platforms.length === 0) throw new Error('At least one platform must be selected.');

    const validation = this.constraintService.validate({
      contentLength: content.length,
      platforms,
      mediaFiles,
    });

    if (!validation.isValid) {
      const messages = validation.violations.map((v) => v.message).join(' | ');
      throw new Error(`Platform constraint violations: ${messages}`);
    }

    const post = Post.create({
      id: generateId(),
      authorId,
      title: title.trim(),
      content,
      platforms,
      mediaFiles,
      scheduleTime,
    });

    await this.postRepository.save(post);

    return mapPostToDTO(post);
  }
}

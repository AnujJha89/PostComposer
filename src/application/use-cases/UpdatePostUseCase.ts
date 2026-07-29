

import type { IPostRepository } from '../../domain/repositories/IPostRepository';
import type { UpdatePostRequestDTO, PostResponseDTO } from '../dtos';
import { mapPostToDTO } from './mappers';

export class UpdatePostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(request: UpdatePostRequestDTO): Promise<PostResponseDTO> {
    const { postId, authorId, ...updates } = request;

    const post = await this.postRepository.findById(postId);
    if (!post) throw new Error(`Post "${postId}" not found.`);

    if (post.authorId !== authorId) {
      throw new Error('Unauthorized: You can only edit your own posts.');
    }

    if (post.isDeleted) throw new Error('Cannot edit a deleted post.');
    if (post.status === 'PUBLISHED') throw new Error('Cannot edit a published post.');

    post.update({
      title: updates.title,
      content: updates.content,
      platforms: updates.platforms,
      mediaFiles: updates.mediaFiles,
      scheduleTime: updates.scheduleTime,
    });

    await this.postRepository.save(post);
    return mapPostToDTO(post);
  }
}



import type { IPostRepository } from '../../domain/repositories/IPostRepository';
import type { DeletePostRequestDTO } from '../dtos';

export class DeletePostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(request: DeletePostRequestDTO): Promise<void> {
    const { postId, requesterId } = request;

    const post = await this.postRepository.findById(postId);
    if (!post) throw new Error(`Post "${postId}" not found.`);

    if (post.authorId !== requesterId) {
      throw new Error('Unauthorized: You can only delete your own posts.');
    }

    if (post.isDeleted) throw new Error('Post is already deleted.');

    post.softDelete();
    await this.postRepository.save(post);
  }
}

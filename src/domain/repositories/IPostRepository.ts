

import type { Post } from '../entities/Post';
import type { PostStatus } from '../entities/Post';

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findByAuthorId(authorId: string): Promise<Post[]>;
  findByStatus(status: PostStatus): Promise<Post[]>;
  findAll(): Promise<Post[]>;
  save(post: Post): Promise<void>;
  delete(id: string): Promise<void>;
}

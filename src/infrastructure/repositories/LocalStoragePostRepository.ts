

import { Post } from '../../domain/entities/Post';
import type { PostProps, PostStatus } from '../../domain/entities/Post';
import type { IPostRepository } from '../../domain/repositories/IPostRepository';

const STORAGE_KEY = 'pc_posts';

function getAll(): PostProps[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PostProps[];
    return parsed.map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  } catch {
    return [];
  }
}

function saveAll(posts: PostProps[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export class LocalStoragePostRepository implements IPostRepository {
  async findById(id: string): Promise<Post | null> {
    const posts = getAll();
    const found = posts.find((p) => p.id === id);
    return found ? Post.reconstitute(found) : null;
  }

  async findByAuthorId(authorId: string): Promise<Post[]> {
    const posts = getAll();
    return posts
      .filter((p) => p.authorId === authorId && !p.isDeleted)
      .map((p) => Post.reconstitute(p));
  }

  async findByStatus(status: PostStatus): Promise<Post[]> {
    const posts = getAll();
    return posts
      .filter((p) => p.status === status && !p.isDeleted)
      .map((p) => Post.reconstitute(p));
  }

  async findAll(): Promise<Post[]> {
    return getAll().map((p) => Post.reconstitute(p));
  }

  async save(post: Post): Promise<void> {
    const posts = getAll();
    const index = posts.findIndex((p) => p.id === post.id);
    const plain = post.toPlainObject();
    if (index >= 0) {
      posts[index] = plain;
    } else {
      posts.push(plain);
    }
    saveAll(posts);
  }

  async delete(id: string): Promise<void> {
    const posts = getAll();
    saveAll(posts.filter((p) => p.id !== id));
  }
}



import type { PostResponseDTO } from '../../application/dtos';

export interface PlatformPublishResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
}

export class TwitterAdapter {
  async publish(post: PostResponseDTO): Promise<PlatformPublishResult> {
    console.log('[TwitterAdapter] Publishing post:', post.id, '—', post.contentPreview);
    
    await new Promise((r) => setTimeout(r, Math.random() * 800 + 400));
    
    if (Math.random() > 0.05) {
      return { success: true, platformPostId: `tw_${Date.now()}` };
    }
    return { success: false, error: 'Twitter API rate limit exceeded. Try again later.' };
  }
}

export class LinkedInAdapter {
  async publish(post: PostResponseDTO): Promise<PlatformPublishResult> {
    console.log('[LinkedInAdapter] Publishing post:', post.id, '—', post.contentPreview);
    await new Promise((r) => setTimeout(r, Math.random() * 600 + 300));
    if (Math.random() > 0.05) {
      return { success: true, platformPostId: `li_${Date.now()}` };
    }
    return { success: false, error: 'LinkedIn API error: Invalid access token.' };
  }
}

export class FacebookAdapter {
  async publish(post: PostResponseDTO): Promise<PlatformPublishResult> {
    console.log('[FacebookAdapter] Publishing post:', post.id, '—', post.contentPreview);
    await new Promise((r) => setTimeout(r, Math.random() * 700 + 350));
    if (Math.random() > 0.05) {
      return { success: true, platformPostId: `fb_${Date.now()}` };
    }
    return { success: false, error: 'Facebook Graph API: Permissions revoked.' };
  }
}

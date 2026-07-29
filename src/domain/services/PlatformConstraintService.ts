

import { Platform, PLATFORM_CONSTRAINTS } from '../value-objects/Platform';
import type { MediaFileProps } from '../entities/MediaFile';

export interface PlatformViolation {
  platform: Platform;
  displayName: string;
  type: 'CHARACTER_LIMIT' | 'IMAGE_LIMIT' | 'VIDEO_LIMIT' | 'UNSUPPORTED_FORMAT' | 'PLATFORM_DISABLED';
  message: string;
  limit: number;
  actual: number;
}

export interface ValidationResult {
  isValid: boolean;
  violations: PlatformViolation[];
  
  characterUsage: Record<Platform, { used: number; limit: number; percentage: number }>;
}

export class PlatformConstraintService {
  
  validate(params: {
    contentLength: number;
    platforms: Platform[];
    mediaFiles: MediaFileProps[];
    disabledPlatforms?: Platform[];
  }): ValidationResult {
    const { contentLength, platforms, mediaFiles, disabledPlatforms = [] } = params;
    const violations: PlatformViolation[] = [];

    const imageFiles = mediaFiles.filter((f) => f.mediaType === 'IMAGE');
    const videoFiles = mediaFiles.filter((f) => f.mediaType === 'VIDEO');

    const characterUsage = {} as Record<Platform, { used: number; limit: number; percentage: number }>;

    for (const platform of platforms) {
      const constraint = PLATFORM_CONSTRAINTS[platform];

      characterUsage[platform] = {
        used: contentLength,
        limit: constraint.characterLimit,
        percentage: Math.min(100, Math.round((contentLength / constraint.characterLimit) * 100)),
      };

      if (disabledPlatforms.includes(platform)) {
        violations.push({
          platform,
          displayName: constraint.displayName,
          type: 'PLATFORM_DISABLED',
          message: `${constraint.displayName} is currently disabled by an administrator.`,
          limit: 0,
          actual: 0,
        });
        continue;
      }

      if (contentLength > constraint.characterLimit) {
        violations.push({
          platform,
          displayName: constraint.displayName,
          type: 'CHARACTER_LIMIT',
          message: `${constraint.displayName} character limit exceeded (${contentLength.toLocaleString()} / ${constraint.characterLimit.toLocaleString()}).`,
          limit: constraint.characterLimit,
          actual: contentLength,
        });
      }

      if (imageFiles.length > constraint.mediaConstraint.maxImages) {
        violations.push({
          platform,
          displayName: constraint.displayName,
          type: 'IMAGE_LIMIT',
          message: `${constraint.displayName} allows max ${constraint.mediaConstraint.maxImages} image(s); you have ${imageFiles.length}.`,
          limit: constraint.mediaConstraint.maxImages,
          actual: imageFiles.length,
        });
      }

      if (videoFiles.length > constraint.mediaConstraint.maxVideos) {
        violations.push({
          platform,
          displayName: constraint.displayName,
          type: 'VIDEO_LIMIT',
          message: `${constraint.displayName} allows max ${constraint.mediaConstraint.maxVideos} video(s); you have ${videoFiles.length}.`,
          limit: constraint.mediaConstraint.maxVideos,
          actual: videoFiles.length,
        });
      }

      if (platform === Platform.TWITTER && imageFiles.length > 0 && videoFiles.length > 0) {
        violations.push({
          platform,
          displayName: constraint.displayName,
          type: 'UNSUPPORTED_FORMAT',
          message: `X (Twitter) does not allow mixing images and videos in the same post.`,
          limit: 0,
          actual: 0,
        });
      }

      const allowedFormats = constraint.mediaConstraint.allowedFormats;
      for (const file of mediaFiles) {
        const ext = file.fileName.split('.').pop()?.toLowerCase() ?? '';
        if (!allowedFormats.includes(ext)) {
          violations.push({
            platform,
            displayName: constraint.displayName,
            type: 'UNSUPPORTED_FORMAT',
            message: `${constraint.displayName} does not support ".${ext}" files. Allowed: ${allowedFormats.join(', ')}.`,
            limit: 0,
            actual: 0,
          });
        }
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
      characterUsage,
    };
  }

  getStrictestLimit(platforms: Platform[]): number {
    if (platforms.length === 0) return Infinity;
    return Math.min(...platforms.map((p) => PLATFORM_CONSTRAINTS[p].characterLimit));
  }
}

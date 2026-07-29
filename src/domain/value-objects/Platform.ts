

export enum Platform {
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
  FACEBOOK = 'FACEBOOK',
}

export interface MediaConstraint {
  maxImages: number;
  maxVideos: number;
  allowedFormats: string[];
}

export interface PlatformConstraint {
  platform: Platform;
  characterLimit: number;
  mediaConstraint: MediaConstraint;
  displayName: string;
  color: string;
  icon: string;
}

export const PLATFORM_CONSTRAINTS: Record<Platform, PlatformConstraint> = {
  [Platform.TWITTER]: {
    platform: Platform.TWITTER,
    characterLimit: 280,
    displayName: 'X (Twitter)',
    color: '#000000',
    icon: 'X',
    mediaConstraint: {
      maxImages: 4,
      maxVideos: 1,
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov'],
    },
  },
  [Platform.LINKEDIN]: {
    platform: Platform.LINKEDIN,
    characterLimit: 3000,
    displayName: 'LinkedIn',
    color: '#0A66C2',
    icon: 'in',
    mediaConstraint: {
      maxImages: 9,
      maxVideos: 1,
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi'],
    },
  },
  [Platform.FACEBOOK]: {
    platform: Platform.FACEBOOK,
    characterLimit: 63206,
    displayName: 'Facebook',
    color: '#1877F2',
    icon: 'f',
    mediaConstraint: {
      maxImages: 10,
      maxVideos: 1,
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'mp4', 'mov', 'avi', 'wmv'],
    },
  },
};

export const ALL_PLATFORMS: Platform[] = Object.values(Platform);

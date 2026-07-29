

import { PlatformConstraintService } from '../../domain/services/PlatformConstraintService';
import type { ValidationResult } from '../../domain/services/PlatformConstraintService';
import type { Platform } from '../../domain/value-objects/Platform';
import type { MediaFileProps } from '../../domain/entities/MediaFile';

export interface ValidateConstraintsRequest {
  contentLength: number;
  platforms: Platform[];
  mediaFiles: MediaFileProps[];
  disabledPlatforms?: Platform[];
}

export class ValidatePlatformConstraintsUseCase {
  private readonly constraintService = new PlatformConstraintService();

  execute(request: ValidateConstraintsRequest): ValidationResult {
    return this.constraintService.validate({
      contentLength: request.contentLength,
      platforms: request.platforms,
      mediaFiles: request.mediaFiles,
      disabledPlatforms: request.disabledPlatforms ?? [],
    });
  }

  getStrictestLimit(platforms: Platform[]): number {
    return this.constraintService.getStrictestLimit(platforms);
  }
}

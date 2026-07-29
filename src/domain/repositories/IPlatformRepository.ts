

import type { PlatformConfiguration } from '../entities/PlatformConfiguration';
import type { Platform } from '../value-objects/Platform';

export interface IPlatformRepository {
  findByPlatform(platform: Platform): Promise<PlatformConfiguration | null>;
  findAll(): Promise<PlatformConfiguration[]>;
  save(config: PlatformConfiguration): Promise<void>;
}

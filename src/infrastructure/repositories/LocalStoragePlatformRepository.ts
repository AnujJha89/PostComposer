

import { PlatformConfiguration } from '../../domain/entities/PlatformConfiguration';
import type { PlatformConfigurationProps } from '../../domain/entities/PlatformConfiguration';
import type { IPlatformRepository } from '../../domain/repositories/IPlatformRepository';
import { Platform, ALL_PLATFORMS } from '../../domain/value-objects/Platform';

const STORAGE_KEY = 'pc_platform_configs';
const DEFAULT_ADMIN_ID = 'user-admin-001';

function getAll(): PlatformConfigurationProps[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as PlatformConfigurationProps[];
      return parsed.map((p) => ({ ...p, updatedAt: new Date(p.updatedAt) }));
    } catch {  }
  }
  
  const defaults = ALL_PLATFORMS.map((platform) => ({
    platform,
    isEnabled: true,
    updatedAt: new Date(),
    updatedByAdminId: DEFAULT_ADMIN_ID,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveAll(configs: PlatformConfigurationProps[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

export class LocalStoragePlatformRepository implements IPlatformRepository {
  async findByPlatform(platform: Platform): Promise<PlatformConfiguration | null> {
    const configs = getAll();
    const found = configs.find((c) => c.platform === platform);
    return found ? new PlatformConfiguration(found) : null;
  }

  async findAll(): Promise<PlatformConfiguration[]> {
    return getAll().map((c) => new PlatformConfiguration(c));
  }

  async save(config: PlatformConfiguration): Promise<void> {
    const configs = getAll();
    const index = configs.findIndex((c) => c.platform === config.platform);
    const plain = config.toPlainObject();
    if (index >= 0) {
      configs[index] = plain;
    } else {
      configs.push(plain);
    }
    saveAll(configs);
  }
}

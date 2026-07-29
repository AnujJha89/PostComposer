

import { Platform } from '../value-objects/Platform';

export interface PlatformConfigurationProps {
  platform: Platform;
  isEnabled: boolean;
  updatedAt: Date;
  updatedByAdminId: string;
}

export class PlatformConfiguration {
  private readonly _platform: Platform;
  private _isEnabled: boolean;
  private _updatedAt: Date;
  private _updatedByAdminId: string;

  constructor(props: PlatformConfigurationProps) {
    this._platform = props.platform;
    this._isEnabled = props.isEnabled;
    this._updatedAt = props.updatedAt;
    this._updatedByAdminId = props.updatedByAdminId;
  }

  static createDefault(platform: Platform, adminId: string): PlatformConfiguration {
    return new PlatformConfiguration({
      platform,
      isEnabled: true,
      updatedAt: new Date(),
      updatedByAdminId: adminId,
    });
  }

  get platform(): Platform { return this._platform; }
  get isEnabled(): boolean { return this._isEnabled; }
  get updatedAt(): Date { return this._updatedAt; }
  get updatedByAdminId(): string { return this._updatedByAdminId; }

  enable(adminId: string): void {
    this._isEnabled = true;
    this._updatedAt = new Date();
    this._updatedByAdminId = adminId;
  }

  disable(adminId: string): void {
    this._isEnabled = false;
    this._updatedAt = new Date();
    this._updatedByAdminId = adminId;
  }

  toggle(adminId: string): void {
    if (this._isEnabled) {
      this.disable(adminId);
    } else {
      this.enable(adminId);
    }
  }

  toPlainObject(): PlatformConfigurationProps {
    return {
      platform: this._platform,
      isEnabled: this._isEnabled,
      updatedAt: this._updatedAt,
      updatedByAdminId: this._updatedByAdminId,
    };
  }
}



export type UserRole = 'USER' | 'ADMIN';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private readonly _id: string;
  private _email: string;
  private _passwordHash: string;
  private _displayName: string;
  private _role: UserRole;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    this._id = props.id;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._displayName = props.displayName;
    this._role = props.role;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: Omit<UserProps, 'createdAt' | 'updatedAt'>): User {
    if (!props.id) throw new Error('User id is required.');
    if (!props.email || !props.email.includes('@')) {
      throw new Error('A valid email address is required.');
    }
    if (!props.displayName.trim()) {
      throw new Error('Display name is required.');
    }
    const now = new Date();
    return new User({ ...props, createdAt: now, updatedAt: now });
  }

  get id(): string { return this._id; }
  get email(): string { return this._email; }
  get passwordHash(): string { return this._passwordHash; }
  get displayName(): string { return this._displayName; }
  get role(): UserRole { return this._role; }
  get isActive(): boolean { return this._isActive; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  isAdmin(): boolean {
    return this._role === 'ADMIN';
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  promoteToAdmin(): void {
    this._role = 'ADMIN';
    this._updatedAt = new Date();
  }

  toPlainObject(): UserProps {
    return {
      id: this._id,
      email: this._email,
      passwordHash: this._passwordHash,
      displayName: this._displayName,
      role: this._role,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

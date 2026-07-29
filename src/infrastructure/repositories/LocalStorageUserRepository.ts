

import { User } from '../../domain/entities/User';
import type { UserProps } from '../../domain/entities/User';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import { MockJWTAuthService } from '../auth/MockJWTAuthService';

const STORAGE_KEY = 'pc_users';
const authService = new MockJWTAuthService();

async function buildSeedUsers(): Promise<UserProps[]> {
  const adminHash = await authService.hashPassword('Admin123!');
  const userHash = await authService.hashPassword('User123!');

  return [
    {
      id: 'user-admin-001',
      email: 'admin@example.com',
      passwordHash: adminHash,
      displayName: 'Alex Admin',
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'user-standard-002',
      email: 'user@example.com',
      passwordHash: userHash,
      displayName: 'Sam User',
      role: 'USER',
      isActive: true,
      createdAt: new Date('2024-01-10T00:00:00Z'),
      updatedAt: new Date('2024-01-10T00:00:00Z'),
    },
    {
      id: 'user-standard-003',
      email: 'jordan@example.com',
      passwordHash: userHash,
      displayName: 'Jordan Smith',
      role: 'USER',
      isActive: true,
      createdAt: new Date('2024-02-01T00:00:00Z'),
      updatedAt: new Date('2024-02-01T00:00:00Z'),
    },
  ];
}

async function getAll(): Promise<UserProps[]> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as UserProps[];
      return parsed.map((u) => ({
        ...u,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      }));
    } catch {
      
    }
  }
  
  const seeds = await buildSeedUsers();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
  return seeds;
}

function saveAll(users: UserProps[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export class LocalStorageUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const users = await getAll();
    const found = users.find((u) => u.id === id);
    return found ? new User(found) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await getAll();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return found ? new User(found) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await getAll();
    return users.map((u) => new User(u));
  }

  async save(user: User): Promise<void> {
    const users = await getAll();
    const index = users.findIndex((u) => u.id === user.id);
    const plain = user.toPlainObject();
    if (index >= 0) {
      users[index] = plain;
    } else {
      users.push(plain);
    }
    saveAll(users);
  }

  async delete(id: string): Promise<void> {
    const users = await getAll();
    saveAll(users.filter((u) => u.id !== id));
  }
}

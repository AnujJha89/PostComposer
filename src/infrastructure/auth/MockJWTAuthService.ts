

import type { IAuthService } from '../../application/use-cases/AuthenticateUserUseCase';

const TOKEN_HEADER = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const SECRET = 'post-composer-secret-2024-do-not-use-in-production';

function signPayload(payload: object): string {
  const encodedPayload = btoa(JSON.stringify(payload));
  
  const signature = btoa(`${encodedPayload}.${SECRET}`).slice(0, 43);
  return `${TOKEN_HEADER}.${encodedPayload}.${signature}`;
}

export function decodeToken(token: string): { userId: string; role: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

async function simpleHash(value: string): Promise<string> {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `mock$hash$${Math.abs(hash).toString(16)}`;
}

export class MockJWTAuthService implements IAuthService {
  async hashPassword(plain: string): Promise<string> {
    return simpleHash(plain);
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    const hashed = await simpleHash(plain);
    return hashed === hash;
  }

  generateToken(payload: { userId: string; role: string }): string {
    const fullPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, 
    };
    return signPayload(fullPayload);
  }
}

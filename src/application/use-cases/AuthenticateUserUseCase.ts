

import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import type { AuthRequestDTO, AuthResponseDTO } from '../dtos';

export interface IAuthService {
  verifyPassword(plain: string, hash: string): Promise<boolean>;
  generateToken(payload: { userId: string; role: string }): string;
  hashPassword(plain: string): Promise<string>;
}

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService
  ) {}

  async execute(request: AuthRequestDTO): Promise<AuthResponseDTO> {
    const { email, password } = request;

    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const user = await this.userRepository.findByEmail(email.toLowerCase().trim());

    if (!user) {
      
      throw new Error('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new Error('This account has been deactivated. Please contact an administrator.');
    }

    const isPasswordValid = await this.authService.verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password.');
    }

    const token = this.authService.generateToken({
      userId: user.id,
      role: user.role,
    });

    return {
      token,
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };
  }
}

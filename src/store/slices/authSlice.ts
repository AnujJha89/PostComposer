

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { AuthenticateUserUseCase } from '../../application/use-cases/AuthenticateUserUseCase';
import { LocalStorageUserRepository } from '../../infrastructure/repositories/LocalStorageUserRepository';
import { MockJWTAuthService, decodeToken } from '../../infrastructure/auth/MockJWTAuthService';
import type { AuthRequestDTO, AuthResponseDTO } from '../../application/dtos';
import type { UserRole } from '../../domain/entities/User';

const TOKEN_KEY = 'pc_auth_token';

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const loginThunk = createAsyncThunk<AuthResponseDTO, AuthRequestDTO>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const useCase = new AuthenticateUserUseCase(
        new LocalStorageUserRepository(),
        new MockJWTAuthService()
      );
      const result = await useCase.execute(credentials);
      localStorage.setItem(TOKEN_KEY, result.token);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      return rejectWithValue(message);
    }
  }
);

function hydrateFromStorage(): Partial<AuthState> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return {};
  const decoded = decodeToken(token);
  if (!decoded) {
    localStorage.removeItem(TOKEN_KEY);
    return {};
  }
  return {
    token,
    userId: decoded.userId,
    role: decoded.role as UserRole,
    isAuthenticated: true,
  };
}

const storedAuth = hydrateFromStorage();

const initialState: AuthState = {
  token: storedAuth.token ?? null,
  userId: storedAuth.userId ?? null,
  email: null,
  displayName: null,
  role: storedAuth.role ?? null,
  isAuthenticated: storedAuth.isAuthenticated ?? false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem(TOKEN_KEY);
      state.token = null;
      state.userId = null;
      state.email = null;
      state.displayName = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
    hydrateUser(state, action: PayloadAction<{ displayName: string; email: string }>) {
      state.displayName = action.payload.displayName;
      state.email = action.payload.email;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.userId = action.payload.userId;
        state.email = action.payload.email;
        state.displayName = action.payload.displayName;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuthError, hydrateUser } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: { auth: AuthState }) => ({
  userId: state.auth.userId,
  email: state.auth.email,
  displayName: state.auth.displayName,
  role: state.auth.role,
});
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.role === 'ADMIN';
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

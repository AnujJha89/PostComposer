

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { LocalStorageUserRepository } from '../../infrastructure/repositories/LocalStorageUserRepository';
import { LocalStoragePostRepository } from '../../infrastructure/repositories/LocalStoragePostRepository';
import { LocalStoragePlatformRepository } from '../../infrastructure/repositories/LocalStoragePlatformRepository';
import { PlatformConfiguration } from '../../domain/entities/PlatformConfiguration';
import { ALL_PLATFORMS } from '../../domain/value-objects/Platform';
import type { Platform } from '../../domain/value-objects/Platform';
import type { UserSummaryDTO } from '../../application/dtos';

interface PlatformStatus {
  platform: Platform;
  isEnabled: boolean;
  updatedAt: string;
}

interface AdminMetrics {
  totalUsers: number;
  totalPosts: number;
  scheduledPosts: number;
  draftPosts: number;
  publishedPosts: number;
}

interface AdminState {
  platformStatuses: PlatformStatus[];
  users: UserSummaryDTO[];
  metrics: AdminMetrics;
  isLoading: boolean;
  error: string | null;
  togglingPlatform: Platform | null;
}

const userRepo = new LocalStorageUserRepository();
const postRepo = new LocalStoragePostRepository();
const platformRepo = new LocalStoragePlatformRepository();

export const fetchAdminDataThunk = createAsyncThunk('admin/fetchData', async (_, { rejectWithValue }) => {
  try {
    const [users, posts, platforms] = await Promise.all([
      userRepo.findAll(),
      postRepo.findAll(),
      platformRepo.findAll(),
    ]);

    const activePosts = posts.filter((p) => !p.isDeleted);

    const userSummaries: UserSummaryDTO[] = await Promise.all(
      users.map(async (user) => {
        const userPosts = activePosts.filter((p) => p.authorId === user.id);
        return {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt.toISOString(),
          postCount: userPosts.length,
          scheduledPostCount: userPosts.filter((p) => p.status === 'SCHEDULED').length,
        };
      })
    );

    const platformStatuses: PlatformStatus[] = platforms.map((p) => ({
      platform: p.platform,
      isEnabled: p.isEnabled,
      updatedAt: p.updatedAt.toISOString(),
    }));

    const metrics: AdminMetrics = {
      totalUsers: users.length,
      totalPosts: activePosts.length,
      scheduledPosts: activePosts.filter((p) => p.status === 'SCHEDULED').length,
      draftPosts: activePosts.filter((p) => p.status === 'DRAFT').length,
      publishedPosts: activePosts.filter((p) => p.status === 'PUBLISHED').length,
    };

    return { userSummaries, platformStatuses, metrics };
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to load admin data.');
  }
});

export const togglePlatformThunk = createAsyncThunk<
  PlatformStatus,
  { platform: Platform; adminId: string }
>('admin/togglePlatform', async ({ platform, adminId }, { rejectWithValue }) => {
  try {
    let config = await platformRepo.findByPlatform(platform);
    if (!config) {
      config = PlatformConfiguration.createDefault(platform, adminId);
    }
    config.toggle(adminId);
    await platformRepo.save(config);
    return {
      platform,
      isEnabled: config.isEnabled,
      updatedAt: config.updatedAt.toISOString(),
    };
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to toggle platform.');
  }
});

const initialState: AdminState = {
  platformStatuses: ALL_PLATFORMS.map((p) => ({
    platform: p,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  })),
  users: [],
  metrics: {
    totalUsers: 0,
    totalPosts: 0,
    scheduledPosts: 0,
    draftPosts: 0,
    publishedPosts: 0,
  },
  isLoading: false,
  error: null,
  togglingPlatform: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAdminDataThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminDataThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload.userSummaries;
      state.platformStatuses = action.payload.platformStatuses;
      state.metrics = action.payload.metrics;
    });
    builder.addCase(fetchAdminDataThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(togglePlatformThunk.pending, (state, action) => {
      state.togglingPlatform = action.meta.arg.platform;
    });
    builder.addCase(togglePlatformThunk.fulfilled, (state, action) => {
      state.togglingPlatform = null;
      const idx = state.platformStatuses.findIndex((p) => p.platform === action.payload.platform);
      if (idx >= 0) state.platformStatuses[idx] = action.payload;
    });
    builder.addCase(togglePlatformThunk.rejected, (state, action) => {
      state.togglingPlatform = null;
      state.error = action.payload as string;
    });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;

export const selectPlatformStatuses = (state: { admin: AdminState }) => state.admin.platformStatuses;
export const selectAdminUsers = (state: { admin: AdminState }) => state.admin.users;
export const selectAdminMetrics = (state: { admin: AdminState }) => state.admin.metrics;
export const selectAdminLoading = (state: { admin: AdminState }) => state.admin.isLoading;
export const selectTogglingPlatform = (state: { admin: AdminState }) => state.admin.togglingPlatform;

export const selectDisabledPlatforms = createSelector(
  [selectPlatformStatuses],
  (platformStatuses) => platformStatuses.filter((p) => !p.isEnabled).map((p) => p.platform)
);

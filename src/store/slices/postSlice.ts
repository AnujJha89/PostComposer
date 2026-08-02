import {
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { CreatePostUseCase } from "../../application/use-cases/CreatePostUseCase";
import { UpdatePostUseCase } from "../../application/use-cases/UpdatePostUseCase";
import { DeletePostUseCase } from "../../application/use-cases/DeletePostUseCase";
import { SchedulePostUseCase } from "../../application/use-cases/SchedulePostUseCase";
import { ValidatePlatformConstraintsUseCase } from "../../application/use-cases/ValidatePlatformConstraintsUseCase";
import { LocalStoragePostRepository } from "../../infrastructure/repositories/LocalStoragePostRepository";
import type {
  PostResponseDTO,
  CreatePostRequestDTO,
  UpdatePostRequestDTO,
} from "../../application/dtos";
import type { Platform } from "../../domain/value-objects/Platform";
import type { MediaFileProps } from "../../domain/entities/MediaFile";
import type { PlatformViolation } from "../../domain/services/PlatformConstraintService";
import { PUBLISH_NOW_SENTINEL } from "../../domain/value-objects/ScheduleTime";

export interface ComposerState {
  id: string | null;
  title: string;
  content: string;
  platforms: Platform[];
  mediaFiles: MediaFileProps[];
  scheduleTime: string;
  violations: PlatformViolation[];
  isValid: boolean;
  characterUsage: Record<
    string,
    { used: number; limit: number; percentage: number }
  >;
}

interface PostState {
  composer: ComposerState;
  posts: ReturnType<typeof postsAdapter.getInitialState>;
  isLoadingList: boolean;
  isSubmitting: boolean;
  listError: string | null;
  submitError: string | null;
  submitSuccess: string | null;
}

const repo = new LocalStoragePostRepository();
const createUC = new CreatePostUseCase(repo);
const updateUC = new UpdatePostUseCase(repo);
const deleteUC = new DeletePostUseCase(repo);
const scheduleUC = new SchedulePostUseCase(repo);
const validateUC = new ValidatePlatformConstraintsUseCase();
const postsAdapter = createEntityAdapter<PostResponseDTO>({
  
  sortComparer: (a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
});

export const fetchPostsThunk = createAsyncThunk<
  PostResponseDTO[],
  { authorId: string; isAdmin: boolean }
>("posts/fetchAll", async ({ authorId, isAdmin }, { rejectWithValue }) => {
  try {
    let raw;
    if (isAdmin) {
      raw = await repo.findAll();
    } else {
      raw = await repo.findByAuthorId(authorId);
    }
    return raw
      .filter((p) => !p.isDeleted)
      .map((p) => p.toPlainObject())
      .map((p) => ({
        id: p.id,
        authorId: p.authorId,
        title: p.title,
        content: p.content,
        contentPreview:
          p.content.slice(0, 120) + (p.content.length > 120 ? "..." : ""),
        platforms: p.platforms,
        mediaFiles: p.mediaFiles,
        scheduleTime: p.scheduleTime,
        scheduleTimeLabel:
          p.scheduleTime === PUBLISH_NOW_SENTINEL
            ? "Publish Now"
            : new Date(p.scheduleTime).toLocaleString(),
        status: p.status,
        isDeleted: p.isDeleted,
        failureReason: p.failureReason,
        createdAt: (p.createdAt as Date).toISOString(),
        updatedAt: (p.updatedAt as Date).toISOString(),
      }));
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : "Failed to load posts.",
    );
  }
});

export const createPostThunk = createAsyncThunk<
  PostResponseDTO,
  CreatePostRequestDTO
>("posts/create", async (request, { rejectWithValue }) => {
  try {
    return await createUC.execute(request);
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : "Failed to create post.",
    );
  }
});

export const updatePostThunk = createAsyncThunk<
  PostResponseDTO,
  UpdatePostRequestDTO
>("posts/update", async (request, { rejectWithValue }) => {
  try {
    return await updateUC.execute(request);
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : "Failed to update post.",
    );
  }
});

export const deletePostThunk = createAsyncThunk<
  string,
  { postId: string; requesterId: string }
>("posts/delete", async ({ postId, requesterId }, { rejectWithValue }) => {
  try {
    await deleteUC.execute({ postId, requesterId });
    return postId;
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : "Failed to delete post.",
    );
  }
});

export const schedulePostThunk = createAsyncThunk<
  PostResponseDTO,
  { postId: string; requesterId: string }
>("posts/schedule", async ({ postId, requesterId }, { rejectWithValue }) => {
  try {
    const result = await scheduleUC.execute({ postId, requesterId });

    if (result.status === "PUBLISHED") {
      const res = await fetch("http://localhost:3001/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: result.content,
          platforms: result.platforms,
        }),
      });
      const data = await res.json();

      if (data.results) {
        const failures = Object.entries(data.results)
          .filter(([_, r]: any) => r.status === "failed")
          .map(([plat, r]: any) => `${plat}: ${r.error}`)
          .join(" | ");

        if (failures) {
          throw new Error(`Publish failed on some platforms: ${failures}`);
        }
      }
    }

    return result;
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : "Failed to schedule/publish post.",
    );
  }
});

const initialComposer: ComposerState = {
  id: null,
  title: "",
  content: "",
  platforms: [],
  mediaFiles: [],
  scheduleTime: PUBLISH_NOW_SENTINEL,
  violations: [],
  isValid: false,
  characterUsage: {},
};

const initialState: PostState = {
  composer: initialComposer,
  posts: postsAdapter.getInitialState(),
  isLoadingList: false,
  isSubmitting: false,
  listError: null,
  submitError: null,
  submitSuccess: null,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setComposerTitle(state, action: PayloadAction<string>) {
      state.composer.title = action.payload;
    },
    setComposerContent(state, action: PayloadAction<string>) {
      state.composer.content = action.payload;

      const result = validateUC.execute({
        contentLength: action.payload.length,
        platforms: state.composer.platforms,
        mediaFiles: state.composer.mediaFiles,
      });
      state.composer.violations = result.violations;
      state.composer.isValid =
        result.isValid && state.composer.platforms.length > 0;
      state.composer.characterUsage = result.characterUsage as Record<
        string,
        { used: number; limit: number; percentage: number }
      >;
    },
    setComposerPlatforms(state, action: PayloadAction<Platform[]>) {
      state.composer.platforms = action.payload;
      const result = validateUC.execute({
        contentLength: state.composer.content.length,
        platforms: action.payload,
        mediaFiles: state.composer.mediaFiles,
      });
      state.composer.violations = result.violations;
      state.composer.isValid = result.isValid && action.payload.length > 0;
      state.composer.characterUsage = result.characterUsage as Record<
        string,
        { used: number; limit: number; percentage: number }
      >;
    },
    setComposerMediaFiles(state, action: PayloadAction<MediaFileProps[]>) {
      state.composer.mediaFiles = action.payload;
      const result = validateUC.execute({
        contentLength: state.composer.content.length,
        platforms: state.composer.platforms,
        mediaFiles: action.payload,
      });
      state.composer.violations = result.violations;
      state.composer.isValid =
        result.isValid && state.composer.platforms.length > 0;
    },
    setComposerScheduleTime(state, action: PayloadAction<string>) {
      state.composer.scheduleTime = action.payload;
    },
    loadPostIntoComposer(state, action: PayloadAction<PostResponseDTO>) {
      const post = action.payload;
      state.composer = {
        id: post.id,
        title: post.title,
        content: post.content,
        platforms: post.platforms,
        mediaFiles: post.mediaFiles,
        scheduleTime: post.scheduleTime,
        violations: [],
        isValid: true,
        characterUsage: {},
      };
    },
    resetComposer(state) {
      state.composer = { ...initialComposer };
      state.submitError = null;
      state.submitSuccess = null;
    },
    clearSubmitError(state) {
      state.submitError = null;
    },
    clearSubmitSuccess(state) {
      state.submitSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPostsThunk.pending, (state) => {
      state.isLoadingList = true;
      state.listError = null;
    });
    builder.addCase(fetchPostsThunk.fulfilled, (state, action) => {
      state.isLoadingList = false;
      postsAdapter.setAll(state.posts, action.payload);
    });
    builder.addCase(fetchPostsThunk.rejected, (state, action) => {
      state.isLoadingList = false;
      state.listError = action.payload as string;
    });

    builder.addCase(createPostThunk.pending, (state) => {
      state.isSubmitting = true;
      state.submitError = null;
    });
    builder.addCase(createPostThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      postsAdapter.addOne(state.posts, action.payload);
      state.composer = { ...initialComposer };
      state.submitSuccess = "Post saved as draft successfully!";
    });
    builder.addCase(createPostThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.submitError = action.payload as string;
    });

    builder.addCase(updatePostThunk.pending, (state) => {
      state.isSubmitting = true;
      state.submitError = null;
    });
    builder.addCase(updatePostThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      postsAdapter.upsertOne(state.posts, action.payload);

      state.composer = { ...initialComposer };
      state.submitSuccess = "Post updated successfully!";
    });
    builder.addCase(updatePostThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.submitError = action.payload as string;
    });

    builder.addCase(deletePostThunk.fulfilled, (state, action) => {
      postsAdapter.removeOne(state.posts, action.payload);
    });

    builder.addCase(schedulePostThunk.fulfilled, (state, action) => {
      postsAdapter.upsertOne(state.posts, action.payload);
      state.submitSuccess = "Post scheduled successfully!";
    });
    builder.addCase(schedulePostThunk.rejected, (state, action) => {
      state.submitError = action.payload as string;
    });
  },
});

export const {
  setComposerTitle,
  setComposerContent,
  setComposerPlatforms,
  setComposerMediaFiles,
  setComposerScheduleTime,
  loadPostIntoComposer,
  resetComposer,
  clearSubmitError,
  clearSubmitSuccess,
} = postSlice.actions;

export default postSlice.reducer;

const postSelectors = postsAdapter.getSelectors<{ posts: PostState }>(
  (state) => state.posts.posts,
);

export const selectComposer = (state: { posts: PostState }) =>
  state.posts.composer;

export const selectAllPosts = postSelectors.selectAll;

export const selectPostById = postSelectors.selectById;
export const selectPostIds = postSelectors.selectIds;
export const selectPostEntities = postSelectors.selectEntities;
export const selectTotalPosts = postSelectors.selectTotal;

export const selectIsSubmitting = (state: { posts: PostState }) =>
  state.posts.isSubmitting;

export const selectSubmitError = (state: { posts: PostState }) =>
  state.posts.submitError;

export const selectSubmitSuccess = (state: { posts: PostState }) =>
  state.posts.submitSuccess;

export const selectIsLoadingList = (state: { posts: PostState }) =>
  state.posts.isLoadingList;

export const selectScheduledPosts = createSelector([selectAllPosts], (posts) =>
  posts.filter((p) => p.status === "SCHEDULED"),
);
export const selectDraftPosts = createSelector([selectAllPosts], (posts) =>
  posts.filter((p) => p.status === "DRAFT"),
);

export const selectPostsByStatus = createSelector(
  [selectAllPosts, (_state: { posts: PostState }, status: string) => status],
  (posts, status) => {
    if (status === "ALL") return posts;
    return posts.filter((p) => p.status === status);
  },
);

export const selectPostsForCalendar = createSelector(
  [selectAllPosts],
  (posts) => {
    const scheduled = posts.filter((p) => p.status === "SCHEDULED");
    return scheduled.reduce(
      (acc, post) => {
        if (post.scheduleTime && post.scheduleTime !== "PUBLISH_NOW") {
          const dateKey = post.scheduleTime.split("T")[0];
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(post);
        }
        return acc;
      },
      {} as Record<string, typeof posts>,
    );
  },
);

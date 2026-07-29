

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import adminReducer from './slices/adminSlice';
import socialTokensReducer from './slices/socialTokensSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    admin: adminReducer,
    socialTokens: socialTokensReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        
        ignoredActions: ['posts/fetchAll/fulfilled', 'admin/fetchData/fulfilled'],
        ignoredPaths: ['posts.posts'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

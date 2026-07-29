import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../index';

interface ConnectionStatus {
  twitter: { connected: boolean; username: string | null };
  linkedin: { connected: boolean; name: string | null };
  facebook: { connected: boolean; pages: { id: string; name: string }[] };
}

interface SocialTokensState {
  connections: ConnectionStatus;
  isLoading: boolean;
  error: string | null;
}

const initialState: SocialTokensState = {
  connections: {
    twitter: { connected: false, username: null },
    linkedin: { connected: false, name: null },
    facebook: { connected: false, pages: [] },
  },
  isLoading: false,
  error: null,
};

export const fetchConnectionsThunk = createAsyncThunk(
  'socialTokens/fetch',
  async () => {
    const res = await fetch('http://localhost:3001/connections', { credentials: 'omit' }); 
    
    const authRes = await fetch('http://localhost:3001/connections', { credentials: 'include' });
    if (!authRes.ok) throw new Error('Failed to fetch connections');
    return authRes.json();
  }
);

export const disconnectPlatformThunk = createAsyncThunk(
  'socialTokens/disconnect',
  async (platform: 'twitter' | 'linkedin' | 'facebook', { dispatch }) => {
    await fetch(`http://localhost:3001/disconnect/${platform}`, { method: 'POST', credentials: 'include' });
    dispatch(fetchConnectionsThunk());
  }
);

export const socialTokensSlice = createSlice({
  name: 'socialTokens',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnectionsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConnectionsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connections = action.payload;
      })
      .addCase(fetchConnectionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch connections';
      });
  },
});

export const selectSocialConnections = (state: RootState) => state.socialTokens.connections;
export const selectSocialLoading = (state: RootState) => state.socialTokens.isLoading;

export default socialTokensSlice.reducer;

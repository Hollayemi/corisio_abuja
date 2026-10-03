import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * A copy of the next-auth session's access token, so axiosBaseQuery can read
 * it synchronously. It is filled in by <SessionSync /> in redux/provider.tsx.
 */
export type SessionState = {
  status: "loading" | "authenticated" | "unauthenticated";
  accessToken: string | null;
};

const initialState: SessionState = { status: "loading", accessToken: null };

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    sessionChanged: (_state, action: PayloadAction<SessionState>) => action.payload,
  },
});

export const { sessionChanged } = sessionSlice.actions;
export default sessionSlice.reducer;

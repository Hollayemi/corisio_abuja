import { configureStore } from "@reduxjs/toolkit";
import baseApi from "./slices/baseApi";
import cartReducer from "./slices/cartSlice";
import sessionReducer from "./slices/sessionSlice";

/**
 * A new store is created per browser session by <ReduxProvider />
 * (the pattern recommended for the Next.js App Router), never a shared global.
 */
export const makeStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      cart: cartReducer,
      session: sessionReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

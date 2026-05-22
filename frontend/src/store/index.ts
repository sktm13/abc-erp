import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "../slices/loginSlice";

const store = configureStore({
  reducer: {
    loginSlice,
  },
});

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;

export default store;
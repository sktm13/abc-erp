// 로그인 API 결과를 Redux 상태에 저장, 쿠키에 저장

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { loginPost } from "../api/memberApi";
import { removeCookie, setCookie } from "../util/cookieUtil";
import type { LoginInfo } from "../types/member";

const initState: LoginInfo = {
  employeeNo: "",
  email: "",
  name: "",
  department: "",
  status: "",
  presenceStatus: "OFFLINE",
  roleNames: [],
  accessToken: "",
  refreshToken: "",
  loginStatus: "",
  loginErrorMessage: "",
};

export const loginPostAsync = createAsyncThunk<
  LoginInfo,
  { employeeNo: string; pw: string },
  { rejectValue: string }
>(
  "loginPostAsync",
  async (
    { employeeNo, pw },
    { rejectWithValue }
  ) => {
    try {
      return await loginPost(employeeNo, pw);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const message =
          e.response?.data?.message ||
          e.response?.data?.error ||
          "로그인에 실패했습니다.";

        return rejectWithValue(message);
      }

      return rejectWithValue("로그인에 실패했습니다.");
    }
  }
);

const loginSlice = createSlice({
  name: "loginSlice",
  initialState: initState,

  reducers: {
    // 새로고침 시 쿠키 데이터를 Redux에 다시 저장
    save: (_state, action) => {
      const payload = action.payload;

      const newState = {
        ...payload,
        loginStatus: "saved",
        loginErrorMessage: "",
      };

      setCookie("member", JSON.stringify(newState), 1);

      return newState;
    },

    // 로그아웃
    logout: () => {
      removeCookie("member");

      return { ...initState };
    },

    reset: () => {
      return { ...initState };
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginPostAsync.pending, (state) => {
        state.loginStatus = "pending";
        state.loginErrorMessage = "";
      })

      .addCase(loginPostAsync.fulfilled, (_state, action) => {
        const newState: LoginInfo = {
          ...action.payload,
          loginStatus: "fulfilled",
          loginErrorMessage: "",
        };

        setCookie("member", JSON.stringify(newState), 1);

        return newState;
      })

      .addCase(loginPostAsync.rejected, (state, action) => {
        state.loginStatus = "rejected";
        state.loginErrorMessage =
          action.payload || "로그인에 실패했습니다.";
      });
  },
});

export const { save, logout, reset } = loginSlice.actions;

export default loginSlice.reducer;
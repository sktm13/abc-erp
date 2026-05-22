//로그인 API 결과를 Redux 상태에 저장, 쿠키에 저장

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginPost } from "../api/memberApi";
import { removeCookie, setCookie } from "../util/cookieUtil";
import type { LoginInfo } from "../types/member";

const initState: LoginInfo = {
    employeeNo: "",
    email: "",
    name: "",
    department: "",
    status: "",
    roleNames: [],
    accessToken: "",
    refreshToken: "",
    loginStatus: "",
};

export const loginPostAsync = createAsyncThunk(
    "loginPostAsync",
    async ({ employeeNo, pw }: { employeeNo: string; pw: string }) => {
        return await loginPost(employeeNo, pw);
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
            })

            .addCase(loginPostAsync.fulfilled, (_state, action) => {
                const newState: LoginInfo = {
                    ...action.payload,
                    loginStatus: "fulfilled",
                };

                setCookie("member", JSON.stringify(newState), 1);

                return newState;
            })

            .addCase(loginPostAsync.rejected, (state) => {
                state.loginStatus = "rejected";
            });
    },
});

export const { save, logout, reset } = loginSlice.actions;

export default loginSlice.reducer;
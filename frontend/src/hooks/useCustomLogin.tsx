import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../store";
import { loginPostAsync, logout, save } from "../slices/loginSlice";
import { getCookie } from "../util/cookieUtil";

const useCustomLogin = () => {
    const dispatch = useDispatch<AppDispatch>();

    const navigate = useNavigate();

    const loginState = useSelector(
        (state: RootState) => state.loginSlice
    );

    const loginStatus = loginState.loginStatus;

    const isLogin =
        loginStatus === "fulfilled" ||
        loginStatus === "saved";

    useEffect(() => {
        if (!isLogin) {
            const cookieData = getCookie("member");

            if (cookieData) {
                dispatch(save(cookieData));
            }
        }
    }, []);

    const doLogin = async (
        employeeNo: string,
        pw: string
    ) => {
        dispatch(loginPostAsync({ employeeNo, pw }));
    };

    const doLogout = () => {
        dispatch(logout());
    };

    const moveToLogin = () => {
        navigate("/member/login");
    };

    const moveToLoginReturn = () => {
        return <Navigate replace to = "/member/login" />;
    };

    const moveToPath = (path: string) => {
        navigate({ pathname: path }, { replace: true });
    };

    return {
        loginState,
        loginStatus,
        isLogin,
        doLogin,
        doLogout,
        moveToLogin,
        moveToLoginReturn,
        moveToPath,
    };
};

export default useCustomLogin;
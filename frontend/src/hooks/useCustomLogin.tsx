import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../store";
import type { LoginInfo } from "../types/member";

import { loginPostAsync, logout, save } from "../slices/loginSlice";
import { getCookie } from "../util/cookieUtil";

const useCustomLogin = () => {
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();

  const loginState = useSelector(
    (state: RootState) => state.loginSlice
  );

  const loginStatus = loginState.loginStatus;

  const isReduxLogin =
    loginStatus === "fulfilled" ||
    loginStatus === "saved";

  const cookieData = getCookie("member");

  const hasLoginCookie =
    !!cookieData?.accessToken;

  const isLogin =
    isReduxLogin || hasLoginCookie;

  const isRestoring =
    !isReduxLogin && hasLoginCookie;

  useEffect(() => {
    if (!isReduxLogin) {
      const cookieData = getCookie("member");

      if (cookieData) {
        dispatch(save(cookieData));
      }
    }
  }, [dispatch, isReduxLogin]);

  const doLogin = async (
    employeeNo: string,
    pw: string
  ) => {
    dispatch(loginPostAsync({ employeeNo, pw }));
  };

  const doLogout = () => {
    dispatch(logout());
  };

  const doSave = (memberInfo: LoginInfo) => {
    dispatch(save(memberInfo));
  };

  const moveToLogin = () => {
    navigate("/member/login");
  };

  const moveToLoginReturn = () => {
    return <Navigate replace to="/member/login" />;
  };

  const moveToPath = (path: string) => {
    navigate({ pathname: path }, { replace: true });
  };

  return {
    loginState,
    loginStatus,
    isLogin,
    isRestoring,
    doLogin,
    doLogout,
    doSave,
    moveToLogin,
    moveToLoginReturn,
    moveToPath,
  };
};

export default useCustomLogin;
import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { getCookie, setCookie } from "../util/cookieUtil";

const API_SERVER_HOST = import.meta.env.VITE_API_SERVER;

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface MemberCookieValue {
  accessToken: string;
  refreshToken: string;
  [key: string]: unknown;
}

const jwtAxios = axios.create({
  baseURL: API_SERVER_HOST,
});

const refreshJWT = async (refreshToken: string) => {
  const res = await axios.get(
    `${API_SERVER_HOST}/api/auth/refresh`,
    {
      params: {
        refreshToken,
      },
    }
  );

  return res.data;
};

const beforeRequest = (
  config: InternalAxiosRequestConfig
) => {
  const memberInfo = getCookie("member") as MemberCookieValue | undefined;

  if (!memberInfo) {
    return Promise.reject(new Error("REQUIRE_LOGIN"));
  }

  config.headers.Authorization =
    `Bearer ${memberInfo.accessToken}`;

  return config;
};

const requestFail = (error: AxiosError) => {
  return Promise.reject(error);
};

const saveNewTokenAndRetry = async (
  originalRequest: RetryRequestConfig
) => {
  const memberCookieValue = getCookie("member") as
    | MemberCookieValue
    | undefined;

  if (!memberCookieValue?.refreshToken) {
    return Promise.reject(new Error("REQUIRE_LOGIN"));
  }

  const result = await refreshJWT(
    memberCookieValue.refreshToken
  );

  const newMemberInfo = {
    ...memberCookieValue,
    ...result,
    loginStatus: "saved",
  };

  setCookie(
    "member",
    JSON.stringify(newMemberInfo),
    1
  );

  originalRequest.headers.Authorization =
    `Bearer ${result.accessToken}`;

  return jwtAxios(originalRequest);
};

const beforeResponse = async (
  response: AxiosResponse
): Promise<AxiosResponse> => {
  const data = response.data;

  if (data && data.error === "ERROR_ACCESS_TOKEN") {
    const originalRequest = response.config as RetryRequestConfig;

    if (originalRequest._retry) {
      return response;
    }

    originalRequest._retry = true;

    return saveNewTokenAndRetry(originalRequest);
  }

  return response;
};

const responseFail = async (error: AxiosError) => {
  const originalRequest = error.config as RetryRequestConfig | undefined;

  if (!originalRequest) {
    return Promise.reject(error);
  }

  if (originalRequest._retry) {
    return Promise.reject(error);
  }

  const status = error.response?.status;

  const data = error.response?.data as
    | {
        error?: string;
        message?: string;
      }
    | string
    | undefined;

  const errorText =
    typeof data === "string"
      ? data
      : `${data?.error || ""} ${data?.message || ""}`;

  const isAccessTokenExpired =
    status === 401 ||
    errorText.includes("Expired") ||
    errorText.includes("ERROR_ACCESS_TOKEN");

  if (!isAccessTokenExpired) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  try {
    return await saveNewTokenAndRetry(originalRequest);
  } catch (refreshError) {
    return Promise.reject(refreshError);
  }
};

jwtAxios.interceptors.request.use(
  beforeRequest,
  requestFail
);

jwtAxios.interceptors.response.use(
  beforeResponse,
  responseFail
);

export default jwtAxios;
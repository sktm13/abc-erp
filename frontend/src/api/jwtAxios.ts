import axios, {
    type AxiosError,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from "axios";

import { getCookie, setCookie } from "../util/cookieUtil";

const API_SERVER_HOST = import.meta.env.VITE_API_SERVER;

const jwtAxios = axios.create({
    baseURL: API_SERVER_HOST,
});

const refreshJWT = async (
    refreshToken: string
) => {
    const res = await axios.get(
        `${API_SERVER_HOST}/api/auth/refresh?refreshToken=${refreshToken}`
    );

    return res.data;
};

const beforeRequest = (
    config: InternalAxiosRequestConfig
) => {
    const memberInfo = getCookie("member");

    if (!memberInfo) {
        return Promise.reject(new Error("REQUIRE_LOGIN"));
    }

    const { accessToken } = memberInfo;

    config.headers.Authorization =
        `Bearer ${accessToken}`;

    return config;
};

const requestFail = (error: AxiosError) => {
    return Promise.reject(error);
};

const beforeResponse = async (
    response: AxiosResponse
): Promise<AxiosResponse> => {
    const data = response.data;

    if (data && data.error === "ERROR_ACCESS_TOKEN") {
        const memberCookieValue = getCookie("member");

        if (!memberCookieValue) {
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

        const originalRequest = response.config;

        originalRequest.headers.Authorization =
            `Bearer ${result.accessToken}`;

        return await jwtAxios(originalRequest);
    }

    return response;
};

const responseFail = async (error: AxiosError) => {
    return Promise.reject(error);
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
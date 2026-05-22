export const setCookie = (
    name: string,
    value: string,
    days: number
) => {
    const expires = new Date();

    expires.setUTCDate(expires.getUTCDate() + days);

    document.cookie =
        `${name}=${encodeURIComponent(value)};` +
        `expires=${expires.toUTCString()};` +
        `path=/`;
};

export const getCookie = (name: string) => {
    const cookie = document.cookie;

    const cookieList = cookie.split("; ");

    const targetCookie = cookieList.find((c) =>
        c.startsWith(`${name}=`)
    );

    if (!targetCookie) {
        return null;
    }

    const value = targetCookie.split("=")[1];

    try {
        return JSON.parse(decodeURIComponent(value));
    } catch {
        return decodeURIComponent(value);
    }
};

export const removeCookie = (name: string) => {
    document.cookie =
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};
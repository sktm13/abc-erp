import jwtAxios from "./jwtAxios";
import type {
  NoticeDetail,
  NoticeList,
  NoticeModifyRequest,
  NoticeRequest,
} from "../types/notice";

export const registerNotice = async (
  data: NoticeRequest,
  files: File[]
): Promise<{ noticeId: number }> => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("content", data.content);
  formData.append("scope", data.scope);

  if (data.scope === "DEPARTMENT" && data.targetDepartment) {
    formData.append("targetDepartment", data.targetDepartment);
  }

  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await jwtAxios.post("/api/notices", formData);

  return res.data;
};

export const modifyNotice = async (
  noticeId: number,
  data: NoticeModifyRequest
): Promise<{ noticeId: number }> => {
  const res = await jwtAxios.put(`/api/notices/${noticeId}`, data);

  return res.data;
};

export const deleteNotice = async (
  noticeId: number
): Promise<{ result: string }> => {
  const res = await jwtAxios.delete(`/api/notices/${noticeId}`);

  return res.data;
};

export const getAllNotices = async (
  keyword?: string
): Promise<NoticeList[]> => {
  const res = await jwtAxios.get("/api/notices/all", {
    params: {
      keyword,
    },
  });

  return res.data;
};

export const getDepartmentNotices = async (
  keyword?: string
): Promise<NoticeList[]> => {
  const res = await jwtAxios.get("/api/notices/department", {
    params: {
      keyword,
    },
  });

  return res.data;
};

export const getUnreadNotices = async (): Promise<NoticeList[]> => {
  const res = await jwtAxios.get("/api/notices/unread/me");

  return res.data;
};

export const getNoticeDetail = async (
  noticeId: number
): Promise<NoticeDetail> => {
  const res = await jwtAxios.get(`/api/notices/${noticeId}`);

  return res.data;
};

export const downloadNoticeFile = async (
  fileId: number,
  originalFileName: string
) => {
  const res = await jwtAxios.get(
    `/api/notices/files/${fileId}/download`,
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");

  link.href = url;
  link.download = originalFileName;
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};
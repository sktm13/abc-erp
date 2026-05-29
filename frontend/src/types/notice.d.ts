export type NoticeScope = "ALL" | "DEPARTMENT";

export interface NoticeList {
  id: number;
  title: string;
  scope: NoticeScope;
  targetDepartment: string | null;
  writerEmployeeNo: string;
  writerName: string;
  createdAt: string;
  updatedAt: string;
  read: boolean;
  fileCount: number;
}

export interface NoticeFile {
  id: number;
  originalFileName: string;
  storedFileName: string;
  contentType: string;
  fileSize: number;
  downloadUrl: string;
}

export interface NoticeDetail {
  id: number;
  title: string;
  content: string;
  scope: NoticeScope;
  targetDepartment: string | null;
  writerEmployeeNo: string;
  writerName: string;
  createdAt: string;
  updatedAt: string;
  read: boolean;
  files: NoticeFile[];
}

export interface NoticeRequest {
  title: string;
  content: string;
  scope: NoticeScope;
  targetDepartment?: string;
}

export interface NoticeModifyRequest {
  title: string;
  content: string;
}
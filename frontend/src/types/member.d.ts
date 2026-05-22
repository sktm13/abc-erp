export interface LoginInfo {
  employeeNo: string;
  email: string;
  name: string;
  department: string;
  status: string;
  roleNames: string[];
  accessToken: string;
  refreshToken: string;

  loginStatus?: string;
}

export interface MemberResponse {
  employeeNo: string;
  email: string;
  name: string;
  department: string;
  status: "ACTIVE" | "LEAVE" | "RESIGNED";
  roleNames: string[];
}

export interface MemberSearchParams {
  page?: number;
  size?: number;
  keyword?: string;
  department?: string;
  status?: string;
  role?: string;
}

export interface PageResponse<T> {
  dtoList: T[];
  pageNumList: number[];
  pageRequestDTO: {
    page: number;
    size: number;
    keyword?: string;
    department?: string;
    status?: string;
    role?: string;
  };
  prev: boolean;
  next: boolean;
  totalCount: number;
  prevPage: number;
  nextPage: number;
  totalPage: number;
  current: number;
}

export interface MemberRegisterRequest {
  email: string;
  pw: string;
  name: string;
  department: string;
}

export interface MemberRegisterResponse {
  employeeNo: string;
}
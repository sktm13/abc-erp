import axios from "axios";
import jwtAxios from "./jwtAxios";
import type {
  LoginInfo,
  MemberResponse,
  MemberSearchParams,
  PageResponse,
  MemberRegisterRequest,
  MemberRegisterResponse,
} from "../types/member";

const API_SERVER_HOST = import.meta.env.VITE_API_SERVER;

export const loginPost = async (
  employeeNo: string,
  pw: string
): Promise<LoginInfo> => {
  const params = new URLSearchParams();

  params.append("username", employeeNo);
  params.append("password", pw);

  const res = await axios.post(
    `${API_SERVER_HOST}/api/member/login`,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return res.data;
};

export const getMemberList = async (
  params: MemberSearchParams
): Promise<PageResponse<MemberResponse>> => {
  const res = await jwtAxios.get("/api/member/list", {
    params,
  });

  return res.data;
};

export const registerMember = async (
  data: MemberRegisterRequest
): Promise<MemberRegisterResponse> => {
  const res = await jwtAxios.post("/api/member/register", data);

  return res.data;
};
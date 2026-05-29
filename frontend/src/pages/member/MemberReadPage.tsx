import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMember } from "../../api/memberApi";
import useCustomLogin from "../../hooks/useCustomLogin";
import type { MemberResponse } from "../../types/member";

const departmentText = (department: string) => {
  if (department === "DEV") return "개발팀";
  if (department === "HR") return "인사팀";
  if (department === "PUR") return "구매팀";
  if (department === "FIN") return "재무팀";
  if (department === "OPS") return "운영팀";

  return department;
};

const statusText = (status: string) => {
  if (status === "ACTIVE") return "재직";
  if (status === "LEAVE") return "휴직";
  if (status === "RESIGNED") return "퇴사";

  return status;
};

const presenceText = (presenceStatus?: string) => {
  if (presenceStatus === "ONLINE") return "온라인";
  if (presenceStatus === "AWAY") return "자리비움";
  if (presenceStatus === "OFFLINE") return "오프라인";

  return "오프라인";
};

const getHighestRole = (roleNames: string[]) => {
  if (roleNames.includes("ADMIN")) return "ADMIN";
  if (roleNames.includes("MANAGER")) return "MANAGER";

  return "EMPLOYEE";
};

const roleText = (role: string) => {
  if (role === "ADMIN") return "관리자";
  if (role === "MANAGER") return "팀장급";
  if (role === "EMPLOYEE") return "사원";

  return role;
};

const statusClass = (status: string) => {
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-600";
  if (status === "LEAVE") return "bg-amber-50 text-amber-600";
  if (status === "RESIGNED") return "bg-slate-100 text-slate-500";

  return "bg-slate-100 text-slate-500";
};

const presenceClass = (presenceStatus?: string) => {
  if (presenceStatus === "ONLINE") return "bg-emerald-50 text-emerald-600";
  if (presenceStatus === "AWAY") return "bg-amber-50 text-amber-600";
  if (presenceStatus === "OFFLINE") return "bg-slate-100 text-slate-500";

  return "bg-slate-100 text-slate-500";
};

const roleClass = (role: string) => {
  if (role === "ADMIN") return "bg-purple-50 text-purple-600";
  if (role === "MANAGER") return "bg-blue-50 text-blue-600";

  return "bg-slate-100 text-slate-600";
};

export default function MemberReadPage() {
  const { employeeNo } = useParams();

  const navigate = useNavigate();

  const { loginState } = useCustomLogin();

  const isAdmin = loginState.roleNames?.includes("ADMIN");

  const [member, setMember] = useState<MemberResponse | null>(null);

  const fetchMember = async () => {
    if (!employeeNo) {
      return;
    }

    try {
      const result = await getMember(employeeNo);

      setMember(result);
    } catch (e) {
      console.error(e);
      alert("사원 정보를 불러오지 못했습니다.");
      navigate("/member/list");
    }
  };

  useEffect(() => {
    fetchMember();
  }, [employeeNo]);

  if (!member) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  const highestRole = getHighestRole(member.roleNames);
  const firstLetter = member.name?.charAt(0) || "U";

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">사원 상세</h1>
          <p className="text-slate-400 mt-1">사원 정보를 조회합니다.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/member/list")}
            className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            목록으로
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate(`/member/modify/${member.employeeNo}`)}
              className="px-5 py-3 rounded-2xl bg-[#3B82F6] text-white font-semibold hover:bg-blue-500 transition"
            >
              수정
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-full grid grid-cols-[300px_1fr]">
          <div className="bg-slate-50 border-r border-slate-200 p-7 flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 rounded-[36px] bg-[#3B82F6] text-white flex items-center justify-center text-5xl font-bold shadow-sm mb-6">
              {firstLetter}
            </div>

            <h2 className="text-2xl font-bold text-slate-800">
              {member.name}
            </h2>

            <p className="text-sm text-slate-400 mt-2">
              {member.employeeNo}
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass(
                  member.status
                )}`}
              >
                {statusText(member.status)}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${roleClass(
                  highestRole
                )}`}
              >
                {roleText(highestRole)}
              </span>
            </div>

            <div className="mt-8 w-full rounded-2xl bg-white border border-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-1">현재 상태</p>

              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${presenceClass(
                  member.presenceStatus
                )}`}
              >
                {presenceText(member.presenceStatus)}
              </span>
            </div>
          </div>

          <div className="p-8 overflow-y-auto">
            

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4">
                <span className="text-sm font-medium text-slate-400">
                  사번
                </span>

                <span className="text-base font-semibold text-slate-800">
                  {member.employeeNo}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4">
                <span className="text-sm font-medium text-slate-400">
                  이름
                </span>

                <span className="text-base font-semibold text-slate-800">
                  {member.name}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4">
                <span className="text-sm font-medium text-slate-400">
                  이메일
                </span>

                <span className="text-base font-semibold text-slate-800">
                  {member.email}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4">
                <span className="text-sm font-medium text-slate-400">
                  부서
                </span>

                <span className="text-base font-semibold text-slate-800">
                  {departmentText(member.department)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4">
                <span className="text-sm font-medium text-slate-400">
                  재직 상태
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass(
                    member.status
                  )}`}
                >
                  {statusText(member.status)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4">
                <span className="text-sm font-medium text-slate-400">
                  현재 상태
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${presenceClass(
                    member.presenceStatus
                  )}`}
                >
                  {presenceText(member.presenceStatus)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4">
                <span className="text-sm font-medium text-slate-400">
                  권한
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${roleClass(
                    highestRole
                  )}`}
                >
                  {roleText(highestRole)}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-blue-50 border border-blue-100 px-5 py-4 text-sm text-blue-600">
              사원 정보 수정은 관리자 권한에서만 가능합니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
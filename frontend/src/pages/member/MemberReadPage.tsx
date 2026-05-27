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

      <div className="flex-1 min-h-0 bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 bg-slate-50 rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-400 mb-1">사번</p>
            <p className="text-xl font-bold text-slate-800">
              {member.employeeNo}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-400 mb-1">이름</p>
            <p className="text-lg font-semibold text-slate-800">
              {member.name}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-400 mb-1">이메일</p>
            <p className="text-lg font-semibold text-slate-800">
              {member.email}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-400 mb-1">부서</p>
            <p className="text-lg font-semibold text-slate-800">
              {departmentText(member.department)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-400 mb-2">재직 상태</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass(
                member.status
              )}`}
            >
              {statusText(member.status)}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-400 mb-2">현재 상태</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${presenceClass(
                member.presenceStatus
              )}`}
            >
              {presenceText(member.presenceStatus)}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-400 mb-2">권한</p>

            <div className="flex gap-2 flex-wrap">
              {member.roleNames.map((role) => (
                <span
                  key={role}
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${roleClass(
                    role
                  )}`}
                >
                  {roleText(role)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 text-sm text-slate-400">
          사원 정보 수정은 관리자 권한에서만 가능합니다.
        </div>
      </div>
    </div>
  );
}
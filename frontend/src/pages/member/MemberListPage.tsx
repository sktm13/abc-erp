import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMemberList } from "../../api/memberApi";
import useCustomLogin from "../../hooks/useCustomLogin";
import type { MemberResponse, PageResponse } from "../../types/member";

export default function MemberListPage() {
  const navigate = useNavigate();

  const { loginState } = useCustomLogin();

  const isAdmin = loginState.roleNames?.includes("ADMIN");

  const [data, setData] = useState<PageResponse<MemberResponse> | null>(null);

  const [keyword, setKeyword] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");

  const [page, setPage] = useState(1);

  const fetchMembers = async () => {
    try {
      const result = await getMemberList({
        page,
        size: 10,
        keyword: keyword || undefined,
        department: department || undefined,
        status: status || undefined,
        role: role || undefined,
      });

      setData(result);
    } catch (e) {
      console.error(e);
      alert("회원 목록 조회에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchMembers();
  };

  const statusText = (status: string) => {
    if (status === "ACTIVE") return "재직";
    if (status === "LEAVE") return "휴직";
    if (status === "RESIGNED") return "퇴사";

    return status;
  };

  const statusClass = (status: string) => {
    if (status === "ACTIVE") return "bg-emerald-50 text-emerald-600";
    if (status === "LEAVE") return "bg-amber-50 text-amber-600";
    if (status === "RESIGNED") return "bg-slate-100 text-slate-500";

    return "bg-slate-100 text-slate-500";
  };

  const presenceText = (presenceStatus: string) => {
    if (presenceStatus === "ONLINE") return "온라인";
    if (presenceStatus === "AWAY") return "자리비움";
    if (presenceStatus === "OFFLINE") return "오프라인";

    return presenceStatus;
  };

  const presenceClass = (presenceStatus: string) => {
    if (presenceStatus === "ONLINE") return "bg-emerald-50 text-emerald-600";
    if (presenceStatus === "AWAY") return "bg-amber-50 text-amber-600";
    if (presenceStatus === "OFFLINE") return "bg-slate-100 text-slate-500";

    return "bg-slate-100 text-slate-500";
  };

  return (
    <div>
      {/* Title */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">회원관리</h1>
          <p className="text-slate-400 mt-2">사원 목록 조회 및 검색</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => navigate("/member/register")}
            className="px-5 py-3 rounded-2xl bg-[#3B82F6] text-white font-semibold hover:bg-blue-500 transition"
          >
            + 사원등록
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-[28px] border border-slate-200 p-6 shadow-sm mb-6">
        <div className="grid grid-cols-5 gap-3">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-slate-200"
          >
            <option value="">전체 부서</option>
            <option value="DEV">개발팀</option>
            <option value="HR">인사팀</option>
            <option value="PUR">구매팀</option>
            <option value="FIN">재무팀</option>
            <option value="OPS">운영팀</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-slate-200"
          >
            <option value="">전체 상태</option>
            <option value="ACTIVE">재직</option>
            <option value="LEAVE">휴직</option>
            <option value="RESIGNED">퇴사</option>
          </select>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-slate-200"
          >
            <option value="">전체 권한</option>
            <option value="EMPLOYEE">사원</option>
            <option value="MANAGER">팀장급</option>
            <option value="ADMIN">관리자</option>
          </select>

          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="사번 / 이름 / 이메일 검색"
            className="px-4 py-3 rounded-2xl border border-slate-200"
          />

          <button
            onClick={handleSearch}
            className="px-5 py-3 rounded-2xl bg-[#1E293B] text-white font-semibold hover:bg-[#334155] transition"
          >
            검색
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-500 text-sm">
              <th className="px-6 py-4">사번</th>
              <th className="px-6 py-4">이름</th>
              <th className="px-6 py-4">이메일</th>
              <th className="px-6 py-4">부서</th>
              <th className="px-6 py-4">권한</th>
              <th className="px-6 py-4">재직상태</th>
              <th className="px-6 py-4">현재상태</th>
            </tr>
          </thead>

          <tbody>
            {data?.dtoList.map((member) => {
              const presenceStatus = member.presenceStatus || "OFFLINE";

              return (
                <tr
                  key={member.employeeNo}
                  onClick={() => navigate(`/member/read/${member.employeeNo}`)}
                  className="border-t border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {member.employeeNo}
                  </td>

                  <td className="px-6 py-4">{member.name}</td>

                  <td className="px-6 py-4 text-slate-500">
                    {member.email}
                  </td>

                  <td className="px-6 py-4">{member.department}</td>

                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {member.roleNames.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(
                        member.status
                      )}`}
                    >
                      {statusText(member.status)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${presenceClass(
                        presenceStatus
                      )}`}
                    >
                      {presenceText(presenceStatus)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {data?.dtoList.length === 0 && (
          <div className="p-10 text-center text-slate-400">
            조회된 사원이 없습니다.
          </div>
        )}
      </div>

      {/* Paging */}
      {data && (
        <div className="flex justify-center gap-2 mt-6">
          {data.prev && (
            <button
              onClick={() => setPage(data.prevPage)}
              className="px-4 py-2 rounded-xl border bg-white"
            >
              이전
            </button>
          )}

          {data.pageNumList.map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-4 py-2 rounded-xl border ${
                data.current === num
                  ? "bg-[#1E293B] text-white"
                  : "bg-white text-slate-600"
              }`}
            >
              {num}
            </button>
          ))}

          {data.next && (
            <button
              onClick={() => setPage(data.nextPage)}
              className="px-4 py-2 rounded-xl border bg-white"
            >
              다음
            </button>
          )}
        </div>
      )}
    </div>
  );
}
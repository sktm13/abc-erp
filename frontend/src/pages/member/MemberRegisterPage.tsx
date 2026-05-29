import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerMember } from "../../api/memberApi";
import useCustomLogin from "../../hooks/useCustomLogin";

type DepartmentCode = "DEV" | "HR" | "PUR" | "FIN" | "OPS";

const departments: { code: DepartmentCode; label: string }[] = [
  { code: "DEV", label: "개발팀" },
  { code: "HR", label: "인사팀" },
  { code: "PUR", label: "구매팀" },
  { code: "FIN", label: "재무팀" },
  { code: "OPS", label: "운영팀" },
];

export default function MemberRegisterPage() {
  const navigate = useNavigate();

  const { loginState } = useCustomLogin();

  const isAdmin = loginState.roleNames?.includes("ADMIN");

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("1111");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState<DepartmentCode>("DEV");

  const handleRegister = async () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    if (!pw.trim()) {
      alert("초기 비밀번호를 입력해주세요.");
      return;
    }

    if (!department.trim()) {
      alert("부서를 선택해주세요.");
      return;
    }

    try {
      const result = await registerMember({
        email,
        pw,
        name,
        department,
      });

      alert(`사원 등록 완료\n사번: ${result.employeeNo}`);

      navigate("/member/list");
    } catch (e: unknown) {
      console.error(e);

      if (axios.isAxiosError(e)) {
        const message =
          e.response?.data?.message ||
          e.response?.data?.error ||
          e.response?.data;

        if (message) {
          alert(message);
          return;
        }
      }

      alert("사원 등록에 실패했습니다.");
    }
  };

  if (!isAdmin) {
    return (
      <div className="h-full min-h-0 flex items-center justify-center">
        <div className="w-full max-w-[520px] bg-white rounded-[28px] border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5 text-2xl">
            !
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            접근 권한 없음
          </h1>

          <p className="text-slate-500 mb-6">
            사원 등록은 관리자 권한만 가능합니다.
          </p>

          <button
            onClick={() => navigate("/member/list")}
            className="px-5 py-3 rounded-2xl bg-[#1E293B] text-white font-semibold hover:bg-[#334155] transition"
          >
            사원목록으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 mb-5">
        <h1 className="text-3xl font-bold text-slate-800">사원등록</h1>
        <p className="text-slate-400 mt-1">
          신규 사원의 기본 정보를 등록합니다.
        </p>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="w-full max-w-[720px] bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  신규 사원 정보
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  사번은 부서와 입사년도 기준으로 자동 생성됩니다.
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                👤
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  이름
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="사원 이름"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  이메일
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@abc.com"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  초기 비밀번호
                </label>

                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="초기 비밀번호"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  부서
                </label>

                <select
                  value={department}
                  onChange={(e) =>
                    setDepartment(e.target.value as DepartmentCode)
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {departments.map((department) => (
                    <option key={department.code} value={department.code}>
                      {department.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  사번
                </label>

                <div className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 font-medium">
                  등록 시 자동 생성
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  기본 상태
                </label>

                <div className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 font-medium">
                  재직 / 사원 권한으로 등록
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 text-sm text-blue-600 font-medium">
              등록 완료 후 사원 상세 페이지에서 권한, 재직 상태 등 추가 정보를 수정할 수 있습니다.
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => navigate("/member/list")}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
              >
                취소
              </button>

              <button
                onClick={handleRegister}
                className="px-6 py-3 rounded-2xl bg-[#3B82F6] text-white font-semibold hover:bg-blue-500 transition"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
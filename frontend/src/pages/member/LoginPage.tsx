import { useEffect, useState } from "react";
import useCustomLogin from "../../hooks/useCustomLogin";

export default function LoginPage() {
  const [employeeNo, setEmployeeNo] = useState("");
  const [pw, setPw] = useState("");

  const { doLogin, loginStatus, moveToPath } = useCustomLogin();

  const handleLogin = () => {
    if (!employeeNo || !pw) {
      alert("사번과 비밀번호를 입력해주세요.");
      return;
    }

    doLogin(employeeNo, pw);
  };

  useEffect(() => {
    if (loginStatus === "fulfilled" || loginStatus === "saved") {
      moveToPath("/");
    }

    if (loginStatus === "rejected") {
      alert("로그인에 실패했습니다.");
    }
  }, [loginStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-[420px] bg-white rounded-[28px] shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#3B82F6] text-white flex items-center justify-center font-bold text-xl mx-auto mb-4">
            A
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            ABC ERP
          </h1>

          <p className="text-sm text-slate-400 mt-2">
            사번으로 로그인해주세요
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={employeeNo}
            onChange={(e) => setEmployeeNo(e.target.value)}
            placeholder="사번"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="비밀번호"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleLogin}
            disabled={loginStatus === "pending"}
            className="w-full py-3 rounded-2xl bg-[#1E293B] text-white hover:bg-[#334155] transition disabled:opacity-60"
          >
            {loginStatus === "pending" ? "로그인 중..." : "로그인"}
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-400 text-center">
          테스트 계정: ABC-21-DEV-001 / 1111
        </div>
      </div>
    </div>
  );
}
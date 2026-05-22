import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerMember } from "../../api/memberApi";
import useCustomLogin from "../../hooks/useCustomLogin";

export default function MemberRegisterPage() {
  const navigate = useNavigate();

  const { loginState } = useCustomLogin();

  const isAdmin = loginState.roleNames?.includes("ADMIN");

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("1111");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("DEV");

  const handleRegister = async () => {
    if (!email || !pw || !name || !department) {
      alert("모든 항목을 입력해주세요.");
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
        const message = e.response?.data?.message;

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
      <div className="bg-white rounded-[28px] border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          접근 권한 없음
        </h1>

        <p className="text-slate-500">
          사원 등록은 ADMIN 권한만 가능합니다.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          사원등록
        </h1>

        <p className="text-slate-400 mt-2">
          신규 사원을 등록합니다.
        </p>
      </div>

      <div className="bg-white rounded-[28px] border border-slate-200 p-8 shadow-sm max-w-2xl">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
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
            <label className="block text-sm font-medium text-slate-600 mb-2">
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
            <label className="block text-sm font-medium text-slate-600 mb-2">
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
            <label className="block text-sm font-medium text-slate-600 mb-2">
              부서
            </label>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="DEV">개발팀</option>
              <option value="HR">인사팀</option>
              <option value="PUR">구매팀</option>
              <option value="FIN">재무팀</option>
              <option value="OPS">운영팀</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => navigate("/member/list")}
              className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              취소
            </button>

            <button
              onClick={handleRegister}
              className="px-5 py-3 rounded-2xl bg-[#3B82F6] text-white font-semibold hover:bg-blue-500 transition"
            >
              등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import axios from "axios";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import {
  changeMyPassword,
  changeMyPresenceStatus,
} from "../api/memberApi";
import BasicMenu from "../components/menus/BasicMenu";
import useCustomLogin from "../hooks/useCustomLogin";
import type { PresenceStatus } from "../types/member";

export default function BasicLayout() {
  const {
    loginState,
    isLogin,
    isRestoring,
    doLogout,
    doSave,
    moveToPath,
    moveToLoginReturn,
  } = useCustomLogin();

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  if (isRestoring) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-500">
        로그인 상태 확인 중...
      </div>
    );
  }

  if (!isLogin) {
    return moveToLoginReturn();
  }

  const getHighestRoleText = () => {
    if (loginState.roleNames?.includes("ADMIN")) {
      return "관리자";
    }

    if (loginState.roleNames?.includes("MANAGER")) {
      return "팀장급";
    }

    return "사원";
  };

  const roleText = getHighestRoleText();

  const presenceOptions: {
    value: PresenceStatus;
    label: string;
    dot: string;
    activeClass: string;
  }[] = [
    {
      value: "ONLINE",
      label: "온라인",
      dot: "bg-emerald-500",
      activeClass: "bg-white text-emerald-600 shadow-sm",
    },
    {
      value: "AWAY",
      label: "자리비움",
      dot: "bg-amber-500",
      activeClass: "bg-white text-amber-600 shadow-sm",
    },
    {
      value: "OFFLINE",
      label: "오프라인",
      dot: "bg-slate-400",
      activeClass: "bg-white text-slate-500 shadow-sm",
    },
  ];

  const resetPasswordForm = () => {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  const handlePresenceChange = async (presenceStatus: PresenceStatus) => {
    try {
      await changeMyPresenceStatus(presenceStatus);

      doSave({
        ...loginState,
        presenceStatus,
      });
    } catch (e) {
      console.error(e);
      alert("현재 상태 변경에 실패했습니다.");
    }
  };

  const isValidPassword = (password: string) => {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/.test(
      password
    );
  };

  const handleChangePassword = async () => {
    if (!currentPw.trim()) {
      alert("기존 비밀번호를 입력해주세요.");
      return;
    }

    if (!newPw.trim()) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }

    if (!confirmPw.trim()) {
      alert("비밀번호 확인을 입력해주세요.");
      return;
    }

    if (newPw !== confirmPw) {
      alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!isValidPassword(newPw)) {
      alert("비밀번호는 8~20자, 영문/숫자/특수문자를 포함해야 합니다.");
      return;
    }

    try {
      await changeMyPassword({
        currentPw,
        newPw,
        confirmPw,
      });

      alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");

      resetPasswordForm();
      setPasswordModalOpen(false);

      doLogout();
      moveToPath("/member/login");
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

      alert("비밀번호 변경에 실패했습니다.");
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] p-5 flex gap-5 overflow-hidden">
      <aside className="w-[270px] shrink-0 bg-[#1E293B] rounded-[34px] p-5 flex flex-col shadow-xl overflow-hidden">
        <div className="mb-10 px-3 pt-2 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-[#3B82F6] flex items-center justify-center text-white font-bold mb-4">
            A
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            ABC ERP
          </h1>

          <p className="text-slate-300 text-sm mt-1">
            Smart enterprise workspace
          </p>
        </div>

        <div className="flex-1 min-h-0">
          <BasicMenu />
        </div>

        <div className="mt-auto shrink-0 rounded-[28px] p-4 bg-[#334155] border border-slate-500/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3B82F6] flex items-center justify-center text-white font-bold shrink-0">
              {loginState.name?.charAt(0) || "U"}
            </div>

            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {loginState.name}
              </p>

              <p className="text-slate-300 text-xs truncate">
                {loginState.department} · {roleText}
              </p>

              <button
                type="button"
                onClick={() => setPasswordModalOpen(true)}
                className="mt-2 text-[11px] text-slate-400 hover:text-white transition"
              >
                비밀번호 변경
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-h-0 flex flex-col gap-5 overflow-hidden">
        <header className="h-20 shrink-0 bg-white rounded-[30px] px-8 flex items-center justify-end shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1">
              {presenceOptions.map((status) => {
                const isActive =
                  (loginState.presenceStatus || "OFFLINE") === status.value;

                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => handlePresenceChange(status.value)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold
                      transition-all duration-200
                      ${
                        isActive
                          ? status.activeClass
                          : "text-slate-400 hover:text-slate-600"
                      }
                    `}
                  >
                    <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                    {status.label}
                  </button>
                );
              })}
            </div>

            <div className="text-sm text-slate-600">
              {loginState.name}님
            </div>

            <button
              onClick={() => {
                doLogout();
                moveToPath("/member/login");
              }}
              className="px-5 py-3 rounded-2xl bg-[#1E293B] text-white text-sm font-medium hover:bg-[#334155] hover:-translate-y-0.5 transition-all"
            >
              로그아웃
            </button>
          </div>
        </header>

        <main className="flex-1 min-h-0 bg-white rounded-[34px] shadow-sm border border-slate-200 p-6 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-[460px] bg-white rounded-[28px] p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              비밀번호 변경
            </h2>

            <p className="text-sm text-slate-400 mb-6">
              새 비밀번호는 8~20자, 영문/숫자/특수문자를 포함해야 합니다.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  기존 비밀번호
                </label>

                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  새 비밀번호
                </label>

                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  새 비밀번호 확인
                </label>

                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleChangePassword();
                    }
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-7">
              <button
                onClick={() => {
                  resetPasswordForm();
                  setPasswordModalOpen(false);
                }}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
              >
                취소
              </button>

              <button
                onClick={handleChangePassword}
                className="px-5 py-3 rounded-2xl bg-[#1E293B] text-white font-semibold hover:bg-[#334155] transition"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
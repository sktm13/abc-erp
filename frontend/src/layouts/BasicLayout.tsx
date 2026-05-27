import { Outlet } from "react-router-dom";

import { changeMyPresenceStatus } from "../api/memberApi";
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

  // 새로고침 직후 쿠키 → Redux 복구 중이면 redirect하지 않음
  if (isRestoring) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-500">
        로그인 상태 확인 중...
      </div>
    );
  }

  // 쿠키도 없고 Redux 로그인 상태도 아니면 로그인 페이지로 이동
  if (!isLogin) {
    return moveToLoginReturn();
  }

  const roleText = loginState.roleNames?.join(", ");

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

  const handlePresenceChange = async (
    presenceStatus: PresenceStatus
  ) => {
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

  return (
    <div className="h-screen bg-[#F8FAFC] p-5 flex gap-5 overflow-hidden">
      <aside className="w-270px bg-[#1E293B] rounded-[34px] p-5 flex flex-col shadow-xl">
        <div className="mb-10 px-3 pt-2">
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

        <BasicMenu />

        <div className="mt-auto rounded-[28px] p-4 bg-[#334155] border border-slate-500/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3B82F6] flex items-center justify-center text-white font-bold">
              {loginState.name?.charAt(0) || "U"}
            </div>

            <div>
              <p className="text-white font-semibold text-sm">
                {loginState.name}
              </p>

              <p className="text-slate-300 text-xs">
                {loginState.department} · {roleText}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col gap-5 overflow-hidden">
        <header className="h-20 bg-white rounded-[30px] px-8 flex items-center justify-between shadow-sm border border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Dashboard
            </h2>

            <p className="text-sm text-slate-400">
              오늘도 좋은 하루입니다 👋
            </p>
          </div>

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

        <main className="flex-1 bg-white rounded-[34px] shadow-sm border border-slate-200 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
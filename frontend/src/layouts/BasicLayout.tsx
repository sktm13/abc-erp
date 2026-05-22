import { Outlet } from "react-router-dom";
import BasicMenu from "../components/menus/BasicMenu";
import useCustomLogin from "../hooks/useCustomLogin";

export default function BasicLayout() {
  const {
    loginState,
    isLogin,
    doLogout,
    moveToPath,
    moveToLoginReturn,
  } = useCustomLogin();

  if (!isLogin) {
    return moveToLoginReturn();
  }

  const roleText = loginState.roleNames?.join(", ");

  return (
    <div className="h-screen bg-[#F8FAFC] p-5 flex gap-5 overflow-hidden">
      <aside className="w-[270px] bg-[#1E293B] rounded-[34px] p-5 flex flex-col shadow-xl">
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
            <div className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold">
              ● 근무중
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
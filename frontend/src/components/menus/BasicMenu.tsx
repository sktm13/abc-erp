import { NavLink, useLocation, useNavigate } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";

const departmentText = (department?: string) => {
  if (department === "DEV") return "개발 부서";
  if (department === "HR") return "인사 부서";
  if (department === "PUR") return "구매 부서";
  if (department === "FIN") return "재무 부서";
  if (department === "OPS") return "운영 부서";

  return department || "-";
};

export default function BasicMenu() {
  const navigate = useNavigate();

  const location = useLocation();

  const { loginState } = useCustomLogin();

  const isAdmin = loginState.roleNames?.includes("ADMIN");

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `
    flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm
    transition-all duration-200
    ${
      isActive
        ? "bg-white text-[#1E293B] shadow-md"
        : "text-slate-300 hover:bg-[#334155] hover:text-white hover:translate-x-1"
    }
    `;

  const childLinkClass = ({ isActive }: { isActive: boolean }) =>
    `
    flex items-center gap-2 px-4 py-2.5 rounded-xl text-left text-sm
    transition-all duration-200
    ${
      isActive
        ? "bg-white text-[#1E293B] shadow-md"
        : "text-slate-300 hover:bg-[#334155] hover:text-white"
    }
    `;

  const registerActive = location.pathname === "/member/register";

  const handleRegisterClick = () => {
    if (!isAdmin) {
      alert("권한이 없습니다.");
      return;
    }

    navigate("/member/register");
  };

  return (
    <nav className="flex flex-col gap-3">
      <NavLink to="/" end className={linkClass}>
        <span className="text-lg">🏠</span>
        <span className="font-medium">대시보드</span>
      </NavLink>

      <div>
        <p className="px-4 mb-2 text-xs font-semibold text-slate-400">
          공지사항
        </p>

        <div className="flex flex-col gap-1 pl-2">
          <NavLink to="/notice/all" className={childLinkClass}>
            <span>📢</span>
            <span>전체 공지사항</span>
          </NavLink>

          <NavLink to="/notice/department" className={childLinkClass}>
            <span>🏢</span>

            <div className="flex flex-1 items-center justify-between">
              <span>부서 공지사항</span>

              <span className="text-[12px] text-slate-400 font-semibold">
                ({departmentText(loginState.department)})
              </span>
            </div>
          </NavLink>
        </div>
      </div>

      <div>
        <p className="px-4 mb-2 text-xs font-semibold text-slate-400">
          사원관리
        </p>

        <div className="flex flex-col gap-1 pl-2">
          <NavLink to="/member/list" className={childLinkClass}>
            <span>👥</span>
            <span>사원목록</span>
          </NavLink>

          <button
            type="button"
            onClick={handleRegisterClick}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-left text-sm
              transition-all duration-200
              ${
                registerActive
                  ? "bg-white text-[#1E293B] shadow-md"
                  : "text-slate-300 hover:bg-[#334155] hover:text-white"
              }
            `}
          >
            <span>➕</span>
            <span>사원등록</span>
          </button>
        </div>
      </div>

      <div>
        <p className="px-4 mb-2 text-xs font-semibold text-slate-400">
          근무
        </p>

        <div className="flex flex-col gap-1 pl-2">
          <NavLink to="/work/start" className={childLinkClass}>
            <span>⏱️</span>
            <span>근무시작/종료</span>
          </NavLink>

          <NavLink to="/work/log" className={childLinkClass}>
            <span>🗓️</span>
            <span>근무일지</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
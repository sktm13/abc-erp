import { NavLink } from "react-router-dom";

export default function BasicMenu() {

  const menus = [
    { path: "/", icon: "🏠", name: "대시보드", end: true },
    { path: "/member/list", icon: "👥", name: "회원관리" },
    { path: "/worklog", icon: "📝", name: "근무일지" },
    { path: "/chat", icon: "💬", name: "채팅" },
    { path: "/inventory", icon: "📦", name: "재고관리" },
    { path: "/approval", icon: "📄", name: "전자결재" },
  ];

  return (
    <nav className="flex flex-col gap-2">
      {menus.map((menu) => (
        <NavLink
          key={menu.path}
          to={menu.path}
          end={menu.end}
          className={({ isActive }) =>
            `
            flex items-center gap-3 px-5 py-4 rounded-2xl text-left
            transition-all duration-200
            ${
              isActive
                ? "bg-white text-[#1E293B] shadow-md"
                : "text-slate-300 hover:bg-[#334155] hover:text-white hover:translate-x-1"
            }
            `
          }
        >
          <span className="text-lg">{menu.icon}</span>
          <span className="font-medium">{menu.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}
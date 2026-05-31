import type { PresenceStatus } from "../../types/chat";

export const departmentText = (department?: string | null) => {
  if (department === "DEV") return "개발팀";
  if (department === "HR") return "인사팀";
  if (department === "PUR") return "구매팀";
  if (department === "FIN") return "재무팀";
  if (department === "OPS") return "운영팀";

  return department || "-";
};

export const roleText = (role?: string | null) => {
  if (role === "ADMIN") return "관리자";
  if (role === "MANAGER") return "팀장";
  if (role === "EMPLOYEE") return "사원";

  return role || "사원";
};

export const presenceText = (presenceStatus?: PresenceStatus | null) => {
  if (presenceStatus === "ONLINE") return "온라인";
  if (presenceStatus === "AWAY") return "자리비움";
  if (presenceStatus === "OFFLINE") return "오프라인";

  return "오프라인";
};

export const presenceDotClass = (presenceStatus?: PresenceStatus | null) => {
  if (presenceStatus === "ONLINE") return "bg-emerald-500";
  if (presenceStatus === "AWAY") return "bg-amber-500";

  return "bg-slate-400";
};

export const formatTime = (dateTime?: string | null) => {
  if (!dateTime) {
    return "";
  }

  return dateTime.replace("T", " ").substring(11, 16);
};
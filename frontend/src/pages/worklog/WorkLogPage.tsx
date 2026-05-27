import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { getMemberList } from "../../api/memberApi";
import { getMemberWorkLogs, getMyWorkLogs } from "../../api/worklogApi";

import useCustomLogin from "../../hooks/useCustomLogin";
import type { MemberResponse } from "../../types/member";
import type { WorkLog } from "../../types/worklog";

type DepartmentCode = "DEV" | "HR" | "PUR" | "FIN" | "OPS";
type ViewMode = "MONTH" | "WEEK";

const departments: { code: DepartmentCode; label: string }[] = [
  { code: "DEV", label: "개발팀" },
  { code: "HR", label: "인사팀" },
  { code: "PUR", label: "구매팀" },
  { code: "FIN", label: "재무팀" },
  { code: "OPS", label: "운영팀" },
];

const toDateKey = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

const getWeekStart = (date: Date) => {
  const copied = new Date(date);
  const day = copied.getDay();

  copied.setDate(copied.getDate() - day);
  copied.setHours(0, 0, 0, 0);

  return copied;
};

export default function WorkLogPage() {
  const today = new Date();

  const { loginState } = useCustomLogin();

  const isAdmin = loginState.roleNames?.includes("ADMIN");
  const isManager = loginState.roleNames?.includes("MANAGER");
  const isHr = loginState.department === "HR";

  const canViewMemberLogs = isAdmin || isManager || isHr;

  const [viewMode, setViewMode] = useState<ViewMode>("MONTH");
  const [currentDate, setCurrentDate] = useState(today);

  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);

  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WorkLog | null>(null);

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberList, setMemberList] = useState<MemberResponse[]>([]);
  const [viewedMember, setViewedMember] = useState<MemberResponse | null>(null);

  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentCode>("DEV");

  const todayKey = toDateKey(today);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const getLoginDepartment = (): DepartmentCode => {
    if (
      loginState.department === "DEV" ||
      loginState.department === "HR" ||
      loginState.department === "PUR" ||
      loginState.department === "FIN" ||
      loginState.department === "OPS"
    ) {
      return loginState.department;
    }

    return "DEV";
  };

  const visibleDates = useMemo(() => {
    if (viewMode === "WEEK") {
      const start = getWeekStart(currentDate);

      return Array.from({ length: 7 }).map((_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);

        return date;
      });
    }

    const firstDate = new Date(year, month - 1, 1);
    const lastDate = new Date(year, month, 0);

    const firstDay = firstDate.getDay();
    const lastDay = lastDate.getDate();

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay; day++) {
      days.push(new Date(year, month - 1, day));
    }

    while (days.length < 42) {
      days.push(null);
    }

    return days;
  }, [viewMode, currentDate, year, month]);

  const visibleKeys = useMemo(() => {
    return visibleDates.filter(Boolean).map((date) => toDateKey(date as Date));
  }, [visibleDates]);

  const fetchLogsByMonth = async (
    targetYear: number,
    targetMonth: number
  ): Promise<WorkLog[]> => {
    if (viewedMember && viewedMember.employeeNo !== loginState.employeeNo) {
      return getMemberWorkLogs(viewedMember.employeeNo, targetYear, targetMonth);
    }

    return getMyWorkLogs(targetYear, targetMonth);
  };

  const fetchWorkLogs = async () => {
    try {
      if (viewMode === "MONTH") {
        const result = await fetchLogsByMonth(year, month);

        setWorkLogs(result);
        return;
      }

      const monthSet = new Set<string>();

      visibleDates.forEach((date) => {
        if (!date) {
          return;
        }

        monthSet.add(`${date.getFullYear()}-${date.getMonth() + 1}`);
      });

      const resultList = await Promise.all(
        Array.from(monthSet).map((value) => {
          const [targetYear, targetMonth] = value.split("-").map(Number);

          return fetchLogsByMonth(targetYear, targetMonth);
        })
      );

      const merged = resultList
        .flat()
        .filter((log) => visibleKeys.includes(log.workDate));

      setWorkLogs(merged);
    } catch (e: unknown) {
      console.error(e);

      if (axios.isAxiosError(e)) {
        const message = e.response?.data?.message;

        if (message) {
          alert(message);
          return;
        }
      }

      alert("근무일지를 불러오지 못했습니다.");
    }
  };

  const fetchMembersForModal = async (department: DepartmentCode) => {
    try {
      const result = await getMemberList({
        page: 1,
        size: 100,
        department,
      });

      setMemberList(result.dtoList);
    } catch (e) {
      console.error(e);
      alert("사원 목록을 불러오지 못했습니다.");
    }
  };

  const handleOpenMemberModal = async () => {
    if (!canViewMemberLogs) {
      alert("권한이 없습니다.");
      return;
    }

    const defaultDepartment = getLoginDepartment();

    setSelectedDepartment(defaultDepartment);
    setMemberModalOpen(true);

    await fetchMembersForModal(defaultDepartment);
  };

  const handleSelectDepartment = async (department: DepartmentCode) => {
    if (!isHr && department !== loginState.department) {
      return;
    }

    setSelectedDepartment(department);
    await fetchMembersForModal(department);
  };

  useEffect(() => {
    fetchWorkLogs();
  }, [viewMode, currentDate, viewedMember?.employeeNo]);

  const movePeriod = (amount: number) => {
    const nextDate = new Date(currentDate);

    if (viewMode === "MONTH") {
      nextDate.setMonth(nextDate.getMonth() + amount);
    } else {
      nextDate.setDate(nextDate.getDate() + amount * 7);
    }

    setCurrentDate(nextDate);
  };

  const formatTime = (dateTime: string | null) => {
    if (!dateTime) {
      return "-";
    }

    return dateTime.substring(11, 16);
  };

  const formatHours = (workHours: number | null) => {
    if (workHours === null || workHours === undefined) {
      return "-";
    }

    return `${workHours.toFixed(1)}h`;
  };

  const formatTotalHours = (logs: WorkLog[]) => {
    const totalMinutes = logs.reduce(
      (sum, log) => sum + (log.workMinutes || 0),
      0
    );

    if (totalMinutes === 0) {
      return "";
    }

    return `${(totalMinutes / 60).toFixed(1)}h`;
  };

  const logsByDate = useMemo(() => {
    const map: Record<string, WorkLog[]> = {};

    workLogs.forEach((log) => {
      if (!map[log.workDate]) {
        map[log.workDate] = [];
      }

      map[log.workDate].push(log);
    });

    return map;
  }, [workLogs]);

  const titleText = () => {
    if (viewMode === "MONTH") {
      return `${year}년 ${month}월`;
    }

    const start = getWeekStart(currentDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return `${toDateKey(start)} ~ ${toDateKey(end)}`;
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">근무일지</h1>
          <p className="text-slate-400 mt-0.5 text-sm">
            월별 또는 주별 근무 기록을 조회합니다.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="flex rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => setViewMode("MONTH")}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                viewMode === "MONTH"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-400"
              }`}
            >
              월 단위
            </button>

            <button
              onClick={() => setViewMode("WEEK")}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                viewMode === "WEEK"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-400"
              }`}
            >
              주 단위
            </button>
          </div>

          <button
            onClick={handleOpenMemberModal}
            className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
          >
            사원 근무일지 조회
          </button>
        </div>
      </div>

      {viewedMember && (
        <div className="shrink-0 mb-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2 flex items-center justify-between">
          <div className="text-blue-600 text-sm font-medium">
            현재 조회 중: {viewedMember.name} / {viewedMember.employeeNo} /{" "}
            {viewedMember.department}
          </div>

          <button
            onClick={() => {
              setViewedMember(null);
              setMemberList([]);
            }}
            className="px-3 py-1.5 rounded-xl bg-white text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
          >
            내 근무일지 보기
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="shrink-0 flex items-center justify-between px-5 py-2.5 border-b border-slate-200">
          <button
            onClick={() => movePeriod(-1)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            이전 {viewMode === "MONTH" ? "달" : "주"}
          </button>

          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-800">
              {titleText()}
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              {viewedMember
                ? `${viewedMember.name}님의 근무일지`
                : "내 근무일지"}
            </p>
          </div>

          <button
            onClick={() => movePeriod(1)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            다음 {viewMode === "MONTH" ? "달" : "주"}
          </button>
        </div>

        <div className="shrink-0 grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {["일", "월", "화", "수", "목", "금", "토"].map((dayName) => (
            <div
              key={dayName}
              className="px-3 py-1.5 text-center text-xs font-semibold text-slate-500"
            >
              {dayName}
            </div>
          ))}
        </div>

        <div
          className={`flex-1 min-h-0 grid grid-cols-7 ${
            viewMode === "MONTH" ? "grid-rows-6" : "grid-rows-1"
          }`}
        >
          {visibleDates.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-0 border-r border-b border-slate-100 bg-slate-50/40"
                />
              );
            }

            const key = toDateKey(date);
            const logs = logsByDate[key] || [];
            const isToday = key === todayKey;
            const totalHours = formatTotalHours(logs);

            return (
              <div
                key={key}
                className={`min-h-0 overflow-hidden border-r border-b border-slate-100 p-2 flex flex-col ${
                  isToday ? "bg-blue-50/40 ring-1 ring-blue-200" : ""
                }`}
              >
                <div className="shrink-0 flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`text-xs font-semibold ${
                        isToday
                          ? "w-6 h-6 rounded-full bg-[#3B82F6] text-white flex items-center justify-center"
                          : "text-slate-700"
                      }`}
                    >
                      {date.getDate()}
                    </div>

                    {totalHours && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {totalHours}
                      </span>
                    )}
                  </div>

                  {isToday && (
                    <span className="text-[9px] font-semibold text-blue-500">
                      TODAY
                    </span>
                  )}
                </div>

                <div className="flex-1 min-h-0 space-y-1 overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg bg-white border border-slate-200 px-2 py-1.5 text-[10px] shadow-sm overflow-hidden"
                    >
                      <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden">
                        <span className="font-semibold text-slate-700 shrink-0">
                          {formatTime(log.startTime)}~{formatTime(log.endTime)}
                        </span>

                        <span className="text-slate-300 shrink-0">·</span>

                        <span className="text-slate-500 shrink-0">
                          {formatHours(log.workHours)}
                        </span>

                        <span className="text-slate-300 shrink-0">·</span>

                        {log.status === "COMPLETED" && (
                          <button
                            onClick={() => {
                              setSelectedLog(log);
                              setContentModalOpen(true);
                            }}
                            className="text-blue-600 font-semibold hover:underline shrink-0"
                          >
                            내용보기
                          </button>
                        )}

                        {log.status === "WORKING" && (
                          <span className="text-emerald-600 font-semibold shrink-0">
                            근무중
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {memberModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-[620px] max-h-[80vh] bg-white rounded-[28px] p-8 shadow-xl flex flex-col">
            <div className="mb-5 shrink-0">
              <h2 className="text-2xl font-bold text-slate-800">
                사원 근무일지 조회
              </h2>

              <p className="text-sm text-slate-400 mt-2">
                {isHr
                  ? "전체 사원 중 조회할 사원을 선택하세요."
                  : `${loginState.department} 부서 사원 중 조회할 사원을 선택하세요.`}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {departments.map((department) => {
                  const isOwnDepartment =
                    department.code === loginState.department;

                  const isDisabled = !isHr && !isOwnDepartment;

                  const isSelected = selectedDepartment === department.code;

                  return (
                    <button
                      key={department.code}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleSelectDepartment(department.code)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        isSelected
                          ? "bg-[#3B82F6] text-white border-[#3B82F6]"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      } ${
                        isDisabled
                          ? "opacity-40 cursor-not-allowed hover:bg-white"
                          : ""
                      }`}
                    >
                      {department.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto border border-slate-200 rounded-2xl">
              {memberList.map((member) => (
                <button
                  key={member.employeeNo}
                  type="button"
                  onClick={() => {
                    setViewedMember(member);
                    setMemberModalOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-5 py-4 border-b last:border-b-0 border-slate-100 hover:bg-slate-50 transition text-left"
                >
                  <div>
                    <p className="font-semibold text-slate-700">
                      {member.name}
                    </p>

                    <p className="text-sm text-slate-400">
                      {member.employeeNo} · {member.email}
                    </p>
                  </div>

                  <div className="text-sm text-slate-500">
                    {member.department}
                  </div>
                </button>
              ))}

              {memberList.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  조회 가능한 사원이 없습니다.
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 shrink-0">
              <button
                onClick={() => setMemberModalOpen(false)}
                className="px-5 py-3 rounded-2xl bg-[#1E293B] text-white font-semibold hover:bg-[#334155]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {contentModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-[520px] bg-white rounded-[28px] p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              근무 내용
            </h2>

            <p className="text-slate-400 text-sm mb-5">
              {selectedLog.workDate} / {formatTime(selectedLog.startTime)} ~{" "}
              {formatTime(selectedLog.endTime)} /{" "}
              {formatHours(selectedLog.workHours)}
            </p>

            <div className="min-h-40 bg-slate-50 rounded-2xl border border-slate-200 p-4 text-slate-700 whitespace-pre-wrap">
              {selectedLog.content}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setContentModalOpen(false);
                  setSelectedLog(null);
                }}
                className="px-5 py-3 rounded-2xl bg-[#1E293B] text-white font-semibold hover:bg-[#334155]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
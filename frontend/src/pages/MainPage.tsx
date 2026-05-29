import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getUnreadNotices } from "../api/noticeApi";
import { getCurrentWorkStatus, getMyWorkLogs } from "../api/worklogApi";

import type { NoticeList } from "../types/notice";
import type { WorkLog } from "../types/worklog";

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

const formatTime = (dateTime: string | null) => {
  if (!dateTime) {
    return "-";
  }

  return dateTime.substring(11, 16);
};

const formatDate = (date: Date) => {
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const formatDateTime = (dateTime: string) => {
  return dateTime.replace("T", " ").substring(0, 16);
};

const formatHoursByMinutes = (minutes: number) => {
  return `${(minutes / 60).toFixed(1)}h`;
};

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

export default function MainPage() {
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);

  const weekStart = useMemo(() => getWeekStart(today), [today]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      return date;
    });
  }, [weekStart]);

  const weekEnd = weekDates[6];

  const [isWorking, setIsWorking] = useState(false);
  const [currentStartTime, setCurrentStartTime] = useState<string | null>(null);

  const [unreadNotices, setUnreadNotices] = useState<NoticeList[]>([]);
  const [weekLogs, setWeekLogs] = useState<WorkLog[]>([]);

  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WorkLog | null>(null);

  const unreadAllNotices = unreadNotices.filter(
    (notice) => notice.scope === "ALL"
  );

  const unreadDepartmentNotices = unreadNotices.filter(
    (notice) => notice.scope === "DEPARTMENT"
  );

  const logsByDate = useMemo(() => {
    const map: Record<string, WorkLog[]> = {};

    weekLogs.forEach((log) => {
      if (!map[log.workDate]) {
        map[log.workDate] = [];
      }

      map[log.workDate].push(log);
    });

    return map;
  }, [weekLogs]);

  const totalMinutesByDate = (logs: WorkLog[]) => {
    return logs.reduce((sum, log) => sum + (log.workMinutes || 0), 0);
  };

  const fetchCurrentWorkStatus = async () => {
    try {
      const result = await getCurrentWorkStatus();

      setIsWorking(result.working);
      setCurrentStartTime(result.startTime);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUnreadNotices = async () => {
    try {
      const result = await getUnreadNotices();

      setUnreadNotices(result);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWeekLogs = async () => {
    try {
      const monthSet = new Set<string>();

      weekDates.forEach((date) => {
        monthSet.add(`${date.getFullYear()}-${date.getMonth() + 1}`);
      });

      const resultList = await Promise.all(
        Array.from(monthSet).map((value) => {
          const [year, month] = value.split("-").map(Number);

          return getMyWorkLogs(year, month);
        })
      );

      const weekKeys = weekDates.map((date) => toDateKey(date));

      const merged = resultList
        .flat()
        .filter((log) => weekKeys.includes(log.workDate))
        .sort((a, b) => a.workDate.localeCompare(b.workDate));

      setWeekLogs(merged);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCurrentWorkStatus();
    fetchUnreadNotices();
    fetchWeekLogs();
  }, []);

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 grid grid-cols-[360px_1fr] gap-5 mb-5">
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center text-center min-h-[190px]">
          <div
            className={`w-4 h-4 rounded-full mb-4 ${
              isWorking ? "bg-blue-500" : "bg-slate-300"
            }`}
          />

          <p className="text-sm font-semibold text-slate-400 mb-2">
            현재 근무 상태
          </p>

          <h2
            className={`text-4xl font-bold ${
              isWorking ? "text-blue-600" : "text-slate-700"
            }`}
          >
            {isWorking ? "근무 중" : "근무 전"}
          </h2>

          <p className="text-sm text-slate-400 mt-4">
            시작 시각: {formatTime(currentStartTime)}
          </p>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                안읽은 공지사항
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                전체 공지와 부서 공지를 확인하세요.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold">
              {unreadNotices.length}건
            </span>
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-100 min-h-[150px]">
            <div className="min-h-0 flex flex-col">
              <div className="shrink-0 px-5 py-2.5 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-700 text-sm">
                  전체 공지사항
                </h3>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                {unreadAllNotices.slice(0, 4).map((notice) => (
                  <button
                    key={notice.id}
                    onClick={() => navigate(`/notice/read/${notice.id}`)}
                    className="w-full px-5 py-2.5 border-b border-slate-100 text-left hover:bg-slate-50"
                  >
                    <p className="font-semibold text-slate-700 truncate text-sm">
                      {notice.title}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {formatDateTime(notice.createdAt)}
                    </p>
                  </button>
                ))}

                {unreadAllNotices.length === 0 && (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    안읽은 전체 공지가 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className="min-h-0 flex flex-col">
              <div className="shrink-0 px-5 py-2.5 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-700 text-sm">
                  부서 공지사항
                </h3>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                {unreadDepartmentNotices.slice(0, 4).map((notice) => (
                  <button
                    key={notice.id}
                    onClick={() => navigate(`/notice/read/${notice.id}`)}
                    className="w-full px-5 py-2.5 border-b border-slate-100 text-left hover:bg-slate-50"
                  >
                    <p className="font-semibold text-slate-700 truncate text-sm">
                      {notice.title}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {formatDateTime(notice.createdAt)}
                    </p>
                  </button>
                ))}

                {unreadDepartmentNotices.length === 0 && (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    안읽은 부서 공지가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              이번 주 근무일지
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              {formatDate(weekStart)} ~ {formatDate(weekEnd)}
            </p>
          </div>
        </div>

        <div className="shrink-0 grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="px-3 py-2 text-center text-xs font-semibold text-slate-500"
            >
              {dayName}
            </div>
          ))}
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-7">
          {weekDates.map((date) => {
            const key = toDateKey(date);
            const logs = logsByDate[key] || [];
            const isToday = key === todayKey;
            const totalMinutes = totalMinutesByDate(logs);

            return (
              <div
                key={key}
                className={`min-h-0 overflow-hidden border-r border-slate-100 p-2 flex flex-col ${
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

                    {totalMinutes > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatHoursByMinutes(totalMinutes)}
                      </span>
                    )}
                  </div>

                  {isToday && (
                    <span className="text-[9px] font-semibold text-blue-500">
                      TODAY
                    </span>
                  )}
                </div>

                <div className="flex-1 min-h-0 space-y-1.5 overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg bg-white border border-slate-200 px-2 py-1.5 text-[11px] shadow-sm overflow-hidden"
                    >
                      <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden">
                        <span className="font-semibold text-slate-700 shrink-0">
                          {formatTime(log.startTime)}~{formatTime(log.endTime)}
                        </span>

                        <span className="text-slate-300 shrink-0">·</span>

                        <span className="text-slate-500 shrink-0">
                          {formatHoursByMinutes(log.workMinutes || 0)}
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

                  {logs.length === 0 && (
                    <div className="h-full flex items-center justify-center text-[11px] text-slate-300">
                      기록 없음
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {contentModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-[520px] bg-white rounded-[28px] p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              근무 내용
            </h2>

            <p className="text-slate-400 text-sm mb-5">
              {selectedLog.workDate} / {formatTime(selectedLog.startTime)} ~{" "}
              {formatTime(selectedLog.endTime)} /{" "}
              {formatHoursByMinutes(selectedLog.workMinutes || 0)}
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
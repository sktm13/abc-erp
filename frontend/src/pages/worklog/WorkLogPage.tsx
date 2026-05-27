import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  endWork,
  getCurrentWorkStatus,
  getMyWorkLogs,
  startWork,
} from "../../api/worklogApi";

import type { WorkLog } from "../../types/worklog";

export default function WorkLogPage() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [isWorking, setIsWorking] = useState(false);
  const [currentStartTime, setCurrentStartTime] = useState<string | null>(null);

  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);

  const [endModalOpen, setEndModalOpen] = useState(false);
  const [content, setContent] = useState("");

  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WorkLog | null>(null);

  const fetchCurrent = async () => {
    try {
      const result = await getCurrentWorkStatus();

      setIsWorking(result.working);
      setCurrentStartTime(result.startTime);
    } catch (e) {
      console.error(e);
      alert("현재 근무 상태를 불러오지 못했습니다.");
    }
  };

  const fetchWorkLogs = async () => {
    try {
      const result = await getMyWorkLogs(year, month);

      setWorkLogs(result);
    } catch (e) {
      console.error(e);
      alert("근무일지를 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  useEffect(() => {
    fetchWorkLogs();
  }, [year, month]);

  const handleStartWork = async () => {
    try {
      const result = await startWork();

      setIsWorking(result.working);
      setCurrentStartTime(result.startTime);

      alert("근무가 시작되었습니다.");

      fetchWorkLogs();
    } catch (e: unknown) {
      console.error(e);

      if (axios.isAxiosError(e)) {
        const message = e.response?.data?.message;

        if (message) {
          alert(message);
          return;
        }
      }

      alert("근무 시작에 실패했습니다.");
    }
  };

  const handleEndWork = async () => {
    if (!content.trim()) {
      alert("근무 내용을 입력해주세요.");
      return;
    }

    try {
      await endWork({
        content,
      });

      alert("근무가 종료되었습니다.");

      setIsWorking(false);
      setCurrentStartTime(null);
      setEndModalOpen(false);
      setContent("");

      fetchWorkLogs();
    } catch (e: unknown) {
      console.error(e);

      if (axios.isAxiosError(e)) {
        const message = e.response?.data?.message;

        if (message) {
          alert(message);
          return;
        }
      }

      alert("근무 종료에 실패했습니다.");
    }
  };

  const moveMonth = (amount: number) => {
    const nextDate = new Date(year, month - 1 + amount, 1);

    setYear(nextDate.getFullYear());
    setMonth(nextDate.getMonth() + 1);
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

    return `${workHours.toFixed(1)}시간`;
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

  const calendarDays = useMemo(() => {
    const firstDate = new Date(year, month - 1, 1);
    const lastDate = new Date(year, month, 0);

    const firstDay = firstDate.getDay();
    const lastDay = lastDate.getDate();

    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay; day++) {
      days.push(day);
    }

    return days;
  }, [year, month]);

  const dateKey = (day: number) => {
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");

    return `${year}-${mm}-${dd}`;
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">근무일지</h1>
          <p className="text-slate-400 mt-2">
            근무 시작/종료 및 월별 근무 기록을 관리합니다.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            disabled={isWorking}
            onClick={handleStartWork}
            className={`px-5 py-3 rounded-2xl font-semibold transition ${
              isWorking
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-[#3B82F6] text-white hover:bg-blue-500"
            }`}
          >
            근무 시작
          </button>

          <button
            disabled={!isWorking}
            onClick={() => setEndModalOpen(true)}
            className={`px-5 py-3 rounded-2xl font-semibold transition ${
              !isWorking
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-[#1E293B] text-white hover:bg-[#334155]"
            }`}
          >
            근무 종료
          </button>
        </div>
      </div>

      {isWorking && currentStartTime && (
        <div className="mb-6 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl px-5 py-4 text-sm font-medium">
          현재 근무 중입니다. 시작 시각: {formatTime(currentStartTime)}
        </div>
      )}

      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <button
            onClick={() => moveMonth(-1)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            이전 달
          </button>

          <h2 className="text-xl font-bold text-slate-800">
            {year}년 {month}월
          </h2>

          <button
            onClick={() => moveMonth(1)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            다음 달
          </button>
        </div>

        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {["일", "월", "화", "수", "목", "금", "토"].map((dayName) => (
            <div
              key={dayName}
              className="px-4 py-3 text-center text-sm font-semibold text-slate-500"
            >
              {dayName}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[150px] border-r border-b border-slate-100 bg-slate-50/40"
                />
              );
            }

            const key = dateKey(day);
            const logs = logsByDate[key] || [];

            return (
              <div
                key={key}
                className="min-h-[150px] border-r border-b border-slate-100 p-3"
              >
                <div className="text-sm font-semibold text-slate-700 mb-2">
                  {day}
                </div>

                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-xs"
                    >
                      <p className="font-semibold text-slate-700">
                        {formatTime(log.startTime)} ~ {formatTime(log.endTime)}
                      </p>

                      <p className="text-slate-500 mt-1">
                        {formatHours(log.workHours)}
                      </p>

                      {log.status === "COMPLETED" && (
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setContentModalOpen(true);
                          }}
                          className="mt-2 text-blue-600 font-semibold hover:underline"
                        >
                          근무 내용 보기
                        </button>
                      )}

                      {log.status === "WORKING" && (
                        <p className="mt-2 text-emerald-600 font-semibold">
                          근무 중
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {endModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-[520px] bg-white rounded-[28px] p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              근무 종료
            </h2>

            <p className="text-slate-400 text-sm mb-5">
              오늘 진행한 근무 내용을 입력해주세요.
            </p>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="근무 내용을 입력하세요."
              className="w-full h-40 p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEndModalOpen(false);
                  setContent("");
                }}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                취소
              </button>

              <button
                onClick={handleEndWork}
                className="px-5 py-3 rounded-2xl bg-[#1E293B] text-white font-semibold hover:bg-[#334155]"
              >
                근무 종료
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
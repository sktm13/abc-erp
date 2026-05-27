import axios from "axios";
import { useEffect, useState } from "react";

import {
  endWork,
  getCurrentWorkStatus,
  startWork,
} from "../../api/worklogApi";

export default function WorkStartPage() {
  const [isWorking, setIsWorking] = useState(false);
  const [currentStartTime, setCurrentStartTime] = useState<string | null>(null);

  const [endModalOpen, setEndModalOpen] = useState(false);
  const [content, setContent] = useState("");

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

  useEffect(() => {
    fetchCurrent();
  }, []);

  const formatTime = (dateTime: string | null) => {
    if (!dateTime) {
      return "-";
    }

    return dateTime.substring(11, 16);
  };

  const formatDate = (dateTime: string | null) => {
    if (!dateTime) {
      return "-";
    }

    return dateTime.substring(0, 10);
  };

  const handleStartWork = async () => {
    try {
      const result = await startWork();

      setIsWorking(result.working);
      setCurrentStartTime(result.startTime);

      alert("근무가 시작되었습니다.");
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

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 mb-5">
        <h1 className="text-3xl font-bold text-slate-800">근무시작/종료</h1>
        <p className="text-slate-400 mt-1">
          오늘의 근무 시작과 종료를 기록합니다.
        </p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-5">
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-8 flex flex-col justify-between">
          <div>
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

            <div className="mt-8 space-y-3">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-400">근무 날짜</span>
                <span className="font-semibold text-slate-700">
                  {formatDate(currentStartTime)}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-400">시작 시각</span>
                <span className="font-semibold text-slate-700">
                  {formatTime(currentStartTime)}
                </span>
              </div>
            </div>
          </div>

          {isWorking && (
            <div className="bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl px-5 py-4 text-sm font-medium">
              근무 종료 시 오늘 진행한 업무 내용을 입력합니다.
            </div>
          )}
        </div>

        <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-8 flex flex-col justify-center">
          <div className="space-y-4">
            <button
              disabled={isWorking}
              onClick={handleStartWork}
              className={`w-full py-5 rounded-3xl text-lg font-bold transition ${
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
              className={`w-full py-5 rounded-3xl text-lg font-bold transition ${
                !isWorking
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-[#1E293B] text-white hover:bg-[#334155]"
              }`}
            >
              근무 종료
            </button>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            근무 시작 후에는 종료 버튼만 활성화됩니다.
          </p>
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
    </div>
  );
}
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getNoticeDetail, modifyNotice } from "../../api/noticeApi";
import useCustomLogin from "../../hooks/useCustomLogin";
import type { NoticeDetail } from "../../types/notice";

const departmentText = (department?: string | null) => {
  if (department === "DEV") return "개발팀";
  if (department === "HR") return "인사팀";
  if (department === "PUR") return "구매팀";
  if (department === "FIN") return "재무팀";
  if (department === "OPS") return "운영팀";

  return department || "-";
};

export default function NoticeModifyPage() {
  const { noticeId } = useParams();

  const navigate = useNavigate();

  const { loginState } = useCustomLogin();

  const [notice, setNotice] = useState<NoticeDetail | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const fetchNotice = async () => {
    if (!noticeId) {
      return;
    }

    try {
      const result = await getNoticeDetail(Number(noticeId));

      const canManage =
        result.writerEmployeeNo === loginState.employeeNo ||
        loginState.roleNames?.includes("ADMIN");

      if (!canManage) {
        alert("공지사항을 수정할 권한이 없습니다.");
        navigate(`/notice/read/${noticeId}`);
        return;
      }

      setNotice(result);
      setTitle(result.title);
      setContent(result.content);
    } catch (e) {
      console.error(e);
      alert("공지사항을 불러오지 못했습니다.");
      navigate("/notice/all");
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [noticeId]);

  const handleModify = async () => {
    if (!noticeId) {
      return;
    }

    if (!title.trim()) {
      alert("공지 제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("공지 내용을 입력해주세요.");
      return;
    }

    try {
      await modifyNotice(Number(noticeId), {
        title,
        content,
      });

      alert("공지사항이 수정되었습니다.");

      navigate(`/notice/read/${noticeId}`);
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

      alert("공지사항 수정에 실패했습니다.");
    }
  };

  if (!notice) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">공지 수정</h1>
          <p className="text-slate-400 mt-1">
            공지 제목과 내용을 수정합니다.
          </p>
        </div>

        <button
          onClick={() => navigate(`/notice/read/${notice.id}`)}
          className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        >
          상세로
        </button>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col">
        <div className="shrink-0 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              공지 범위
            </label>

            <div className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
              {notice.scope === "ALL"
                ? "전체 공지"
                : `${departmentText(notice.targetDepartment)} 공지`}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              작성자
            </label>

            <div className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
              {notice.writerName}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              제목
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 mt-4 flex flex-col">
          <label className="shrink-0 block text-sm font-medium text-slate-600 mb-2">
            내용
          </label>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-0 w-full p-4 rounded-2xl border border-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="shrink-0 flex justify-end gap-3 pt-5">
          <button
            onClick={() => navigate(`/notice/read/${notice.id}`)}
            className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            취소
          </button>

          <button
            onClick={handleModify}
            className="px-5 py-3 rounded-2xl bg-[#3B82F6] text-white font-semibold hover:bg-blue-500 transition"
          >
            수정 완료
          </button>
        </div>
      </div>
    </div>
  );
}
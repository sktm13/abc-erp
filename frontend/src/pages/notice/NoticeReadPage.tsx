import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  deleteNotice,
  downloadNoticeFile,
  getNoticeDetail,
} from "../../api/noticeApi";
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

const formatDateTime = (dateTime?: string | null) => {
  if (!dateTime) {
    return "-";
  }

  return dateTime.replace("T", " ").substring(0, 16);
};

const isModifiedNotice = (notice: NoticeDetail) => {
  return notice.createdAt !== notice.updatedAt;
};

export default function NoticeReadPage() {
  const { noticeId } = useParams();

  const navigate = useNavigate();

  const { loginState } = useCustomLogin();

  const [notice, setNotice] = useState<NoticeDetail | null>(null);

  const fetchNotice = async () => {
    if (!noticeId) {
      return;
    }

    try {
      const result = await getNoticeDetail(Number(noticeId));

      setNotice(result);
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

      alert("공지사항을 불러오지 못했습니다.");
      navigate("/notice/all");
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [noticeId]);

  const handleDelete = async () => {
    if (!notice) {
      return;
    }

    if (!window.confirm("공지사항을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteNotice(notice.id);

      alert("공지사항이 삭제되었습니다.");

      navigate(
        notice.scope === "ALL"
          ? "/notice/all"
          : "/notice/department"
      );
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

      alert("공지사항 삭제에 실패했습니다.");
    }
  };

  if (!notice) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  const canManageNotice =
    notice.writerEmployeeNo === loginState.employeeNo ||
    loginState.roleNames?.includes("ADMIN");

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            공지 상세
          </h1>

          <p className="text-slate-400 mt-1">
            공지사항의 상세 내용을 확인합니다.
          </p>
        </div>

        <div className="flex gap-3">
          {canManageNotice && (
            <>
              <button
                onClick={() => navigate(`/notice/modify/${notice.id}`)}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                수정
              </button>

              <button
                onClick={handleDelete}
                className="px-5 py-3 rounded-2xl border border-red-100 text-red-500 hover:bg-red-50 transition"
              >
                삭제
              </button>
            </>
          )}

          <button
            onClick={() =>
              navigate(
                notice.scope === "ALL"
                  ? "/notice/all"
                  : "/notice/department"
              )
            }
            className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            목록으로
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="shrink-0 px-7 py-6 border-b border-slate-200">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-slate-800">
              {notice.title}
            </h2>

            {isModifiedNotice(notice) && (
              <span className="text-sm text-slate-400">
                (수정됨. 수정일시: {formatDateTime(notice.updatedAt)})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4 text-sm text-slate-400">
            <span>
              {notice.scope === "ALL"
                ? "전체 공지"
                : `${departmentText(notice.targetDepartment)} 공지`}
            </span>

            <span>·</span>

            <span>작성자 {notice.writerName}</span>

            <span>·</span>

            <span>작성일시 {formatDateTime(notice.createdAt)}</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-7 py-6">
          <div className="min-h-[260px] whitespace-pre-wrap text-slate-700 leading-7">
            {notice.content}
          </div>

          {notice.files.length > 0 && (
            <div className="mt-8 border-t border-slate-200 pt-5">
              <h3 className="font-bold text-slate-700 mb-3">
                첨부파일
              </h3>

              <div className="space-y-2">
                {notice.files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() =>
                      downloadNoticeFile(
                        file.id,
                        file.originalFileName
                      )
                    }
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition text-left"
                  >
                    <span className="font-medium text-slate-600">
                      {file.originalFileName}
                    </span>

                    <span className="text-sm text-blue-500 font-semibold">
                      다운로드
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {notice.files.length === 0 && (
            <div className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-400">
              첨부파일이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
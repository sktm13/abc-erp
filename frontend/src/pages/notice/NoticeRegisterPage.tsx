import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { registerNotice } from "../../api/noticeApi";
import useCustomLogin from "../../hooks/useCustomLogin";
import type { NoticeScope } from "../../types/notice";

const departmentText = (department?: string) => {
  if (department === "DEV") return "개발팀";
  if (department === "HR") return "인사팀";
  if (department === "PUR") return "구매팀";
  if (department === "FIN") return "재무팀";
  if (department === "OPS") return "운영팀";

  return department || "-";
};

export default function NoticeRegisterPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { loginState } = useCustomLogin();

  const canWrite =
    loginState.roleNames?.includes("MANAGER") ||
    loginState.roleNames?.includes("ADMIN");

  const initialScope =
    searchParams.get("scope") === "DEPARTMENT" ? "DEPARTMENT" : "ALL";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scope, setScope] = useState<NoticeScope>(initialScope);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!canWrite) {
      alert("권한이 없습니다.");
      navigate("/notice/all");
    }
  }, [canWrite, navigate]);

  const handleRegister = async () => {
    if (!title.trim()) {
      alert("공지 제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("공지 내용을 입력해주세요.");
      return;
    }

    try {
      const result = await registerNotice(
        {
          title,
          content,
          scope,
          targetDepartment:
            scope === "DEPARTMENT" ? loginState.department : undefined,
        },
        files
      );

      alert("공지사항이 등록되었습니다.");

      navigate(`/notice/read/${result.noticeId}`);
    } catch (e: any) {
      console.error(e);

      const message =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.response?.data ||
        "공지사항 등록에 실패했습니다.";

      alert(message);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleClearFiles = () => {
    setFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">공지 등록</h1>
          <p className="text-slate-400 mt-1">
            팀장 이상 사용자가 공지사항을 등록할 수 있습니다.
          </p>
        </div>

        <button
          onClick={() =>
            navigate(scope === "ALL" ? "/notice/all" : "/notice/department")
          }
          className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        >
          취소
        </button>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col">
        <div className="shrink-0 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              공지 범위
            </label>

            <div className="flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setScope("ALL")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                  scope === "ALL"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                전체 공지
              </button>

              <button
                type="button"
                onClick={() => setScope("DEPARTMENT")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                  scope === "DEPARTMENT"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                부서 공지
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              대상 부서
            </label>

            <div className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
              {scope === "ALL"
                ? "전체 사원"
                : departmentText(loginState.department)}
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
              placeholder="공지 제목을 입력하세요."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              첨부파일
            </label>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="hidden"
            />

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleFileSelect}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition"
                >
                  파일 선택
                </button>

                <div className="flex-1 min-w-0 text-sm text-slate-400">
                  {files.length === 0 ? (
                    <span>첨부된 파일이 없습니다.</span>
                  ) : (
                    <span className="text-slate-600 font-medium">
                      선택된 파일 {files.length}개
                    </span>
                  )}
                </div>

                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearFiles}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 transition"
                  >
                    초기화
                  </button>
                )}
              </div>

              {files.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="px-3 py-2 rounded-xl bg-slate-50 text-sm text-slate-500 truncate"
                    >
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 mt-4 flex flex-col">
          <label className="shrink-0 block text-sm font-medium text-slate-600 mb-2">
            내용
          </label>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="공지 내용을 입력하세요."
            className="flex-1 min-h-0 w-full p-4 rounded-2xl border border-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="shrink-0 flex justify-end gap-3 pt-4">
          <button
            onClick={() =>
              navigate(scope === "ALL" ? "/notice/all" : "/notice/department")
            }
            className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            취소
          </button>

          <button
            onClick={handleRegister}
            className="px-5 py-3 rounded-2xl bg-[#3B82F6] text-white font-semibold hover:bg-blue-500 transition"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}
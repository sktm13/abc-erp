import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllNotices,
  getDepartmentNotices,
} from "../../api/noticeApi";
import useCustomLogin from "../../hooks/useCustomLogin";
import type { NoticeList, NoticeScope } from "../../types/notice";

interface NoticeListPageProps {
  scope: NoticeScope;
}

const PAGE_SIZE = 10;

const departmentText = (department?: string | null) => {
  if (department === "DEV") return "개발팀";
  if (department === "HR") return "인사팀";
  if (department === "PUR") return "구매팀";
  if (department === "FIN") return "재무팀";
  if (department === "OPS") return "운영팀";

  return department || "-";
};

const formatDateTime = (dateTime: string) => {
  return dateTime.replace("T", " ").substring(0, 16);
};

const isModifiedNotice = (notice: NoticeList) => {
  return notice.createdAt !== notice.updatedAt;
};

const formatModifiedText = (updatedAt: string) => {
  return `(수정됨. 수정일시: ${formatDateTime(updatedAt)})`;
};

export default function NoticeListPage({ scope }: NoticeListPageProps) {
  const navigate = useNavigate();

  const { loginState } = useCustomLogin();

  const canWrite =
    loginState.roleNames?.includes("MANAGER") ||
    loginState.roleNames?.includes("ADMIN");

  const [notices, setNotices] = useState<NoticeList[]>([]);
  const [page, setPage] = useState(1);

  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const isAll = scope === "ALL";

  const totalPages = Math.ceil(notices.length / PAGE_SIZE);

  const pageNumList = useMemo(() => {
    if (totalPages === 0) {
      return [];
    }

    return Array.from({ length: totalPages }).map((_, index) => index + 1);
  }, [totalPages]);

  const pagedNotices = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return notices.slice(start, end);
  }, [notices, page]);

  const fetchNotices = async (keywordValue?: string) => {
    try {
      const result = isAll
        ? await getAllNotices(keywordValue)
        : await getDepartmentNotices(keywordValue);

      setNotices(result);
      setPage(1);
    } catch (e) {
      console.error(e);
      alert("공지사항 목록을 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    setKeyword("");
    setSearchKeyword("");
    fetchNotices("");
  }, [scope]);

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();

    setSearchKeyword(trimmedKeyword);
    fetchNotices(trimmedKeyword);
  };

  const handleResetSearch = () => {
    setKeyword("");
    setSearchKeyword("");
    fetchNotices("");
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="shrink-0 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {isAll ? "전체 공지사항" : "부서 공지사항"}
          </h1>

          <p className="text-slate-400 mt-1">
            {isAll
              ? "전체 사원을 대상으로 하는 공지사항입니다."
              : `${departmentText(
                  loginState.department
                )} 대상 공지사항입니다.`}
          </p>
        </div>

        {canWrite && (
          <button
            onClick={() =>
              navigate(
                `/notice/register?scope=${isAll ? "ALL" : "DEPARTMENT"}`
              )
            }
            className="px-5 py-3 rounded-2xl bg-[#3B82F6] text-white font-semibold hover:bg-blue-500 transition"
          >
            + 공지 등록
          </button>
        )}
      </div>

      <div className="shrink-0 mb-4 bg-white rounded-[22px] border border-slate-200 p-4 shadow-sm">
        <div className="flex gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="제목, 내용, 작성자로 검색"
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleSearch}
            className="px-5 py-3 rounded-2xl bg-[#1E293B] text-white font-semibold hover:bg-[#334155] transition"
          >
            검색
          </button>

          <button
            onClick={handleResetSearch}
            className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
          >
            초기화
          </button>
        </div>

        {searchKeyword && (
          <p className="text-sm text-slate-400 mt-3">
            검색어:{" "}
            <span className="font-semibold text-slate-600">
              {searchKeyword}
            </span>
          </p>
        )}
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="shrink-0 grid grid-cols-[90px_1fr_130px_150px_120px] bg-slate-50 border-b border-slate-200 px-5 h-[44px] items-center text-sm font-semibold text-slate-500">
          <div>상태</div>
          <div>제목</div>
          <div>작성자</div>
          <div>작성일</div>
          <div>첨부</div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {pagedNotices.map((notice) => (
            <button
              key={notice.id}
              type="button"
              onClick={() => navigate(`/notice/read/${notice.id}`)}
              className="w-full h-[52px] grid grid-cols-[90px_1fr_130px_150px_120px] items-center px-5 border-b border-slate-100 hover:bg-slate-50 transition text-left"
            >
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    notice.read
                      ? "bg-slate-100 text-slate-500"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {notice.read ? "읽음" : "안읽음"}
                </span>
              </div>

              <div className="min-w-0 flex items-center gap-2">
                <span className="font-semibold text-slate-700 truncate">
                  {notice.title}
                </span>

                {isModifiedNotice(notice) && (
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatModifiedText(notice.updatedAt)}
                  </span>
                )}
              </div>

              <div className="text-sm text-slate-500 truncate">
                {notice.writerName}
              </div>

              <div className="text-sm text-slate-400">
                {formatDateTime(notice.createdAt)}
              </div>

              <div className="text-sm text-slate-500">
                {notice.fileCount > 0 ? `파일 ${notice.fileCount}개` : "-"}
              </div>
            </button>
          ))}

          {notices.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-400">
              {searchKeyword
                ? "검색 결과가 없습니다."
                : "등록된 공지사항이 없습니다."}
            </div>
          )}
        </div>
      </div>

      {totalPages > 0 && (
        <div className="shrink-0 flex justify-center gap-2 mt-4">
          {pageNumList.map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-4 py-2 rounded-xl border ${
                page === num
                  ? "bg-[#1E293B] text-white"
                  : "bg-white text-slate-600"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
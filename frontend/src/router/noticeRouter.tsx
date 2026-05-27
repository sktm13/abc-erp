import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const NoticeAllPage = lazy(() => import("../pages/notice/NoticeAllPage"));
const NoticeDepartmentPage = lazy(
  () => import("../pages/notice/NoticeDepartmentPage")
);

export default function noticeRouter() {
  return {
    path: "notice",
    children: [
      {
        path: "all",
        element: (
          <Suspense fallback={Loading}>
            <NoticeAllPage />
          </Suspense>
        ),
      },
      {
        path: "department",
        element: (
          <Suspense fallback={Loading}>
            <NoticeDepartmentPage />
          </Suspense>
        ),
      },
    ],
  };
}
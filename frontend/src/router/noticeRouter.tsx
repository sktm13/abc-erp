import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const NoticeListPage = lazy(() => import("../pages/notice/NoticeListPage"));
const NoticeReadPage = lazy(() => import("../pages/notice/NoticeReadPage"));
const NoticeRegisterPage = lazy(
  () => import("../pages/notice/NoticeRegisterPage")
);
const NoticeModifyPage = lazy(
  () => import("../pages/notice/NoticeModifyPage")
);

export default function noticeRouter() {
  return {
    path: "notice",
    children: [
      {
        path: "all",
        element: (
          <Suspense fallback={Loading}>
            <NoticeListPage scope="ALL" />
          </Suspense>
        ),
      },
      {
        path: "department",
        element: (
          <Suspense fallback={Loading}>
            <NoticeListPage scope="DEPARTMENT" />
          </Suspense>
        ),
      },
      {
        path: "read/:noticeId",
        element: (
          <Suspense fallback={Loading}>
            <NoticeReadPage />
          </Suspense>
        ),
      },
      {
        path: "modify/:noticeId",
        element: (
          <Suspense fallback={Loading}>
            <NoticeModifyPage />
          </Suspense>
        ),
      },
      {
        path: "register",
        element: (
          <Suspense fallback={Loading}>
            <NoticeRegisterPage />
          </Suspense>
        ),
      },
    ],
  };
}
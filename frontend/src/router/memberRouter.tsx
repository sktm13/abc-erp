import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const MemberListPage = lazy(() => import("../pages/member/MemberListPage"));
const MemberRegisterPage = lazy(
  () => import("../pages/member/MemberRegisterPage")
);
const MemberReadPage = lazy(() => import("../pages/member/MemberReadPage"));
const MemberModifyPage = lazy(
  () => import("../pages/member/MemberModifyPage")
);

export default function memberRouter() {
  return {
    path: "member",
    children: [
      {
        path: "list",
        element: (
          <Suspense fallback={Loading}>
            <MemberListPage />
          </Suspense>
        ),
      },
      {
        path: "register",
        element: (
          <Suspense fallback={Loading}>
            <MemberRegisterPage />
          </Suspense>
        ),
      },
      {
        path: "read/:employeeNo",
        element: (
          <Suspense fallback={Loading}>
            <MemberReadPage />
          </Suspense>
        ),
      },
      {
        path: "modify/:employeeNo",
        element: (
          <Suspense fallback={Loading}>
            <MemberModifyPage />
          </Suspense>
        ),
      },
    ],
  };
}
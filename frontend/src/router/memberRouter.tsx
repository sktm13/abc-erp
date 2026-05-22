import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const MemberListPage = lazy(() => import("../pages/member/MemberListPage"));
const MemberRegisterPage = lazy(
  () => import("../pages/member/MemberRegisterPage")
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
    ],
  };
}
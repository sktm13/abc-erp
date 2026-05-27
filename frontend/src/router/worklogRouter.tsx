import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const WorkStartPage = lazy(() => import("../pages/worklog/WorkStartPage"));
const WorkLogPage = lazy(() => import("../pages/worklog/WorkLogPage"));

export default function worklogRouter() {
  return {
    path: "work",
    children: [
      {
        path: "start",
        element: (
          <Suspense fallback={Loading}>
            <WorkStartPage />
          </Suspense>
        ),
      },
      {
        path: "log",
        element: (
          <Suspense fallback={Loading}>
            <WorkLogPage />
          </Suspense>
        ),
      },
    ],
  };
}
import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const WorkLogPage = lazy(() => import("../pages/worklog/WorkLogPage"));

export default function worklogRouter() {
  return {
    path: "worklog",
    element: (
      <Suspense fallback={Loading}>
        <WorkLogPage />
      </Suspense>
    ),
  };
}
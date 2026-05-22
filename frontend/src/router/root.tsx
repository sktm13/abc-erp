import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

import BasicLayout from "../layouts/BasicLayout";
import memberRouter from "./memberRouter";

const Loading = <div>Loading...</div>;

const MainPage = lazy(() => import("../pages/MainPage"));
const LoginPage = lazy(() => import("../pages/member/LoginPage"));

const router = createBrowserRouter([
  {
    path: "member/login",
    element: (
      <Suspense fallback={Loading}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "",
    Component: BasicLayout,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={Loading}>
            <MainPage />
          </Suspense>
        ),
      },
      memberRouter(),
    ],
  },
]);

export default router;
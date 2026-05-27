import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import BasicLayout from "../layouts/BasicLayout";

import memberRouter from "./memberRouter";
import noticeRouter from "./noticeRouter";
import worklogRouter from "./worklogRouter";
import messengerRouter from "./messengerRouter";

const Loading = <div>Loading...</div>;

const MainPage = lazy(() => import("../pages/MainPage"));
const LoginPage = lazy(() => import("../pages/member/LoginPage"));

const root = createBrowserRouter([
  {
    path: "/member/login",
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
      noticeRouter(),
      memberRouter(),
      worklogRouter(),
      messengerRouter(),
    ],
  },
]);

export default root;
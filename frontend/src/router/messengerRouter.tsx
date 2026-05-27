import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const MessengerPage = lazy(() => import("../pages/messenger/MessengerPage"));

export default function messengerRouter() {
  return {
    path: "messenger",
    element: (
      <Suspense fallback={Loading}>
        <MessengerPage />
      </Suspense>
    ),
  };
}
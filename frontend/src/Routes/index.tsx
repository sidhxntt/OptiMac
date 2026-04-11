import { createHashRouter } from "react-router-dom";
import { ErrorBoundary } from "@/components/CommonLayouts/ErrorBoundary";
import Home from "./Home";

const routes = createHashRouter([
  {
    path: "/",
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "",
        element: <Home />,
      },
    ],
  },
]);

export default routes;
import { createBrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "@/components/CommonLayouts/ErrorBoundary";
import Home from "./Home";

const routes = createBrowserRouter([
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

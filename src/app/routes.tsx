import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { AllInvestors } from "./pages/AllInvestors";
import { NewThisWeek } from "./pages/NewThisWeek";
import { Analytics } from "./pages/Analytics";
import { Saved } from "./pages/Saved";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Onboarding } from "./pages/Onboarding";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  { path: "/onboarding", element: <ProtectedRoute><Onboarding /></ProtectedRoute> },
  {
    path: "/",
    element: <ProtectedRoute><Root /></ProtectedRoute>,
    children: [
      { index: true, Component: AllInvestors },
      { path: "new-this-week", Component: NewThisWeek },
      { path: "analytics", Component: Analytics },
      { path: "saved", Component: Saved },
      { path: "settings", Component: Settings },
    ],
  },
]);

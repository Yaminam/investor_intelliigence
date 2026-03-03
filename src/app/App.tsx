import { RouterProvider } from "react-router";
import { router } from "./routes";
import { InvestorProvider } from "./context/InvestorContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <AuthProvider>
      <InvestorProvider>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" richColors />
      </InvestorProvider>
    </AuthProvider>
  );
}

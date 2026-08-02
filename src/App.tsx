import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import Landing    from "./pages/Landing";
import Auth       from "./pages/Auth";
import Dashboard  from "./pages/Dashboard";
import GroupsList from "./pages/GroupsList";
import GroupDetail from "./pages/GroupDetail";
import AddExpense  from "./pages/AddExpense";
import SettleUp    from "./pages/SettleUp";
import Analytics   from "./pages/Analytics";
import Profile     from "./pages/Profile";

function Protected({ children }: { children: React.ReactNode }) {
  const isAuth = useAppStore(s => s.isAuth);
  return isAuth ? <>{children}</> : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Landing />} />
        <Route path="/auth"    element={<Auth />} />
        <Route path="/app"     element={<Protected><Dashboard /></Protected>} />
        <Route path="/groups"  element={<Protected><GroupsList /></Protected>} />
        <Route path="/groups/:id" element={<Protected><GroupDetail /></Protected>} />
        <Route path="/groups/:id/add" element={<Protected><AddExpense /></Protected>} />
        <Route path="/groups/:id/settle" element={<Protected><SettleUp /></Protected>} />
        <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
        <Route path="/profile"   element={<Protected><Profile /></Protected>} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

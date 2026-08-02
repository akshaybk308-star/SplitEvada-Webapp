import { useLocation, useNavigate } from "react-router-dom";
import { Home, Users, BarChart3, User } from "lucide-react";
import { motion } from "framer-motion";

const TABS = [
  { path: "/app",       icon: Home,      label: "Home" },
  { path: "/groups",    icon: Users,     label: "Groups" },
  { path: "/analytics", icon: BarChart3, label: "Stats" },
  { path: "/profile",   icon: User,      label: "Profile" },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const nav = useNavigate();

  return (
    <nav className="bottom-nav">
      <div className="glass border-t border-white/10 px-2 py-3 flex items-center justify-around">
        {TABS.map(({ path, icon: Icon, label }) => {
          const active = pathname === path || (path !== "/app" && pathname.startsWith(path));
          return (
            <button
              key={path}
              onClick={() => nav(path)}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all relative"
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 gradient-violet rounded-2xl opacity-25"
                />
              )}
              <Icon
                size={22}
                className={`relative z-10 transition-colors ${active ? "text-violet-300" : "text-white/40"}`}
              />
              <span className={`text-[10px] font-medium relative z-10 transition-colors ${active ? "text-violet-300" : "text-white/40"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

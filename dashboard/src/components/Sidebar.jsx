import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: DashboardIcon,
  },
  {
    to: "/transactions/new",
    label: "Make Transaction",
    icon: PlusIcon,
  },
  {
    to: "/transactions",
    label: "Transaction History",
    icon: HistoryIcon,
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside
      className="
        fixed
        left-0
        top-0
        z-30
        hidden
        h-screen
        w-64
        flex-col
        border-r
        border-slate-200
        bg-slate-950
        text-white
        lg:flex
      "
    >

      {/* BRAND */}
      <div className="border-b border-slate-800 px-6 py-6">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              shadow-lg
              shadow-blue-600/30
            "
          >
            <ShieldIcon />
          </div>

          <div>
            <div className="text-sm font-extrabold tracking-wide">
              Payment Risk
            </div>

            <div className="mt-0.5 text-xs text-slate-400">
              Intelligence Platform
            </div>
          </div>

        </div>

      </div>


      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6">

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Navigation
        </p>

        <div className="space-y-2">

          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `
                group
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                font-semibold
                transition-all
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }
                `
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}

        </div>

      </nav>


      {/* USER */}
      <div className="border-t border-slate-800 p-4">

        <div className="mb-3 rounded-xl bg-slate-900 p-3">

          <div className="truncate text-sm font-bold text-white">
            {user?.name || "User"}
          </div>

          <div className="mt-1 truncate text-xs text-slate-400">
            {user?.email || ""}
          </div>

          {user?.role && (
            <span
              className="
                mt-2
                inline-flex
                rounded-md
                bg-blue-500/10
                px-2
                py-1
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-blue-400
              "
            >
              {user.role}
            </span>
          )}

        </div>

        <button
          type="button"
          onClick={logout}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-sm
            font-semibold
            text-slate-400
            transition
            hover:bg-red-500/10
            hover:text-red-400
          "
        >
          <LogoutIcon />
          Log out
        </button>

      </div>

    </aside>
  );
}


/* =========================
   ICONS
========================= */

function ShieldIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2 4 5v6c0 5.5 3.4 9.7 8 11 4.6-1.3 8-5.5 8-11V5l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
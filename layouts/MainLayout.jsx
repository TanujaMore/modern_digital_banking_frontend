import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAlerts } from "../services/alertsService";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const { user, logout } = useAuth();

  const [openProfile, setOpenProfile] = useState(false);
  const [openNotify, setOpenNotify] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const navigate = useNavigate();

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* ================= LOAD ALERTS ================= */
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await getAlerts();
        setAlerts(data.slice(0, 5));
      } catch (err) {
        console.error("Failed to load alerts");
      }
    };

    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-xl">
            🏦
          </div>
          <h1 className="text-lg font-bold">Digital Bank</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <MenuLink to="/dashboard" icon="📊" label="Dashboard" />
          <MenuLink to="/accounts" icon="💳" label="Accounts" />
          <MenuLink to="/transactions" icon="🔁" label="Transactions" />
          <MenuLink to="/budgets" icon="📈" label="Budgets" />
          <MenuLink to="/bills" icon="🧾" label="Bills" />
          <MenuLink to="/rewards" icon="🎁" label="Rewards" />
          <MenuLink to="/insights" icon="📊" label="Insights" />
          <MenuLink to="/alerts" icon="🔔" label="Alerts" />

          <hr className="my-4 border-white/10" />

          <MenuLink to="/settings" icon="⚙️" label="Settings" />
          <MenuLink to="/help" icon="❓" label="Help Center" />
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">
        {/* ================= TOP BAR ================= */}
        <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm">
          {/* SEARCH */}
          <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full w-[420px]">
            🔍
            <input
              type="text"
              placeholder="Search transactions, accounts..."
              className="bg-transparent ml-2 outline-none w-full"
            />
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-6 relative">
            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                onClick={() => setOpenNotify(!openNotify)}
                className="relative text-xl"
              >
                🔔
                {alerts.length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </button>

              {openNotify && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-lg border z-50">
                  <div className="p-4 border-b font-semibold">
                    Notifications
                  </div>

                  {alerts.length === 0 ? (
                    <p className="p-4 text-gray-500 text-sm">
                      No notifications
                    </p>
                  ) : (
                    alerts.map((a) => (
                      <div
                        key={a.id}
                        className="px-4 py-3 text-sm border-b hover:bg-gray-50"
                      >
                        <p className="font-semibold">{a.title}</p>
                        <p className="text-gray-600">{a.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(a.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div className="relative">
              <div
                onClick={() => setOpenProfile(!openProfile)}
                className="flex items-center gap-3 cursor-pointer"
              >
                {/* ✅ ONLY NAME IN TOP BAR */}
                <p className="font-medium">{user?.name}</p>
                <div className="h-10 w-10 rounded-full bg-blue-900 text-white flex items-center justify-center">
                  👤
                </div>
              </div>

              {openProfile && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-lg border p-4 z-50">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    {user?.email}
                  </p>

                  <hr className="my-2" />

                  <button
                    onClick={() => navigate("/settings")}
                    className="block w-full text-left px-2 py-2 rounded hover:bg-gray-100"
                  >
                    ⚙️ Account Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-2 py-2 rounded text-red-600 hover:bg-red-50"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function MenuLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
          isActive
            ? "bg-blue-600/20 text-cyan-400"
            : "hover:bg-white/10 text-gray-300"
        }`
      }
    >
      <span>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

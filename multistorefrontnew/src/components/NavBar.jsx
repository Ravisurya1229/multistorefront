// src/components/NavBar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Menu,
  Package,
  Truck,
  Users,
  Settings,
  LogOut,
  StickyNote,
  ReceiptText,
  QrCode,
  Workflow,
  Store,
  Wrench,
  Building2
} from "lucide-react";

/**
 * NavBar.jsx
 * - Put this at src/components/NavBar.jsx
 * - Usage: <NavBar compact={false} />
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8005/api",
});
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("tenantId");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  if (tenantId) cfg.headers["x-tenant-id"] = tenantId;
  return cfg;
});

const NAV_ITEMS = [
  { to: "/tenant", label: "Tenant", Icon: Building2 },
  { to: "/orders", label: "Orders", Icon: Package },
  { to: "/tat", label: "TAT", Icon: ReceiptText },
  { to: "/pickups", label: "Pickups", Icon: Truck },
  { to: "/users", label: "Users", Icon: Users },
  { to: "/services", label: "Services", Icon: Wrench },
  { to: "/processflow", label: "Process Flow", Icon: Workflow },
  { to: "/qr", label: "QR Units", Icon: QrCode },
  { to: "/notes", label: "Notes", Icon: StickyNote },
  { to: "/stores", label: "Stores", Icon: Store },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export default function NavBar({ compact = false }) {
  const loc = useLocation();
  const [stores, setStores] = useState([]);
  const [currentStoreId, setCurrentStoreId] = useState(localStorage.getItem("storeId") || "");
  const [loadingStores, setLoadingStores] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    // fetch stores for this tenant (tenantId is set during tenant login)
    const load = async () => {
      const tenantId = localStorage.getItem("tenantId");
      if (!tenantId) return;
      setLoadingStores(true);
      setErr("");
      try {
        const res = await api.get("/store");
        // Expect either array or { stores: [...] }
        const list = Array.isArray(res.data) ? res.data : res.data?.stores || [];
        setStores(list);
      } catch (e) {
        setErr("Failed to load stores");
      } finally {
        setLoadingStores(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setCurrentStoreId(localStorage.getItem("storeId") || "");
  }, [loc.pathname]);

  const selectStore = (id) => {
    if (id) {
      localStorage.setItem("storeId", id);
      setCurrentStoreId(id);
      // reload the page or emit an event if you prefer SPA update
      window.location.reload();
    } else {
      localStorage.removeItem("storeId");
      setCurrentStoreId("");
      window.location.reload();
    }
  };

  const renderItem = (item) => {
    const active = loc.pathname === item.to || loc.pathname.startsWith(item.to + "/");
    return (
      <Link
        key={item.to}
        to={item.to}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition ${
          active ? "bg-slate-100 font-medium" : ""
        }`}
        title={item.label}
      >
        <item.Icon size={16} />
        {!compact && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <div className="bg-white rounded-2xl border p-3 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="rounded-full w-9 h-9 grid place-items-center bg-slate-100 text-sm font-semibold">A2</div>
          {!compact && <div className="text-sm font-medium">Laundry CRM</div>}
        </div>
        {!compact && (
          <div className="text-xs text-slate-500">{loadingStores ? "Loading stores..." : stores.length + " stores"}</div>
        )}
      </div>

      <nav className="flex-1 overflow-auto">
        <div className="flex flex-col gap-1">{NAV_ITEMS.map(renderItem)}</div>
      </nav>

      {/* store selector + quick actions */}
      <div className="pt-2 border-t mt-2">
        <div className="text-xs text-slate-500 mb-1">Current store</div>
        <div className="flex gap-2 items-center">
          <select
            value={currentStoreId}
            onChange={(e) => selectStore(e.target.value)}
            className="flex-1 rounded-xl border px-3 py-2 text-sm"
          >
            <option value="">Tenant-wide (no store)</option>
            {stores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.storeName || s.name || s._id}
              </option>
            ))}
          </select>

          {!compact && (
            <button
              onClick={() => {
                // clear store context
                selectStore("");
              }}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
              title="Clear store"
            >
              Clear
            </button>
          )}
        </div>

        {err && <div className="text-xs text-red-600 mt-2">{err}</div>}
      </div>
    </div>
  );
}

// src/dashboard/DashboardApp.jsx

import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/NavBar.jsx";
import * as lucideReact from "lucide-react";

/* -------------------- Axios client -------------------- */
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8005/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("tenantId");
  const storeId = localStorage.getItem("storeId");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenantId) config.headers["x-tenant-id"] = tenantId;
  if (storeId) config.headers["x-store-id"] = storeId;
  return config;
});

/* -------------------- Small layout components -------------------- */
const cls = (...xs) => xs.filter(Boolean).join(" ");

function Shell({ children }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const user = useMemo(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => setOpen((s) => !s)} className="p-2 rounded-xl border hover:bg-slate-100">
            <lucideReact.Menu size={18} />
          </button>
          <h1 className="font-semibold">Multi-Store Laundry CRM</h1>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {user && (
              <>
                <span className="text-slate-500 truncate max-w-[40vw]">{user?.tenant?.name || "Tenant"}</span>
                <button onClick={logout} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border hover:bg-slate-100">
                  <lucideReact.LogOut size={16} /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 px-4 py-4">
        <aside className={cls("col-span-12 md:col-span-3 lg:col-span-2", open ? "" : "hidden md:block")}>
          <NavBar />
        </aside>
        <main className={cls("col-span-12", open ? "md:col-span-9 lg:col-span-10" : "md:col-span-12")}>
          {children}
        </main>
      </div>
    </div>
  );
}

/* -------------------- Guards -------------------- */
function TenantGuard({ children }) {
  const token = localStorage.getItem("token");
  
  if (!token) return <Navigate to="/login" replace />; 
  
  return children;
}

/* -------------------- Tenant Login Page -------------------- */
function TenantLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      const { token, tenant } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("tenantId", tenant?._id || tenant?.id || "");
      localStorage.removeItem("storeId");
      localStorage.setItem("user", JSON.stringify({ tenant }));
      navigate("/tenant", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl border p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2"><lucideReact.UserCircle2 size={20} /> Tenant sign in</h2>
        <div>
          <label className="text-sm text-slate-500">Email</label>
          <input name="email" value={form.email} onChange={onChange} className="w-full mt-1 rounded-xl border px-3 py-2" placeholder="tenant@example.com" />
        </div>
        <div>
          <label className="text-sm text-slate-500">Password</label>
          <input type="password" name="password" value={form.password} onChange={onChange} className="w-full mt-1 rounded-xl border px-3 py-2" placeholder="••••••" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full rounded-xl border px-4 py-2 hover:bg-slate-50 disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button>
        <div className="text-sm text-center">
          <Link to="/login" className="text-blue-600 hover:underline">Are you store staff? Login here.</Link>
        </div>
      </form>
    </div>
  );
}

/* -------------------- Tenant Dashboard (stores + users) -------------------- */
function TenantDashboard() {
  const [tenant, setTenant] = useState(null);
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const tenantId = localStorage.getItem("tenantId");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const me = await api.get("/tenant/me");
        setTenant(me.data);
        const sres = await api.get("/store");
        const storesList = sres.data?.stores || sres.data || [];
        setStores(storesList);
        const allUsers = [];
        for (const st of storesList) {
          try {
            const res = await api.get("/users", { headers: { "x-store-id": st._id } });
            const rows = res.data?.users || [];
            rows.forEach((u) => allUsers.push({ ...u, __store: { id: st._id, name: st.storeName } }));
          } catch (_) { /* ignore per-store failures */ }
        }
        allUsers.sort((a, b) => (a.__store?.name || "").localeCompare(b.__store?.name || "") || (a.name || "").localeCompare(b.name || ""));
        setUsers(allUsers);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load tenant dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [tenantId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-slate-500">Tenant</div>
          <div className="text-xl font-semibold mt-1">{tenant?.name || "—"}</div>
          <div className="text-slate-500 text-sm mt-1">{tenant?.email}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-slate-500">Stores</div>
          <div className="text-2xl font-semibold mt-1">{stores.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-slate-500">Users</div>
          <div className="text-2xl font-semibold mt-1">{users.length}</div>
        </div>
      </div>
      <section className="space-y-2">
        <h3 className="font-semibold">Stores</h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stores.map((st) => (
            <div key={st._id} className="rounded-2xl border bg-white p-4 flex flex-col">
              <div className="font-semibold">{st.storeName}</div>
              <div className="text-sm text-slate-500 line-clamp-2">{st.description || "—"}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => { localStorage.setItem("storeId", st._id); }} className="px-3 py-1.5 rounded-xl border hover:bg-slate-50">Set as current store</button>
                <Link to="/users" className="px-3 py-1.5 rounded-xl border hover:bg-slate-50">View users</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-2">
        <h3 className="font-semibold">All Users in Tenant</h3>
        <div className="overflow-auto rounded-2xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">UserID</th>
                <th className="p-3 text-left">Store</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id + String(u?.__store?.id)} className="border-t">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.phoneNumber}</td>
                  <td className="p-3">{u.userID}</td>
                  <td className="p-3">{u.__store?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* -------------------- Store-scoped pages -------------------- */
function Orders() {
  const [q, setQ] = useState("");
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const fetchOrders = async () => {
    setErr("");
    try {
      const res = await api.get("/orders", { params: { search: q || undefined, startDate: startDate || undefined, endDate: endDate || undefined } });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load orders");
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updatePayment = async (orderId, paymentStatus) => {
    await api.patch(`/orders/updatePaymentStatus/${orderId}`, { paymentStatus });
    fetchOrders();
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input className="rounded-xl border px-3 py-2" placeholder="Search (orderId, name, phone)" value={q} onChange={(e) => setQ(e.target.value)} />
        <input type="date" className="rounded-xl border px-3 py-2" value={startDate} onChange={(e) => setStart(e.target.value)} />
        <input type="date" className="rounded-xl border px-3 py-2" value={endDate} onChange={(e) => setEnd(e.target.value)} />
        <button onClick={fetchOrders} className="rounded-xl border px-4 py-2 hover:bg-slate-50">Filter</button>
      </div>

      {err && <p className="text-red-600 text-sm">{err}</p>}

      <div className="overflow-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Delivery</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="p-3 font-medium">{o.orderId}</td>
                <td className="p-3">{o.name}<div className="text-slate-500 text-xs">{o.phoneNumber}</div></td>
                <td className="p-3">{o.status}</td>
                <td className="p-3">{o.paymentStatus}</td>
                <td className="p-3">{o.delivery ? "Yes" : "No"}</td>
                <td className="p-3 flex flex-wrap gap-2">
                  <button onClick={() => updatePayment(o.orderId, o.paymentStatus === "Completed" ? "Pending" : "Completed")} className="px-3 py-1.5 rounded-xl border hover:bg-slate-50">Toggle Pay</button>
                  <Link to={`/orders/${o.orderId}`} className="px-3 py-1.5 rounded-xl border hover:bg-slate-50">Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersPage() {
  const [rows, setRows] = useState([]);
  const load = async () => { const res = await api.get("/users"); setRows(res.data?.users || []); };
  useEffect(() => { load(); }, []);
  return (
    <div className="overflow-auto rounded-2xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600"><tr>
          <th className="p-3 text-left">Name</th>
          <th className="p-3 text-left">Role</th>
          <th className="p-3 text-left">Phone</th>
          <th className="p-3 text-left">UserID</th>
        </tr></thead>
        <tbody>
          {rows.map(u => (
            <tr key={u._id} className="border-t">
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3">{u.phoneNumber}</td>
              <td className="p-3">{u.userID}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ServicesPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ service_name: "", TAT: 2, products: [] });
  const [newProduct, setNewProduct] = useState({ productName: "", price: 0 });
  const load = async () => { const res = await api.get("/service"); setRows(res.data || []); };
  useEffect(() => { load(); }, []);
  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  const addProduct = () => { if (!newProduct.productName) return; setForm((s) => ({ ...s, products: [...s.products, newProduct] })); setNewProduct({ productName: "", price: 0 }); };
  const create = async () => { await api.post("/service", form); setForm({ service_name: "", TAT: 2, products: [] }); load(); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 overflow-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr>
            <th className="p-3 text-left">Service</th>
            <th className="p-3 text-left">TAT</th>
            <th className="p-3 text-left">Products</th>
          </tr></thead>
          <tbody>
            {rows.map(s => (
              <tr key={s._id} className="border-t">
                <td className="p-3 font-medium">{s.serviceName}</td>
                <td className="p-3">{s.TAT} days</td>
                <td className="p-3">{(s.products || []).map((p) => (<div key={p._id} className="text-xs">{p.productName} — ₹{p.price}</div>))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3">
        <div className="bg-white border rounded-2xl p-4 space-y-2">
          <h3 className="font-semibold">New Service</h3>
          <label className="text-xs text-slate-500">Service Name</label>
          <input name="service_name" value={form.service_name} onChange={onChange} className="w-full rounded-xl border px-3 py-2" />
          <label className="text-xs text-slate-500">TAT (days)</label>
          <input type="number" name="TAT" value={form.TAT} onChange={onChange} className="w-full rounded-xl border px-3 py-2" />
          <div className="border rounded-xl p-3 space-y-2">
            <div className="text-sm font-medium">Products</div>
            <div className="flex gap-2">
              <input placeholder="Name" value={newProduct.productName} onChange={(e) => setNewProduct((s) => ({ ...s, productName: e.target.value }))} className="flex-1 rounded-xl border px-3 py-2" />
              <input placeholder="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct((s) => ({ ...s, price: Number(e.target.value) }))} className="w-28 rounded-xl border px-3 py-2" />
              <button onClick={addProduct} className="rounded-xl border px-3 py-2 hover:bg-slate-50">Add</button>
            </div>
            <ul className="text-xs text-slate-600 list-disc ml-5">
              {form.products.map((p, i) => (<li key={i}>{p.productName} — ₹{p.price}</li>))}
            </ul>
          </div>
          <button onClick={create} className="w-full rounded-xl border px-4 py-2 hover:bg-slate-50">Create</button>
        </div>
      </div>
    </div>
  );
}

function Pickups() {
  const [date, setDate] = useState("");
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    address: "",
    location: "",
    route: "",
    driverId: "",
    timeslot: "09:00-11:00",
    status: "Assigned",
    pickupDate: ""
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const res = await api.get("/pickup", { params: date ? { date } : {} });
      setRows(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load pickups");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const create = async () => {
    setLoading(true);
    try {
      await api.post("/pickup", form);
      setForm({
        customerName: "",
        phoneNumber: "",
        address: "",
        location: "",
        route: "",
        driverId: "",
        timeslot: "09:00-11:00",
        status: "Assigned",
        pickupDate: ""
      });
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to create pickup");
    } finally {
      setLoading(false);
    }
  };

  const reschedule = async (id, newDate) => {
    if (!newDate) return;
    try {
      await api.patch(`/pickup/reschedule/${id}`, { newDate });
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to reschedule");
    }
  };

  const setStatus = async (id, newStatus) => {
    try {
      await api.patch(`/pickup/status/${id}`, { newStatus });
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-3">
        <div className="bg-white border rounded-2xl p-3 flex gap-2 items-center">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border px-3 py-2" />
          <button onClick={load} className="rounded-xl border px-3 py-2 hover:bg-slate-50">Filter</button>
          <div className="ml-auto text-sm text-slate-500">{rows.length} pickups</div>
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <div className="overflow-auto rounded-2xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Route</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3">{p.customerName}<div className="text-xs text-slate-500">{p.phoneNumber}</div></td>
                  <td className="p-3">{p.route}</td>
                  <td className="p-3">{p.pickupDate ? new Date(p.pickupDate).toLocaleString() : new Date(p.date || p.createdAt).toLocaleString()}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3 flex flex-wrap gap-2">
                    {/* <-- THIS IS THE FIX. I changed </H> to </button> --> */}
                    <button onClick={() => setStatus(p._id, p.status === "Completed" ? "Assigned" : "Completed")} className="px-3 py-1.5 rounded-xl border hover:bg-slate-50">Toggle</button>
                    {/* <-- THIS IS THE SECOND FIX. I changed </H> to </button> --> */}
                    <button onClick={() => {
                      const nd = prompt("New date (YYYY-MM-DD)", new Date().toISOString().slice(0, 10));
                      if (nd) reschedule(p._id, nd);
                    }} className="px-3 py-1.5 rounded-xl border hover:bg-slate-50">Reschedule</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white border rounded-2xl p-4 space-y-2">
          <h3 className="font-semibold">New Pickup</h3>

          <label className="text-xs text-slate-500">Name</label>
          <input name="customerName" value={form.customerName} onChange={onChange} className="w-full rounded-xl border px-3 py-2" />

          <label className="text-xs text-slate-500">Phone</label>
          <input name="phoneNumber" value={form.phoneNumber} onChange={onChange} className="w-full rounded-xl border px-3 py-2" />

          <label className="text-xs text-slate-500">Address</label>
          <input name="address" value={form.address} onChange={onChange} className="w-full rounded-xl border px-3 py-2" />

          <label className="text-xs text-slate-500">Route</label>
          <input name="route" value={form.route} onChange={onChange} className="w-full rounded-xl border px-3 py-2" />

          <label className="text-xs text-slate-500">Driver ID (optional)</label>
          <input name="driverId" value={form.driverId} onChange={onChange} className="w-full rounded-xl border px-3 py-2" />

          <label className="text-xs text-slate-500">Pickup Date (YYYY-MM-DD)</label>
          <input name="pickupDate" type="date" value={form.pickupDate} onChange={onChange} className="w-full rounded-xl border px-3 py-2" />

          <button onClick={create} disabled={loading} className="w-full rounded-xl border px-4 py-2 hover:bg-slate-50">
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- App router wrapper -------------------- */
export default function DashboardApp() {
  return (
    <Routes>
      <Route path="/tenant-login" element={<TenantLogin />} />
      <Route path="/tenant" element={<TenantGuard><Shell><TenantDashboard /></Shell></TenantGuard>} />
      <Route path="/orders" element={<TenantGuard><Shell><Orders /></Shell></TenantGuard>} />
      <Route path="/pickups" element={<TenantGuard><Shell><Pickups /></Shell></TenantGuard>} />
      <Route path="/users" element={<TenantGuard><Shell><UsersPage /></Shell></TenantGuard>} />
      <Route path="/services" element={<TenantGuard><Shell><ServicesPage /></Shell></TenantGuard>} />
      
      <Route path="/" element={<Navigate to="/tenant" replace />} />
      <Route path="*" element={<Navigate to="/tenant" replace />} />
    </Routes>
  );
}
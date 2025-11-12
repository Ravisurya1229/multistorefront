import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Package, Truck, Users, Settings, LogOut, StickyNote, ReceiptText, QrCode, Workflow, Store, Wrench, Building2 } from 'lucide-react';

/**
 * NavBar.jsx
 * A compact, responsive navigation component for the dashboard.
 * Drop this file into `src/components/NavBar.jsx` and import it into your Shell layout:
 *   import NavBar from './components/NavBar.jsx';
 * Then replace the current <nav> in Shell with <NavBar onToggleSidebar={...} /> if desired.
 */

export default function NavBar({ compact = false }) {
  const loc = useLocation();
  const nav = [
    { to: '/tenant', label: 'Tenant', icon: <Building2 size={16} /> },
    { to: '/orders', label: 'Orders', icon: <Package size={16} /> },
    { to: '/tat', label: 'TAT', icon: <ReceiptText size={16} /> },
    { to: '/pickups', label: 'Pickups', icon: <Truck size={16} /> },
    { to: '/users', label: 'Users', icon: <Users size={16} /> },
    { to: '/services', label: 'Services', icon: <Wrench size={16} /> },
    { to: '/processflow', label: 'Process Flow', icon: <Workflow size={16} /> },
    { to: '/qr', label: 'QR Units', icon: <QrCode size={16} /> },
    { to: '/notes', label: 'Notes', icon: <StickyNote size={16} /> },
    { to: '/stores', label: 'Stores', icon: <Store size={16} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="bg-white rounded-2xl border p-2">
      <div className="flex flex-col gap-1">
        {nav.map((n) => {
          const active = loc.pathname === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition ${active ? 'bg-slate-100 font-medium' : ''}`}
            >
              <div className="opacity-80">{n.icon}</div>
              {!compact && <span>{n.label}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

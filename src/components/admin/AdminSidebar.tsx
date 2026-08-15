'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
  Home,
  Search,
  Globe,
  Cpu,
  ShieldAlert,
  Megaphone,
  BarChart3,
  FileText,
  Mail,
  Server,
  DollarSign,
  LogOut,
  Menu,
  X,
  Download,
  Activity,
  Layers,
} from 'lucide-react';
import { siteConfig } from '@/config/site';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Site Settings', href: '/admin/settings', icon: Settings },
  { name: 'Monetization', href: '/admin/monetization', icon: DollarSign },
  { name: 'Providers', href: '/admin/providers', icon: Layers },
  { name: 'Job Inspector', href: '/admin/jobs', icon: Activity },
  { name: 'Homepage', href: '/admin/homepage', icon: Home },
  { name: 'SEO Settings', href: '/admin/seo', icon: Search },
  { name: 'Platforms', href: '/admin/platforms', icon: Globe },
  { name: 'Processing', href: '/admin/processing', icon: Cpu },
  { name: 'Security', href: '/admin/security', icon: ShieldAlert },
  { name: 'Ads', href: '/admin/ads', icon: Megaphone },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Legal Content', href: '/admin/legal', icon: FileText },
  { name: 'Contact Info', href: '/admin/contact', icon: Mail },
  { name: 'Announcement', href: '/admin/announcement', icon: Megaphone },
  { name: 'System Status', href: '/admin/system', icon: Server },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64 p-4 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-6 mb-4 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-white text-slate-900 flex items-center justify-center font-black text-xs font-mono">
            y2
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight font-mono lowercase">{siteConfig.name}</span>
            <span className="block text-[10px] uppercase font-semibold text-slate-400">Admin Control</span>
          </div>
        </Link>

        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                isActive
                  ? 'bg-white text-slate-900 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-semibold text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="md:hidden bg-slate-900 text-white p-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm font-mono lowercase">y2matevideo Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 flex-shrink-0">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">{SidebarContent}</div>
        </div>
      )}
    </>
  );
}

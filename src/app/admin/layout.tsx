import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminAuth } from '@/lib/admin/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = verifyAdminAuth();

  // Route check for login page
  const isLoginPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/login');

  if (!session && !isLoginPage) {
    // Redirect unauthenticated requests to login page
    redirect('/admin/login');
  }

  // If rendering login page directly
  if (!session) {
    return <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">{children}</main>
      </div>
    </div>
  );
}

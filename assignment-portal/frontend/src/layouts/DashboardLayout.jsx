import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../components/layout/AppSidebar';

export function DashboardLayout() {
  return (
    <div className="flex h-screen page-bg overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

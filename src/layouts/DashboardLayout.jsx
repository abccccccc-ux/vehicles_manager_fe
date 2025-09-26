import React from 'react';

import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-100 flex">
    <Sidebar />
    <main className="flex-1 p-4">{children}</main>
  </div>
);

export default DashboardLayout;

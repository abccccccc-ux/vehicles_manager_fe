import React from 'react';
import MainLayout from '../layouts/MainLayout';
import VideoPlayer from '../components/VideoPlayer';
import VehicleTable from '../components/VehicleTable';
import ChartStats from '../components/ChartStats';

const Dashboard = () => (
  <MainLayout>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <VideoPlayer src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" />
      <ChartStats />
    </div>
    <VehicleTable />
  </MainLayout>
);

export default Dashboard;

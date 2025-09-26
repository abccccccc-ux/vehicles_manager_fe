import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import VehicleTable from '../components/VehicleTable';

const Vehicles = () => (
  <DashboardLayout>
    <h2 className="text-xl font-bold mb-4">Danh sách xe</h2>
    <VehicleTable />
  </DashboardLayout>
);

export default Vehicles;

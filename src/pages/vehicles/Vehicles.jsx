import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import VehicleTable from '../../components/VehicleTable';

const Vehicles = () => (
  <MainLayout>
    <h2 className="text-xl font-bold mb-4">Danh sách xe</h2>
    <VehicleTable />
  </MainLayout>
);

export default Vehicles;

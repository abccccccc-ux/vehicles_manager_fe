import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '08:00', xe: 2 },
  { name: '09:00', xe: 5 },
  { name: '10:00', xe: 3 },
];

const ChartStats = () => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="xe" stroke="#8884d8" />
    </LineChart>
  </ResponsiveContainer>
);

export default ChartStats;

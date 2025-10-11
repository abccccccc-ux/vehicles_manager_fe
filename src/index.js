import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { configureStore } from '@reduxjs/toolkit';
import vehicleReducer from './store/vehicleSlice';
import authReducer from './store/authSlice';
import departmentReducer from './store/departmentSlice';
import userReducer from './store/userSlice';
import workingHoursReducer from './store/workingHoursSlice';
import App from './App';
import './global.css';

const store = configureStore({
  reducer: {
    vehicle: vehicleReducer,
    auth: authReducer,
    departments: departmentReducer,
    users: userReducer,
    workingHours: workingHoursReducer,
  },
});

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </Provider>
);

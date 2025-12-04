import { configureStore } from '@reduxjs/toolkit';
import vehicleReducer from './vehicleSlice';
import authReducer from './authSlice';
import departmentReducer from './departmentSlice';
import userReducer from './userSlice';
import workingHoursReducer from './workingHoursSlice';
import workingHoursRequestReducer from './workingHoursRequestSlice';
import accessLogReducer from './accessLogSlice';

const store = configureStore({
  reducer: {
    vehicle: vehicleReducer,
    auth: authReducer,
    departments: departmentReducer,
    users: userReducer,
    workingHours: workingHoursReducer,
    workingHoursRequests: workingHoursRequestReducer,
    accessLog: accessLogReducer,
  },
});

export default store;

import { createSlice } from '@reduxjs/toolkit';

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState: {
    list: [],
    loading: false,
  },
  reducers: {
    setVehicles(state, action) {
      state.list = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setVehicles, setLoading } = vehicleSlice.actions;
export default vehicleSlice.reducer;

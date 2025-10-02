import { createSlice } from '@reduxjs/toolkit';


const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState: {
    list: [],
    loading: false,
    selectedVehicle: null,
    detailLoading: false,
  },
  reducers: {
    setVehicles(state, action) {
      state.list = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setSelectedVehicle(state, action) {
      state.selectedVehicle = action.payload;
    },
    setDetailLoading(state, action) {
      state.detailLoading = action.payload;
    },
  },
});

export const { setVehicles, setLoading, setSelectedVehicle, setDetailLoading } = vehicleSlice.actions;
export default vehicleSlice.reducer;

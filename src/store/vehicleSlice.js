import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vehicleApi from '../api/vehicleApi';

// Async thunk to fetch current user's vehicles (personal vehicles)
export const fetchMyVehicles = createAsyncThunk(
  'vehicle/fetchMyVehicles',
  async (params, { rejectWithValue }) => {
    try {
      const data = await vehicleApi.getMyVehicles(params);
      return data; // expected shape: { success, message, data: [...], pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Lỗi khi tải danh sách xe của bạn');
    }
  }
);


const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState: {
    list: [],
    loading: false,
    selectedVehicle: null,
    detailLoading: false,
    // pagination for personal vehicles
    pagination: { current: 1, pageSize: 10, total: 0 },
    search: '',
    error: null,
    currentRequestId: undefined,
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
    setSearch(state, action) {
      state.search = action.payload;
      state.pagination.current = 1;
    },
    setPagination(state, action) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyVehicles.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchMyVehicles.fulfilled, (state, action) => {
        if (state.currentRequestId === action.meta.requestId) {
          state.loading = false;
          // normalize items: add key field
          const items = (action.payload.data || []).map((it) => ({ ...it, key: it._id }));
          state.list = items;
          const pag = action.payload.pagination || {};
          state.pagination = {
            ...state.pagination,
            current: pag.currentPage || state.pagination.current,
            pageSize: pag.itemsPerPage || state.pagination.pageSize,
            total: pag.totalItems || 0,
          };
          state.currentRequestId = undefined;
        }
      })
      .addCase(fetchMyVehicles.rejected, (state, action) => {
        if (state.currentRequestId === action.meta.requestId) {
          state.loading = false;
          state.error = action.payload;
          state.currentRequestId = undefined;
        }
      });
  },
});

export const { setVehicles, setLoading, setSelectedVehicle, setDetailLoading, setSearch, setPagination, clearError } = vehicleSlice.actions;
export default vehicleSlice.reducer;

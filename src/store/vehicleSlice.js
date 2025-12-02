import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vehicleApi from '../api/vehicleApi';

// Async thunk to update a vehicle
export const updateVehicle = createAsyncThunk(
  'vehicle/updateVehicle',
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const data = await vehicleApi.updateVehicle(id, body);
      return data; // expected shape: { success, message, data: { vehicle } }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Lỗi khi cập nhật xe');
    }
  }
);

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

// General vehicles list with filters and pagination
export const fetchVehicles = createAsyncThunk(
  'vehicle/fetchVehicles',
  async (params, { rejectWithValue }) => {
    try {
      const data = await vehicleApi.getVehicles(params);
      return data; // expected: { success, message, data: [...], pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Lỗi khi tải danh sách xe');
    }
  }
);


const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState: {
    list: [],
    loading: false,
      updating: false,
    selectedVehicle: null,
    detailLoading: false,
    error: null,
    // pagination for vehicles list
    pagination: { current: 1, pageSize: 10, total: 0 },
    // filters
    search: '',
    vehicleType: '', // '' means all, values: 'car'|'motorbike'
    status: '', // '' means all, 'active'|'inactive'
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
    setVehicleType(state, action) {
      state.vehicleType = action.payload;
      state.pagination.current = 1;
    },
    setStatus(state, action) {
      state.status = action.payload;
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
      .addCase(updateVehicle.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.updating = false;
        state.error = null;
        const vehicle = action.payload?.data?.vehicle;
        if (vehicle) {
          // replace in list
          state.list = state.list.map((it) => (it._id === vehicle._id ? { ...vehicle, key: vehicle._id } : it));
          // update selectedVehicle if matches
          if (state.selectedVehicle && state.selectedVehicle._id === vehicle._id) {
            state.selectedVehicle = vehicle;
          }
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || action.error?.message;
      });

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

    // handlers for fetchVehicles
    builder
      .addCase(fetchVehicles.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        if (state.currentRequestId === action.meta.requestId) {
          state.loading = false;
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
      .addCase(fetchVehicles.rejected, (state, action) => {
        if (state.currentRequestId === action.meta.requestId) {
          state.loading = false;
          state.error = action.payload;
          state.currentRequestId = undefined;
        }
      });
  },
});

export const {
  setVehicles,
  setLoading,
  setSelectedVehicle,
  setDetailLoading,
  setSearch,
  setVehicleType,
  setStatus,
  setPagination,
  clearError,
} = vehicleSlice.actions;
export default vehicleSlice.reducer;

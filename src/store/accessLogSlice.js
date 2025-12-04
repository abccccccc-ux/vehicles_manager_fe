import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAccessLogs } from '../api/accessLogApi';

// Async thunk để fetch access logs
export const fetchAccessLogs = createAsyncThunk(
  'accessLog/fetchAccessLogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getAccessLogs(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const accessLogSlice = createSlice({
  name: 'accessLog',
  initialState: {
    list: [],
    loading: false,
    error: null,
    selectedAccessLog: null,
    detailLoading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    // Filters
    search: '',
    status: '',
    gateId: '',
    action: '',
    startDate: '',
    endDate: '',
  },
  reducers: {
    setSelectedAccessLog: (state, action) => {
      state.selectedAccessLog = action.payload;
    },
    setDetailLoading: (state, action) => {
      state.detailLoading = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSearch: (state, action) => {
      state.search = action.payload;
      // Reset to first page when search changes
      state.pagination.current = 1;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
      // Reset to first page when filter changes
      state.pagination.current = 1;
    },
    setGateId: (state, action) => {
      state.gateId = action.payload;
      // Reset to first page when filter changes
      state.pagination.current = 1;
    },
    setAction: (state, action) => {
      state.action = action.payload;
      // Reset to first page when filter changes
      state.pagination.current = 1;
    },
    setStartDate: (state, action) => {
      state.startDate = action.payload;
      // Reset to first page when filter changes
      state.pagination.current = 1;
    },
    setEndDate: (state, action) => {
      state.endDate = action.payload;
      // Reset to first page when filter changes
      state.pagination.current = 1;
    },
    clearFilters: (state) => {
      state.search = '';
      state.status = '';
      state.gateId = '';
      state.action = '';
      state.startDate = '';
      state.endDate = '';
      state.pagination.current = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccessLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccessLogs.fulfilled, (state, action) => {
        state.loading = false;
        // Support multiple response shapes.
        // API may return { success, message, data: [...], pagination: { currentPage, totalItems, itemsPerPage, ... } }
        // Or other APIs may return { data: { items: [...], total: ... } }
        const payload = action.payload || {};

        // If payload.data is an array -> use it directly
        if (Array.isArray(payload.data)) {
          state.list = payload.data;
        } else if (payload.data && Array.isArray(payload.data.items)) {
          // In case data contains items
          state.list = payload.data.items;
        } else if (payload.data && Array.isArray(payload.data.accessLogs)) {
          state.list = payload.data.accessLogs;
        } else {
          state.list = [];
        }

        // Pagination: prefer payload.pagination (from backend)
        const pag = payload.pagination || payload.data || {};
        // Map common keys to store.pagination
        state.pagination.total = pag.totalItems || pag.totalCount || pag.total || state.pagination.total || 0;
        state.pagination.current = pag.currentPage || pag.page || state.pagination.current;
        state.pagination.pageSize = pag.itemsPerPage || pag.pageSize || state.pagination.pageSize;
      })
      .addCase(fetchAccessLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch access logs';
      });
  },
});

export const {
  setSelectedAccessLog,
  setDetailLoading,
  setPagination,
  setSearch,
  setStatus,
  setGateId,
  setAction,
  setStartDate,
  setEndDate,
  clearFilters,
} = accessLogSlice.actions;

export default accessLogSlice.reducer;

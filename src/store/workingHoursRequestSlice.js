import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import workingHoursRequestApi from '../api/workingHoursRequestApi';

// Fetch list with params { page, limit, status, requestType, search }
export const fetchWorkingHoursRequests = createAsyncThunk(
  'workingHoursRequests/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const response = await workingHoursRequestApi.getWorkingHoursRequests(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Lỗi khi tải danh sách yêu cầu');
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {
    status: undefined,
    requestType: undefined,
    search: undefined,
  },
};

const workingHoursRequestSlice = createSlice({
  name: 'workingHoursRequests',
  initialState,
  reducers: {
    setPagination(state, action) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.current = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkingHoursRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkingHoursRequests.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.success) {
          state.list = (action.payload.data || []).map((i) => ({ ...i, key: i._id }));
          state.pagination = {
            ...state.pagination,
            total: action.payload.pagination?.totalItems || 0,
            current: action.payload.pagination?.currentPage || state.pagination.current,
            pageSize: action.payload.pagination?.itemsPerPage || state.pagination.pageSize,
          };
        } else {
          state.error = action.payload?.message || 'Lỗi dữ liệu';
        }
      })
      .addCase(fetchWorkingHoursRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      });
  },
});

export const { setPagination, setFilters } = workingHoursRequestSlice.actions;
export default workingHoursRequestSlice.reducer;
